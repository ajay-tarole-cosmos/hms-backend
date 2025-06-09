const { Op } = require("sequelize");
const { RestaurantTable, TableBooking } = require("../models");
const paginate = require("../models/plugins/paginate.plugin");

const getAllTables = async (req) => {
  const { page, limit, sortBy = [["created_at", "desc"]], datetime } = req.query;
  let baseTime = new Date();

  if (datetime && datetime !== "undefined") {
    baseTime = new Date(datetime)
  }

  const { data: tables, pagination } = await paginate(
    RestaurantTable,
    {},
    { page, limit, sortBy }
  );

  const twoHoursAgo = new Date(baseTime.getTime() - 2 * 60 * 60 * 1000);


  //   if (datetime) {
  //     let status = recentBooking ? "booked" : "available";
  //     updatedTables.push({
  //       ...table.toJSON(), // convert Sequelize model to plain object
  //       status: status,
  //     })
  //   } else {
  //     if (!recentBooking) {
  //       if (table.status === "occupied") {
  //         table.status = "available";
  //         await table.save();
  //         updatedTables.push(table)
  //       }
  //     }
  //   }
  // }
  let updatedTables = [];

for (const table of tables) {
  const recentBooking = await TableBooking.findOne({
    where: {
      table_id: table.id,
      status: "booked",
      booking_time: { [Op.gt]: twoHoursAgo },
    },
  });

  let newStatus;

  if (datetime) {
    // If datetime query param is provided, status depends on booking presence
    newStatus = recentBooking ? "booked" : "available";
  } else {
    // If no datetime, update table status only if currently "occupied" and no recent booking
    if (!recentBooking && table.status === "occupied") {
      table.status = "available";
      await table.save();
      newStatus = "available";
    } else {
      newStatus = table.status;
    }
  }

  updatedTables.push({
    ...table.toJSON(),
    status: newStatus,
  });
}

  console.log("updatedTables,",updatedTables)

  return { data: updatedTables, pagination };
};

const getTableById = async (id) => {
  const table = await RestaurantTable.findByPk(id);
  if (!table) {
    throw new Error("Table not found");
  }
  return table;
};


const createTable = async (tableData) => {
  return RestaurantTable.create(tableData);
};

const updateTable = async (id, data) => {
  const table = await RestaurantTable.findByPk(id);
  if (!table) throw new Error("Table not found");

  table.name = data.name ?? table.name;
  table.status = data.status ?? table.status;
  table.capacity = data.capacity ?? table.capacity;
  table.location = data.location ?? table.location;

  await table.save();
  return table;
};

const deleteTable = async (id) => {
  const table = await RestaurantTable.findByPk(id);
  if (!table) throw new Error("Table not found");
  await table.destroy();
};

module.exports = {
  getAllTables,
  createTable,
  updateTable,
  deleteTable,
  getTableById,
};
