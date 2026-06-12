import { DataTypes } from 'sequelize';
import { sequelize } from '../../db.js';

export const Case = sequelize.define(
  'case',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    caseNumber: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    area: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'activo',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    lastUpdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
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
  },
  {
    timestamps: true,
  }
);
