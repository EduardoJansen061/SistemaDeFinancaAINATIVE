const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MonthlySummary = sequelize.define('MonthlySummary', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  month: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  year: {
    type: DataTypes.SMALLINT,
    allowNull: false,
  },
  total_income_brl: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
  },
  total_expenses_brl: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
  },
  total_investments_brl: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
  },
  balance_brl: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
  },
}, {
  tableName: 'monthly_summaries',
  timestamps: false,
  underscored: true,
  indexes: [
    { unique: true, fields: ['user_id', 'month', 'year'] },
  ],
});

module.exports = MonthlySummary;
