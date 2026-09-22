const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Investment = sequelize.define('Investment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('stocks', 'crypto', 'fixed_income', 'savings', 'real_estate', 'other'),
    allowNull: false,
    defaultValue: 'other',
  },
  ticker: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  amount_invested: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: { min: 0.01 },
  },
  current_value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
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
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'investments',
  timestamps: true,
  underscored: true,
});

module.exports = Investment;
