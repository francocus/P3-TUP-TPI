import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user/User.js';

const validRoles = ['cliente', 'abogado', 'sysadmin'];

const adminRoles = ['sysadmin'];

const buildSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  dni: user.dni,
  email: user.email,
  role: user.role,
  active: user.active,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const parseId = (value) => Number.parseInt(value, 10);

const assertAdminRole = (role) => adminRoles.includes(role);

const normalizeUserPayload = (payload) => ({
  name: payload.name?.trim(),
  dni: payload.dni?.trim(),
  email: payload.email?.trim().toLowerCase(),
  role: payload.role,
  active: payload.active,
});

export const registerUser = async (req, res) => {
  try {
    const { name, dni, email, password } = req.body;

    if (!name || !dni || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDni = dni.trim();

    const existingEmail = await User.findOne({ where: { email: normalizedEmail } });
    if (existingEmail) return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });

    const existingDni = await User.findOne({ where: { dni: normalizedDni } });
    if (existingDni) return res.status(409).json({ message: 'Ya existe un usuario con ese DNI.' });

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      dni: normalizedDni,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'cliente',
    });

    return res.status(201).json({ message: 'Usuario creado correctamente.', user: buildSafeUser(newUser) });
  } catch (error) {
    console.log('Error al registrar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contrasena son obligatorios.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Error en las credenciales.' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'El usuario se encuentra inactivo.' });
    }

    const comparison = await bcrypt.compare(password, user.password);

    if (!comparison) {
      return res.status(401).json({ message: 'Error en las credenciales.' });
    }

    const secretKey = process.env.JWT_SECRET || 'programacion3-1C-2026';

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secretKey,
      { expiresIn: '1h' }
    );

    return res.json({
      token,
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.log('Error al iniciar sesion:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const listUsers = async (req, res) => {
  try {
    if (!assertAdminRole(req.user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para ver usuarios.' });
    }

    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      users: users.map(buildSafeUser),
    });
  } catch (error) {
    console.log('Error al obtener usuarios:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const listLawyers = async (req, res) => {
  try {
    const lawyers = await User.findAll({
      where: {
        role: 'abogado',
        active: true,
      },
      order: [['name', 'ASC']],
    });

    return res.json({
      lawyers: lawyers.map(buildSafeUser),
    });
  } catch (error) {
    console.log('Error al obtener abogados:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const listClients = async (req, res) => {
  try {
    const clients = await User.findAll({
      where: {
        role: 'cliente',
        active: true,
      },
      order: [['name', 'ASC']],
    });

    return res.json({
      clients: clients.map(buildSafeUser),
    });
  } catch (error) {
    console.log('Error al obtener clientes:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const getUserById = async (req, res) => {
  try {
    if (!assertAdminRole(req.user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para ver usuarios.' });
    }

    const userId = parseId(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'El id del usuario no es valido.' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    return res.json({ user: buildSafeUser(user) });
  } catch (error) {
    console.log('Error al obtener usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const createAdminUser = async (req, res) => {
  try {
    if (!assertAdminRole(req.user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para crear usuarios.' });
    }

    const { name, dni, email, password, role, active = true } = req.body;

    if (!name || !dni || !email || !password || !role) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'El rol enviado no es valido.' });
    }

    const normalized = normalizeUserPayload({ name, dni, email, role, active });

    const existingEmail = await User.findOne({
      where: { email: normalized.email },
    });

    if (existingEmail) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
    }

    const existingDni = await User.findOne({
      where: { dni: normalized.dni },
    });

    if (existingDni) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese DNI.' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await User.create({
      name: normalized.name,
      dni: normalized.dni,
      email: normalized.email,
      password: hashedPassword,
      role: normalized.role,
      active: Boolean(active),
    });

    return res.status(201).json({
      message: 'Usuario creado correctamente.',
      user: buildSafeUser(createdUser),
    });
  } catch (error) {
    console.log('Error al crear usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (!assertAdminRole(req.user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para modificar usuarios.' });
    }

    const userId = parseId(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'El id del usuario no es valido.' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (req.body.name) {
      user.name = req.body.name.trim();
    }

    if (req.body.dni) {
      const nextDni = req.body.dni.trim();
      const duplicatedDni = await User.findOne({ where: { dni: nextDni } });

      if (duplicatedDni && duplicatedDni.id !== user.id) {
        return res.status(409).json({ message: 'Ya existe un usuario con ese DNI.' });
      }

      user.dni = nextDni;
    }

    if (req.body.email) {
      const nextEmail = req.body.email.trim().toLowerCase();
      const duplicatedEmail = await User.findOne({ where: { email: nextEmail } });

      if (duplicatedEmail && duplicatedEmail.id !== user.id) {
        return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
      }

      user.email = nextEmail;
    }

    if (req.body.role) {
      if (!validRoles.includes(req.body.role)) {
        return res.status(400).json({ message: 'El rol enviado no es valido.' });
      }
      user.role = req.body.role;
    }

    if (req.body.active !== undefined) {
      user.active = Boolean(req.body.active);
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();

    return res.json({
      message: 'Usuario actualizado correctamente.',
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.log('Error al actualizar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!assertAdminRole(req.user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para eliminar usuarios.' });
    }

    const userId = parseId(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'El id del usuario no es valido.' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await user.destroy();

    return res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.log('Error al eliminar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
