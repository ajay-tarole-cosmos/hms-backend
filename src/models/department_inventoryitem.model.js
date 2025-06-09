const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class InventoryItem extends Model {}

InventoryItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'department_categories',  // ✅ CORRECT TABLE NAME
        key: 'id',
      },
    },    
    department_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'departments',  // ✅ Correct table name
        key: 'id',
      },
    },    
    name: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    description: DataTypes.TEXT,
    quantity: {
      type: DataTypes.INTEGER,
      // allowNull: false,
      defaultValue: 0,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "InventoryItem",
    tableName: "inventory_items",
    timestamps: true,
  }
);

InventoryItem.associate = (models) => {
  InventoryItem.belongsTo(models.Department, {
    foreignKey: "department_id",
    as: "department",
  });

  InventoryItem.belongsTo(models.DepartmentCategory, {
    foreignKey: "category_id",
    as: "category",
  });
};


module.exports = InventoryItem;
