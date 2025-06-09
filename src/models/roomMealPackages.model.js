    const { DataTypes, Model } = require("sequelize");
    const { sequelize } = require("../config/postgres.js");

    class RoomMealPackage extends Model {}

    RoomMealPackage.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },

        name: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: "Name of the special offer (e.g., Summer Special)",
        },

        includes: {
          type: DataTypes.ARRAY(DataTypes.TEXT),
          allowNull: false,
          comment: "What's included in the offer (e.g., Room + Breakfast)",
        },

        applicable_room_types: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: false,
          comment: "Room types this offer applies to.",
        },

        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },

        valid_from: {
          type: DataTypes.DATE,
          allowNull: false,
          comment: "Start date for the offer.",
        },

        valid_to: {
          type: DataTypes.DATE,
          allowNull: false,
          comment: "End date for the offer.",
        },
      },
      {
        sequelize,
        modelName: "RoomMealPackage",
        tableName: "room_meal_packages",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

    RoomMealPackage.associate = (models) => {
    };

    module.exports = RoomMealPackage;
