const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class ProcurementItem extends Model {}

ProcurementItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    procurement_id: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: {
      //   model: 'procurements',
      //   key: 'id',
      // },
    },
    item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: {
      //   model: 'department_inventory_items',
      //   key: 'id',
      // },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ProcurementItem",
    tableName: "procurement_items",
    timestamps: true,
    underscored: true,
  }
);

// Define associations
ProcurementItem.associate = (models) => {
  ProcurementItem.belongsTo(models.Procurement, {
    foreignKey: 'procurement_id',
    as: 'procurement',
  });

  ProcurementItem.belongsTo(models.InventoryItem, {
    foreignKey: 'item_id',
    as: 'item',
  });
};

module.exports = ProcurementItem;
