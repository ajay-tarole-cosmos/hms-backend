const { DataTypes, Model, Op } = require("sequelize");
const { sequelize, Sequelize } = require('../config/postgres.js');

class Hotels extends Model {}

Hotels.init({
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name:{
        type:DataTypes.STRING(70),
        trim: true,
    },
    address:{
        type: DataTypes.TEXT,
        allowNull:true
    },
    city:{
        type: DataTypes.STRING(225),
        allowNull:true
    },
    country:{
        type: DataTypes.STRING(225),
        allowNull:true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull:true,
        validate: {
          isEmail: { msg: "Invalid email" },
        },
      },

      phone: {
        type: DataTypes.STRING(15),
        unique: true,
        allowNull: true,
        set(value) {
          this.setDataValue('phone', value?.trim());
        },
        validate: {
          is: {
            args: /^[+]*[0-9]{1,4}[-\s]?[0-9]{1,14}$/i,
            msg: "Phone number must be valid",
          },
        },
    },
    logo:{
        type: DataTypes.STRING,
        allowNull:true
    },
},
{
    sequelize,
    modelName: "Hotels",
    tableName: "hotels",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });

  Hotels.associate = function(models) {
    // Hotels.hasMany(models.Room, {
    //   foreignKey: 'hotel_id',
    //   onUpdate: 'CASCADE',
    //   as: 'rooms',
    // });   
    Hotels.hasMany(models.Staff, {
      foreignKey: 'hotel_id',
      onUpdate: 'CASCADE',
      as: 'staff',
    });
    
  };
  
module.exports = Hotels;
