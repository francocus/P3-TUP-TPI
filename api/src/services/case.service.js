import { Case } from '../models/case/Case.js';
import { User } from '../models/user/User.js';

const writableRoles = ['sysadmin', 'abogado'];

const buildCaseInclude = [
  {
    model: User,
    as: 'client',
    attributes: ['id', 'name', 'dni', 'email', 'role'],
  },
  {
    model: User,
    as: 'lawyer',
    attributes: ['id', 'name', 'dni', 'email', 'role'],
  },
];

const buildScope = (user) => {
  if (user.role === 'sysadmin') {
    return {};
  }

  if (user.role === 'abogado') {
    return { lawyerId: user.id };
  }

  return { clientId: user.id };
};

const parseId = (value) => Number.parseInt(value, 10);

const assertWritableRole = (role) => writableRoles.includes(role);

export const listCases = async (req, res) => {
  try {
    const cases = await Case.findAll({
      where: buildScope(req.user),
      include: buildCaseInclude,
      order: [['updatedAt', 'DESC']],
    });

    return res.json({ cases });
  } catch (error) {
    console.log('Error al obtener expedientes:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const getCaseById = async (req, res) => {
  try {
    const caseId = parseId(req.params.id);

    if (Number.isNaN(caseId)) {
      return res.status(400).json({ message: 'El id del expediente no es valido.' });
    }

    const legalCase = await Case.findOne({
      where: {
        id: caseId,
        ...buildScope(req.user),
      },
      include: buildCaseInclude,
    });

    if (!legalCase) {
      return res.status(404).json({ message: 'Expediente no encontrado.' });
    }

    return res.json({ case: legalCase });
  } catch (error) {
    console.log('Error al obtener expediente:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const createCase = async (req, res) => {
  try {
    if (!assertWritableRole(req.user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para crear expedientes.' });
    }

    const {
      caseNumber,
      title,
      area,
      status = 'activo',
      startDate,
      lastUpdate,
      description,
      notes,
      clientId,
      lawyerId,
    } = req.body;

    if (!caseNumber || !title || !area || !startDate || !lastUpdate || !description || !clientId) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const normalizedCaseNumber = caseNumber.trim();
    const normalizedTitle = title.trim();
    const normalizedArea = area.trim();
    const normalizedDescription = description.trim();
    const normalizedNotes = notes?.trim() || null;

    const existingCase = await Case.findOne({
      where: { caseNumber: normalizedCaseNumber },
    });

    if (existingCase) {
      return res.status(409).json({ message: 'Ya existe un expediente con ese numero.' });
    }

    const client = await User.findByPk(clientId);
    if (!client || client.role !== 'cliente') {
      return res.status(400).json({ message: 'El cliente indicado no es valido.' });
    }

    const assignedLawyerId = req.user.role === 'abogado' ? req.user.id : lawyerId;
    if (!assignedLawyerId) {
      return res.status(400).json({ message: 'Debe indicar un abogado responsable.' });
    }

    const lawyer = await User.findByPk(assignedLawyerId);
    if (!lawyer || lawyer.role !== 'abogado') {
      return res.status(400).json({ message: 'El abogado indicado no es valido.' });
    }

    const newCase = await Case.create({
      caseNumber: normalizedCaseNumber,
      title: normalizedTitle,
      area: normalizedArea,
      status,
      startDate,
      lastUpdate,
      description: normalizedDescription,
      notes: normalizedNotes,
      clientId: client.id,
      lawyerId: lawyer.id,
    });

    const createdCase = await Case.findByPk(newCase.id, {
      include: buildCaseInclude,
    });

    return res.status(201).json({
      message: 'Expediente creado correctamente.',
      case: createdCase,
    });
  } catch (error) {
    console.log('Error al crear expediente:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const updateCase = async (req, res) => {
  try {
    if (!assertWritableRole(req.user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para modificar expedientes.' });
    }

    const caseId = parseId(req.params.id);

    if (Number.isNaN(caseId)) {
      return res.status(400).json({ message: 'El id del expediente no es valido.' });
    }

    const legalCase = await Case.findOne({
      where: {
        id: caseId,
        ...buildScope(req.user),
      },
    });

    if (!legalCase) {
      return res.status(404).json({ message: 'Expediente no encontrado.' });
    }

    const nextCaseNumber = req.body.caseNumber?.trim();
    if (nextCaseNumber && nextCaseNumber !== legalCase.caseNumber) {
      const duplicatedCase = await Case.findOne({ where: { caseNumber: nextCaseNumber } });
      if (duplicatedCase) {
        return res.status(409).json({ message: 'Ya existe un expediente con ese numero.' });
      }
      legalCase.caseNumber = nextCaseNumber;
    }

    if (req.body.title) legalCase.title = req.body.title.trim();
    if (req.body.area) legalCase.area = req.body.area.trim();
    if (req.body.status) legalCase.status = req.body.status;
    if (req.body.startDate) legalCase.startDate = req.body.startDate;
    if (req.body.lastUpdate) legalCase.lastUpdate = req.body.lastUpdate;
    if (req.body.description) legalCase.description = req.body.description.trim();
    if (req.body.notes !== undefined) legalCase.notes = req.body.notes?.trim() || null;

    if (req.body.clientId) {
      const client = await User.findByPk(req.body.clientId);
      if (!client || client.role !== 'cliente') {
        return res.status(400).json({ message: 'El cliente indicado no es valido.' });
      }
      legalCase.clientId = client.id;
    }

    if (req.body.lawyerId) {
      const lawyer = await User.findByPk(req.body.lawyerId);
      if (!lawyer || lawyer.role !== 'abogado') {
        return res.status(400).json({ message: 'El abogado indicado no es valido.' });
      }
      legalCase.lawyerId = lawyer.id;
    }

    await legalCase.save();

    const updatedCase = await Case.findByPk(legalCase.id, {
      include: buildCaseInclude,
    });

    return res.json({
      message: 'Expediente actualizado correctamente.',
      case: updatedCase,
    });
  } catch (error) {
    console.log('Error al actualizar expediente:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const deleteCase = async (req, res) => {
  try {
    if (!assertWritableRole(req.user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para eliminar expedientes.' });
    }

    const caseId = parseId(req.params.id);

    if (Number.isNaN(caseId)) {
      return res.status(400).json({ message: 'El id del expediente no es valido.' });
    }

    const legalCase = await Case.findOne({
      where: {
        id: caseId,
        ...buildScope(req.user),
      },
    });

    if (!legalCase) {
      return res.status(404).json({ message: 'Expediente no encontrado.' });
    }

    await legalCase.destroy();

    return res.json({ message: 'Expediente eliminado correctamente.' });
  } catch (error) {
    console.log('Error al eliminar expediente:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
