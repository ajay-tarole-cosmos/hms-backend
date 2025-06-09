const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'e.g., Beverages, Main Course, Desserts',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Category.associate = function (models) {
  Category.hasMany(models.Subcategory, {
    foreignKey: 'category_id',
    as: 'subcategories',
    onDelete: 'CASCADE',
  });
};

module.exports = Category;
