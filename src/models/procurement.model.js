const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class Procurement extends Model {}

Procurement.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  department_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'manager_verified', 'admin_approved', 'rejected'),
    defaultValue: 'pending',
  },
  verified_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  invoice_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  note: DataTypes.TEXT
}, {
  sequelize,
  modelName: "Procurement",
  tableName: "procurements",
  timestamps: true,
});

Procurement.associate = (models) => {
    Procurement.hasMany(models.ProcurementItem, { foreignKey: 'procurement_id', as: 'items' });
}
module.exports = Procurement;
