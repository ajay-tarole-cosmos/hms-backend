const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class ProcurementItem extends Model {}

ProcurementItem.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  procurement_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  item_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  remarks: DataTypes.TEXT
}, {
  sequelize,
  modelName: "ProcurementItem",
  tableName: "procurement_items",
  timestamps: true,
});
ProcurementItem.associate = (models) => {
    ProcurementItem.belongsTo(models.Procurement, { foreignKey: 'procurement_id' });
}
module.exports = ProcurementItem;
