const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExpenseCategory = sequelize.define('ExpenseCategory', {
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
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#6366f1',
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'expense_categories',
  timestamps: true,
  underscored: true,
});

module.exports = ExpenseCategory;
