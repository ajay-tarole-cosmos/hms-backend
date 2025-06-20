const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const Subcategory = sequelize.define('Subcategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'FK → categories.id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., Alcoholic, Non-Alcoholic',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL to image (e.g. Cloudinary)',
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Base price for this subcategory, optional',
  }
}, {
  sequelize,
  modelName: 'Subcategory',
  tableName: 'subcategories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});
module.exports = Subcategory;

Subcategory.associate = function (models) {
  Subcategory.belongsTo(models.Category, {
    foreignKey: 'category_id',
    as: 'category',
  });

  Subcategory.hasMany(models.Variant, {
    foreignKey: 'subcategory_id',
    as: 'variants',
    onDelete: 'CASCADE',
  });
};

module.exports = Subcategory;
