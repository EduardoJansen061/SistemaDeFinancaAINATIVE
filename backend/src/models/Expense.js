const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: true,
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
  due_day: {
    type: DataTypes.TINYINT,
    allowNull: true,
    validate: { min: 1, max: 31 },
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
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_installment: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  installment_group_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  total_installments: {
    type: DataTypes.TINYINT,
    allowNull: true,
    validate: { min: 2, max: 360 },
  },
  current_installment: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paid_at: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'expenses',
  timestamps: true,
  underscored: true,
});

module.exports = Expense;
