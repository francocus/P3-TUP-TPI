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

const app = express();
const port = process.env.PORT || 4000;

try {
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
  );

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, message: 'Backend operativo' });
  });

  app.use('/api/users', userRoutes);
  app.use('/api/cases', caseRoutes);
  app.use('/api/appointments', appointmentRoutes);

  await sequelize.authenticate();
  await sequelize.sync();

  const adminEmail = 'admin@gmail.com';
  const seedUsers = [
    {
      name: 'Administrador General',
      dni: '30000000',
      email: adminEmail,
      password: 'admin123',
      role: 'sysadmin',
    },
    {
      name: 'Abogado Demo',
      dni: '30000001',
      email: 'abogado@gmail.com',
      password: 'abogado123',
      role: 'abogado',
    },
    {
      name: 'Cliente Demo',
      dni: '30000002',
      email: 'cliente@gmail.com',
      password: 'cliente123',
      role: 'cliente',
    },
  ];

  for (const seedUser of seedUsers) {
    const existingUser = await User.findOne({
      where: {
        email: seedUser.email,
      },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(seedUser.password, 10);

      await User.create({
        name: seedUser.name,
        dni: seedUser.dni,
        email: seedUser.email,
        password: hashedPassword,
        role: seedUser.role,
        active: true,
      });
    }
  }

  console.log('Base de datos conectada y sincronizada correctamente.');

  app.listen(port, () => {
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
  });
} catch (error) {
  console.log('Hubo un error al inicializar el backend.');
  console.log(error);
}
