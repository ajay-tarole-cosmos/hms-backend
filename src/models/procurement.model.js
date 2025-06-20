const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class Procurement extends Model {}

Procurement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    department_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    request_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'procurement_requests',
        key: 'id',
      },
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('received', 'completed'),
      defaultValue: 'received',
    },
    received_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    received_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    sequelize,
    modelName: "Procurement",
    tableName: "procurements",
    timestamps: true,
    underscored: true,
  }
);

// Define associations
Procurement.associate = (models) => {
  Procurement.belongsTo(models.Department, {
    foreignKey: 'department_id',
    as: 'department',
  });
  
  Procurement.belongsTo(models.DepartmentCategory, {
    foreignKey: 'category_id',
    as: 'category',
  });
  
  Procurement.belongsTo(models.Staff, {
    foreignKey: 'received_by',
    as: 'receiver',
  });

  Procurement.belongsTo(models.ProcurementRequest, {
    foreignKey: 'request_id',
    as: 'request',
  });
  
  Procurement.hasMany(models.ProcurementItem, {
    foreignKey: 'procurement_id',
    as: 'items',
    onDelete: 'CASCADE',
  });
};

module.exports = Procurement;
