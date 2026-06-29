import { Appointment } from '../models/appointment/Appointment.js';
import { Case } from '../models/case/Case.js';
import { User } from '../models/user/User.js';
import { Op } from 'sequelize';
import { APPOINTMENT_SLOTS } from '../utils/consts/appointmentConsts.js';

const writableRoles = ['sysadmin', 'abogado', 'cliente'];

const buildAppointmentInclude = [
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
  {
    model: Case,
    as: 'case',
    attributes: ['id', 'caseNumber', 'title', 'status'],
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

const computeStatus = (appointment) => {
  if (appointment.status !== "confirmado") return appointment.status;
  const end = new Date(`${appointment.date}T${appointment.time}`);
  return end < new Date() ? "finalizado" : appointment.status;
};

const serializeAppointment = (appointment) => ({
  ...appointment.toJSON(),
  status: computeStatus(appointment),
});

const getAvailableSlots = async (lawyerId, date, appointmentId = null) => {
  const busyAppointments = await Appointment.findAll({
    where: {
      lawyerId,
      date,
      status: {
        [Op.ne]: 'cancelado',
      },
      ...(appointmentId ? { id: { [Op.ne]: appointmentId } } : {}),
    },
    attributes: ['time'],
  });

  const busySlots = new Set(busyAppointments.map((appointment) => appointment.time));
  return APPOINTMENT_SLOTS.filter((slot) => !busySlots.has(slot));
};

const assertAvailableSlot = async (lawyerId, date, time, appointmentId = null) => {
  const availableSlots = await getAvailableSlots(lawyerId, date, appointmentId);
  return availableSlots.includes(time);
};

export const listAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: buildScope(req.user),
      include: buildAppointmentInclude,
      order: [["date", "ASC"], ["time", "ASC"]],
    });

    return res.json({ appointments: appointments.map(serializeAppointment) });
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointmentId = parseId(req.params.id);
    if (Number.isNaN(appointmentId)) {
      return res.status(400).json({ message: "El id del turno no es valido." });
    }

    const appointment = await Appointment.findOne({
      where: { id: appointmentId, ...buildScope(req.user) },
      include: buildAppointmentInclude,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Turno no encontrado." });
    }

    return res.json({ appointment: serializeAppointment(appointment) });
  } catch (error) {
    console.error("Error al obtener turno:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const listAvailability = async (req, res) => {
  try {
    const lawyerId = parseId(req.query.lawyerId);
    const { date } = req.query;

    if (Number.isNaN(lawyerId) || !date) {
      return res.status(400).json({ message: 'Debe indicar abogado y fecha.' });
    }

    const lawyer = await User.findByPk(lawyerId);
    if (!lawyer || lawyer.role !== 'abogado') {
      return res.status(400).json({ message: 'El abogado indicado no es valido.' });
    }

    return res.json({ slots: await getAvailableSlots(lawyerId, date) });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const createAppointment = async (req, res) => {
  try {
    if (!assertWritableRole(req.user.role)) {
      return res
        .status(403)
        .json({ message: "No tiene permisos para crear turnos." });
    }

    const {
      title,
      date,
      time,
      endTime,
      reason,
      status = "pendiente",
      area,
      location,
      notes,
      clientId,
      lawyerId,
      caseId,
    } = req.body;

    if (!title || !date || !time || !reason) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    const assignedClientId =
      req.user.role === "cliente" ? req.user.id : clientId;

    if (!assignedClientId) {
      return res.status(400).json({ message: "Debe indicar un cliente." });
    }

    const client = await User.findByPk(assignedClientId);
    if (!client || client.role !== "cliente") {
      return res
        .status(400)
        .json({ message: "El cliente indicado no es valido." });
    }

    const assignedLawyerId =
      req.user.role === "abogado" ? req.user.id : lawyerId;

    if (!assignedLawyerId) {
      return res.status(400).json({ message: "Debe indicar un abogado." });
    }

    const lawyer = await User.findByPk(assignedLawyerId);
    if (!lawyer || lawyer.role !== "abogado") {
      return res
        .status(400)
        .json({ message: "El abogado indicado no es valido." });
    }

    if (!(await assertAvailableSlot(lawyer.id, date, time))) {
      return res
        .status(409)
        .json({ message: "El horario seleccionado no esta disponible." });
    }

    let linkedCaseId = caseId || null;
    if (linkedCaseId) {
      const linkedCase = await Case.findByPk(linkedCaseId);
      if (!linkedCase) {
        return res
          .status(400)
          .json({ message: "El expediente indicado no existe." });
      }
    }

    const newAppointment = await Appointment.create({
      title: title.trim(),
      date,
      time,
      endTime: endTime?.trim() || null,
      reason: reason.trim(),
      status,
      area: area?.trim() || null,
      location: location?.trim() || null,
      notes: notes?.trim() || null,
      clientId: client.id,
      lawyerId: lawyer.id,
      caseId: linkedCaseId,
    });

    const createdAppointment = await Appointment.findByPk(newAppointment.id, {
      include: buildAppointmentInclude,
    });

    return res.status(201).json({
      message: "Turno creado correctamente.",
      appointment: serializeAppointment(createdAppointment),
    });
  } catch (error) {
    console.log("Error al crear turno:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    if (!assertWritableRole(req.user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para modificar turnos.' });
    }

    const appointmentId = parseId(req.params.id);

    if (Number.isNaN(appointmentId)) {
      return res.status(400).json({ message: 'El id del turno no es valido.' });
    }

    const appointment = await Appointment.findOne({
      where: {
        id: appointmentId,
        ...buildScope(req.user),
      },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado.' });
    }

    if (req.user.role === 'cliente') {
      if (req.body.status !== 'cancelado' || Object.keys(req.body).some((key) => key !== 'status')) {
        return res.status(403).json({ message: 'Solo puede cancelar sus turnos.' });
      }
      appointment.status = 'cancelado';
      await appointment.save();
      const cancelledAppointment = await Appointment.findByPk(appointment.id, {
        include: buildAppointmentInclude,
      });
      return res.json({
        message: 'Turno cancelado correctamente.',
        appointment: cancelledAppointment,
      });
    }

    if (req.body.title) appointment.title = req.body.title.trim();
    const nextLawyerId = req.body.lawyerId || appointment.lawyerId;
    const nextDate = req.body.date || appointment.date;
    const nextTime = req.body.time || appointment.time;
    if (req.body.endTime !== undefined) appointment.endTime = req.body.endTime?.trim() || null;
    if (req.body.reason) appointment.reason = req.body.reason.trim();
    if (req.body.status) appointment.status = req.body.status;
    if (req.body.area !== undefined) appointment.area = req.body.area?.trim() || null;
    if (req.body.location !== undefined) appointment.location = req.body.location?.trim() || null;
    if (req.body.notes !== undefined) appointment.notes = req.body.notes?.trim() || null;

    if (req.body.clientId) {
      const client = await User.findByPk(req.body.clientId);
      if (!client || client.role !== 'cliente') {
        return res.status(400).json({ message: 'El cliente indicado no es valido.' });
      }
      appointment.clientId = client.id;
    }

    if (req.body.lawyerId) {
      const lawyer = await User.findByPk(req.body.lawyerId);
      if (!lawyer || lawyer.role !== 'abogado') {
        return res.status(400).json({ message: 'El abogado indicado no es valido.' });
      }
      appointment.lawyerId = lawyer.id;
    }

    if ((req.body.lawyerId || req.body.date || req.body.time) && !(await assertAvailableSlot(nextLawyerId, nextDate, nextTime, appointment.id))) {
      return res.status(409).json({ message: 'El horario seleccionado no esta disponible.' });
    }

    if (req.body.date) appointment.date = req.body.date;
    if (req.body.time) appointment.time = req.body.time;

    if (req.body.caseId !== undefined) {
      if (req.body.caseId === null || req.body.caseId === '') {
        appointment.caseId = null;
      } else {
        const linkedCase = await Case.findByPk(req.body.caseId);
        if (!linkedCase) {
          return res.status(400).json({ message: 'El expediente indicado no existe.' });
        }
        appointment.caseId = linkedCase.id;
      }
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findByPk(appointment.id, {
      include: buildAppointmentInclude,
    });

    return res.json({
      message: "Turno actualizado correctamente.",
      appointment: serializeAppointment(updatedAppointment),
    });
  } catch (error) {
    console.error('Error al actualizar turno:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'sysadmin') {
      return res.status(403).json({ message: 'No tiene permisos para eliminar turnos.' });
    }

    const appointmentId = parseId(req.params.id);

    if (Number.isNaN(appointmentId)) {
      return res.status(400).json({ message: 'El id del turno no es valido.' });
    }

    const appointment = await Appointment.findOne({
      where: {
        id: appointmentId,
        ...buildScope(req.user),
      },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado.' });
    }

    await appointment.destroy();

    return res.json({ message: 'Turno eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
