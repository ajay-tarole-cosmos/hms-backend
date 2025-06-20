const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class ProcurementRequestItem extends Model {}

ProcurementRequestItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    procurement_request_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'procurement_requests',
        key: 'id',
      },
    },
    item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    //   references: {
    //     model: 'department_inventory_items',
    //     key: 'id',
    //   },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estimated_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ProcurementRequestItem",
    tableName: "procurement_request_items",
    timestamps: true,
    underscored: true,
  }
);

// Define associations
ProcurementRequestItem.associate = (models) => {
  ProcurementRequestItem.belongsTo(models.ProcurementRequest, {
    foreignKey: 'procurement_request_id',
    as: 'procurementRequest',
  });
  
  ProcurementRequestItem.belongsTo(models.InventoryItem, {
    foreignKey: 'item_id',
    as: 'item',
  });
};

module.exports = ProcurementRequestItem; 