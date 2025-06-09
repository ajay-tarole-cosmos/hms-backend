const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class RestaurantUser extends Model {}

RestaurantUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "RestaurantUser",
    tableName: "restaurant_users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = RestaurantUser;
