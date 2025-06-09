const { Model } = require('sequelize');
const { sequelize, Sequelize } = require('../config/postgres.js');

const db = {};
db.Guests= require('./guest.model.js');
db.GuestDetail  = require('./GuestDetail.model.js')
db.Room = require('./room.model.js');
db.RoomNumber= require('./roomNumber.model.js');
db.Reservation= require('./reservation.model.js')
db.Payments = require('./payment.model.js');
db.Amenity= require('./Amenity.model.js');
db.Package=require('./package.model.js');
db.RoomPricing = require('./roomPricing.model.js')
db.RoomPackage= require('./roomPackage.model.js')
db.RoomStatusHistory = require('./roomStatusHistory.model.js')
db.Hotels=require('./hotels.model.js')
db.Staff= require('./staff.model.js');
db.BookingLog= require('./bookingLogs.model.js')
db.Service= require('./service.model.js');
db.RoomStatus= require('./roomsStatus.model.js');
db.Invoice = require('./Invoice.model.js');
db.InvoiceItem = require('./InvoiceItem.model.js');
db.Folio = require('./folio.model.js');
db.FolioCharge= require('./folioCharge.model.js')
db.Category = require('./restaurant_category.model.js');
db.Subcategory = require('./restaurant_subcategory.model.js');
db.Variant= require('./restaurant_variant.model.js');
db.RestaurantOrder = require('./restaurant_order.model.js');
db.RestaurantOrderItem = require('./restaurant_order_item.model.js');
db.TableBooking = require('./tableBooking.model.js');
db.RestaurantTable = require('./restaurant_table.model.js')
db.RestaurantUser = require('./restaurants_users.model.js')
db.Department = require('./departments.model.js')
db.DepartmentCategory = require('./department_category.model.js')
db.InventoryItem = require('./department_inventoryitem.model.js')
db.Procurement = require('./procurement.model.js')
db.ProcurementItem = require('./procurementItem.model.js')
//  Call associate AFTER all models are attached to db
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }    
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports  = db;

// if (db.RestaurantOrder && db.RestaurantOrderItem && db.Variant) {
//   db.RestaurantOrder.hasMany(db.RestaurantOrderItem, { foreignKey: 'order_id', as: 'items' });
//   db.RestaurantOrderItem.belongsTo(db.RestaurantOrder, { foreignKey: 'order_id', as: 'order' });
//   db.RestaurantOrderItem.belongsTo(db.Variant, { foreignKey: 'variant_id', as: 'variant' });
// }
// db.Vari