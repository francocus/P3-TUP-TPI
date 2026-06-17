import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  listAvailability,
  listAppointments,
  updateAppointment,
} from '../services/appointment.service.js';

const router = Router();

router.use(verifyToken);

router.get('/', listAppointments);
router.get('/availability', listAvailability);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
