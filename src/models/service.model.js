const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/postgres.js");

class Service extends Model { }

Service.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        room_ids: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            defaultValue: [],
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal("NOW()"),
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal("NOW()"),
        },
    },
    {
        sequelize,
        modelName: "Service",
        tableName: "services",
        underscored: true,
        timestamps: false,
    }
)

module.exports = Service;
