import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bcrypt from 'bcrypt';
import { sequelize } from './db.js';
import userRoutes from './routes/users.routes.js';
import { User } from './models/user/User.js';

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

  await sequelize.authenticate();
  await sequelize.sync();

  const adminEmail = 'admin@gmail.com';
  const existingAdmin = await User.findOne({
    where: {
      email: adminEmail,
    },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.create({
      name: 'Administrador General',
      dni: '30000000',
      email: adminEmail,
      password: hashedPassword,
      role: 'sysadmin',
      active: true,
    });

    console.log('Cuenta admin inicial creada correctamente.');
  }

  app.listen(port, () => {
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
  });
} catch (error) {
  console.log('Hubo un error al inicializar el backend.');
  console.log(error);
}
