const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const Room = sequelize.define('Room',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        number_of_room: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "Room number like 1,2,3",
        },

        room_type: {
            type: DataTypes.STRING,
            allowNull: false,
            unique:true
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "Detailed description of the room, such as view, amenities, or layout.",
        },

        amenities: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            comment: "List of amenities available in the room (e.g., Wi-Fi, TV, Mini-bar)",
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:1,
            comment: "Per night price in currency unit",
        },

        extra_bed: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        
        room_size: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        bed_count: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "Maximum number of beds avaliable in the room.",
        },

        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "URL of the image representing the room.",
        },

        bed_type: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Type of bed available in the room (e.g., King, Queen, Twin)"
        },
    },
    {
        sequelize,
        modelName: "Room",
        tableName: "rooms",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    })

Room.associate = function (models) {
    Room.hasMany(models.RoomNumber, {
        foreignKey: 'room_id',
        as: 'room',
        onDelete: 'CASCADE',
    });    
    Room.hasMany(models.RoomPricing, {
         foreignKey: 'room_type_id',
         onDelete: 'CASCADE',
         });
    Room.hasMany(models.RoomPackage, { 
        foreignKey: 'room_id',
        as: 'roomPackageLinks',
        onDelete: 'CASCADE',
    });
    Room.belongsToMany(models.Package, {
        through: models.RoomPackage,
        foreignKey: 'room_id',
        as: 'packages',
        onDelete: 'CASCADE',
    });

};


module.exports = Room;
