import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user/User.js';

const validRoles = ['cliente', 'abogado', 'sysadmin'];

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

export const registerUser = async (req, res) => {
  try {
    const { name, dni, email, password, role } = req.body;

    if (!name || !dni || !email || !password || !role) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'El rol enviado no es valido.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDni = dni.trim();

    const existingEmail = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingEmail) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
    }

    const existingDni = await User.findOne({
      where: {
        dni: normalizedDni,
      },
    });

    if (existingDni) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese DNI.' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      dni: normalizedDni,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: 'Usuario creado correctamente.',
      user: buildSafeUser(newUser),
    });
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
