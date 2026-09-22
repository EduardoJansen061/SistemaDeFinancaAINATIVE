const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { len: [2, 100] },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  avatar_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  currency: {
    type: DataTypes.ENUM('BRL', 'USD', 'EUR'),
    defaultValue: 'BRL',
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
});

module.exports = User;
