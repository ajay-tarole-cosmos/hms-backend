// const { DataTypes } = require('sequelize');
// const { sequelize } = require('../config/postgres.js');

// const RestaurantOrder = sequelize.define('RestaurantOrder', {
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true,
//   },
//   table_id: {
//     type: DataTypes.UUID,
//     allowNull: true,
//     comment: 'FK to restaurant_tables.id',
//   },
//   guest_id: {
//     type: DataTypes.UUID,
//     allowNull: true,
//     comment: 'FK to guests.id',
//   },
//   restaurant_user_id: {
//     type: DataTypes.UUID,
//     allowNull: true,
//     comment: 'FK to restaurant_users.id',
//   },
//   status: {
//     type: DataTypes.ENUM('open', 'closed', 'cancelled'),
//     defaultValue: 'open',
//   },
//   comment: {
//     type: DataTypes.TEXT,
//     allowNull: true,
//   },
//   tip: {
//     type: DataTypes.DECIMAL(10, 2),
//     defaultValue: 0.0,
//   },
//   discount: {
//     type: DataTypes.DECIMAL(10, 2),
//     defaultValue: 0.0,
//   },
//   service_charge: {
//     type: DataTypes.DECIMAL(10, 2),
//     defaultValue: 0.0,
//   },
//   tax: {
//     type: DataTypes.DECIMAL(10, 2),
//     defaultValue: 0.0,
//   },
//   total_amount: {
//     type: DataTypes.DECIMAL(10, 2),
//     defaultValue: 0.0,
//   },
//   created_by: {
//     type: DataTypes.UUID,
//     allowNull: true,
//     comment: 'FK to staff.id',
//   },
// }, {
//   sequelize,
//   modelName: 'RestaurantOrder',
//   tableName: 'restaurant_orders',
//   timestamps: true,
//   createdAt: 'created_at',
//   updatedAt: 'updated_at',
// });
// RestaurantOrder.associate = (db) => {
//   RestaurantOrder.belongsTo(db.RestaurantTable, {
//     foreignKey: 'table_id',
//     as: 'table',
//   });

//   RestaurantOrder.belongsTo(db.Guests, {
//     foreignKey: 'guest_id',
//     as: 'guest',
//   });

//   RestaurantOrder.hasMany(db.RestaurantOrderItem, {
//     foreignKey: 'order_id',
//     as: 'items',
//   });

//   RestaurantOrder.hasOne(db.TableBooking, {
//     foreignKey: 'order_id',
//     as: 'booking',
//   });

// RestaurantOrder.belongsTo(db.RestaurantUser, { foreignKey: 'restaurant_user_id', as: 'restaurant_user' });

// };

// module.exports = RestaurantOrder; 
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.js');

const RestaurantOrder = sequelize.define('RestaurantOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  table_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'FK to restaurant_tables.id',
  },
  guest_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'FK to guests.id',
  },
  restaurant_user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'FK to restaurant_users.id',
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'cancelled'),
    defaultValue: 'open',
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tip: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  service_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'FK to staff.id',
  },
}, {
  sequelize,
  modelName: 'RestaurantOrder',
  tableName: 'restaurant_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

RestaurantOrder.associate = (db) => {
  RestaurantOrder.belongsTo(db.RestaurantTable, {
    foreignKey: 'table_id',
    as: 'table',
  });

  RestaurantOrder.belongsTo(db.Guests, {
    foreignKey: 'guest_id',
    as: 'guest',
  });

  RestaurantOrder.belongsTo(db.RestaurantUser, {
    foreignKey: 'restaurant_user_id',
    as: 'restaurant_user',
  });

  RestaurantOrder.hasMany(db.RestaurantOrderItem, {
    foreignKey: 'order_id',
    as: 'items',
  });

  RestaurantOrder.hasOne(db.TableBooking, {
    foreignKey: 'order_id',
    as: 'booking',
  });  
};

module.exports = RestaurantOrder;
