const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  module: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  setting_key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  setting_value: {
    type: DataTypes.TEXT,
  },
  setting_type: {
    type: DataTypes.STRING,
    defaultValue: 'string',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Settings',
  tableName: 'settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Settings;
