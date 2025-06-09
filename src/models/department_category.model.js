const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class DepartmentCategory extends Model {}

DepartmentCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    department_id: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: {
      //   model: "departments",
      //   key: "id",
      // },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: "DepartmentCategory",
    tableName: "department_categories",
    timestamps: true,
  }
);

DepartmentCategory.associate = (models) => {
  DepartmentCategory.belongsTo(models.Department, {
    foreignKey: "department_id",
    as: "department",
  });

  DepartmentCategory.hasMany(models.InventoryItem, {
    foreignKey: "category_id",
    as: "inventory_items",
  });
};


module.exports = DepartmentCategory;
