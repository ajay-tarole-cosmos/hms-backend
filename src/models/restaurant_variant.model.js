const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const Variant = sequelize.define('Variant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Optional direct FK → categories.id',
    onDelete: 'CASCADE',
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
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of units available in stock',
  },
  sold: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'If true → item is out of stock',
  },
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

  Variant.belongsTo(models.Category, {
    foreignKey: 'category_id',
    as: 'category',
  });
};

module.exports = Variant;
