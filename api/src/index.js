import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bcrypt from 'bcrypt';
import { sequelize } from './db.js';
import userRoutes from './routes/users.routes.js';
import caseRoutes from './routes/cases.routes.js';
import appointmentRoutes from './routes/appointments.routes.js';
import { User } from './models/user/User.js';
import { Case } from './models/case/Case.js';
import { Appointment } from './models/appointment/Appointment.js';

User.hasMany(Case, {
  foreignKey: 'clientId',
  as: 'clientCases',
});

User.hasMany(Case, {
  foreignKey: 'lawyerId',
  as: 'lawyerCases',
});

Case.belongsTo(User, {
  foreignKey: 'clientId',
  as: 'client',
});

Case.belongsTo(User, {
  foreignKey: 'lawyerId',
  as: 'lawyer',
});

User.hasMany(Appointment, {
  foreignKey: 'clientId',
  as: 'clientAppointments',
});

User.hasMany(Appointment, {
  foreignKey: 'lawyerId',
  as: 'lawyerAppointments',
});

Appointment.belongsTo(User, {
  foreignKey: 'clientId',
  as: 'client',
});

Appointment.belongsTo(User, {
  foreignKey: 'lawyerId',
  as: 'lawyer',
});

Appointment.belongsTo(Case, {
  foreignKey: 'caseId',
  as: 'case',
});

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET no definido en .env');
  process.exit(1);
}

const app = express();
const port = process.env.PORT;

try {
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

  app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Backend operativo' }));

  app.use('/api/users', userRoutes);
  app.use('/api/cases', caseRoutes);
  app.use('/api/appointments', appointmentRoutes);

  await sequelize.authenticate();
  await sequelize.sync();

  console.log('Base de datos conectada y sincronizada correctamente.');

  app.listen(port, () => {
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
  });
} catch (error) {
  console.error('Hubo un error al inicializar el backend.');
  console.error(error);
}