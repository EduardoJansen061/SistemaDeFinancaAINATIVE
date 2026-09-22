const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WebhookLog = sequelize.define('WebhookLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  event_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    defaultValue: 'pending',
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'webhook_logs',
  timestamps: true,
  underscored: true,
  updatedAt: false,
});

module.exports = WebhookLog;
