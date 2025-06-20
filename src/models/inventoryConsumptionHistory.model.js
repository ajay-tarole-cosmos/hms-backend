const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

class InventoryConsumptionHistory extends Model {}

InventoryConsumptionHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: {
      //   model: 'inventory_items',
      //   key: 'id',
      // },
    },
    previous_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    new_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    change_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    change_type: {
      type: DataTypes.ENUM('increase', 'decrease'),
      allowNull: false,
    },
    source_type: {
      type: DataTypes.ENUM('procurement', 'manual', 'consumption'),
      allowNull: false,
      defaultValue: 'manual',
    },
    source_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional context about the change (e.g. procurement details, user info)'
    },
    changed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'User ID who made the change'
    },
    reference_number: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Reference number (e.g. invoice number, request number)'
    }
  },
  {
    sequelize,
    modelName: 'InventoryConsumptionHistory',
    tableName: 'inventory_consumption_history',
    timestamps: true,
    underscored: true,
  }
);

// Define associations
InventoryConsumptionHistory.associate = (models) => {
  InventoryConsumptionHistory.belongsTo(models.InventoryItem, {
    foreignKey: 'item_id',
    as: 'item',
  });
  
  // Add association to user if available
  if (models.Staff) {
    InventoryConsumptionHistory.belongsTo(models.Staff, {
      foreignKey: 'changed_by',
      as: 'user',
    });
  }
};

module.exports = InventoryConsumptionHistory;