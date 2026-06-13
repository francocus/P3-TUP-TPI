import { DataTypes } from 'sequelize';
import { sequelize } from '../../db.js';

export const Appointment = sequelize.define(
  'appointment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    endTime: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    area: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(160),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lawyerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    caseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);
