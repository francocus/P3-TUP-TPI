import 'dotenv/config';
import { Sequelize } from 'sequelize';

const dialect = process.env.DB_DIALECT || 'sqlite';

export const sequelize =
  dialect === 'mysql'
    ? new Sequelize(
        process.env.DB_NAME || 'gestor_expedientes',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT || 3306),
          dialect: 'mysql',
          logging: false,
        }
      )
    : new Sequelize({
        dialect: 'sqlite',
        storage: process.env.DB_STORAGE || './gestor_expedientes.db',
        logging: false,
      });
