const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Income = sequelize.define('Income', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('salary', 'extra', 'other'),
    allowNull: false,
    defaultValue: 'other',
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { len: [2, 200] },
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: { min: 0.01 },
  },
  currency: {
    type: DataTypes.ENUM('BRL', 'USD', 'EUR'),
    allowNull: false,
    defaultValue: 'BRL',
  },
  exchange_rate: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 1.0000,
  },
  amount_brl: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  month: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: { min: 1, max: 12 },
  },
  year: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    validate: { min: 2000, max: 2100 },
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  received: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  received_at: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'incomes',
  timestamps: true,
  underscored: true,
});

module.exports = Income;
