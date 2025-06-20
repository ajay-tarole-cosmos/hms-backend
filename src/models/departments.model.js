const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class Department extends Model {}

Department.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: "Department",
    tableName: "departments",
    timestamps: true,
  }
);

Department.associate = (models) => {
  Department.hasMany(models.DepartmentCategory, {
    foreignKey: "department_id",
    as: "categories",
  });

  Department.hasMany(models.InventoryItem, {
    foreignKey: "department_id",
    as: "inventory_items",
  });
  
  Department.hasMany(models.ProcurementRequest, {
    foreignKey: "department_id",
    as: "procurementRequest",
  });
};


module.exports = Department;
