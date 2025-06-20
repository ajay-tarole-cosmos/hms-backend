const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const Variant = sequelize.define('Variant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  subcategory_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'FK → subcategories.id',
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., Large, Mango, Combo Pack',
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Optional: Small, Medium, Large',
  },
  flavor: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Optional: Mango, Vanilla, etc.',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'Variant',
  tableName: 'variants',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Variant.associate = function (models) {
  Variant.belongsTo(models.Subcategory, {
    foreignKey: 'subcategory_id',
    as: 'subcategory',
  });
};

module.exports = Variant;
