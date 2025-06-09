const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const sendResponse = require("../utils/sendResponse");
const { restaurantTableService } = require("../services");

const getAllTables = catchAsync(async (req, res) => {
  const tables = await restaurantTableService.getAllTables(req);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Tables fetched successfully",
    success: true,
    data: tables,
  });
});
const getTableById = catchAsync(async (req, res) => {
  const table = await restaurantTableService.getTableById(req.params.id);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Table fetched successfully",
    success: true,
    data: table,
  });
});

const createTable = catchAsync(async (req, res) => {
  const table = await restaurantTableService.createTable(req.body);
  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Table created successfully",
    success: true,
    data: table,
  });
});

const updateTable = catchAsync(async (req, res) => {
  const updated = await restaurantTableService.updateTable(req.params.id, req.body);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Table updated successfully",
    success: true,
    data: updated,
  });
});

const deleteTable = catchAsync(async (req, res) => {
  await restaurantTableService.deleteTable(req.params.id);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Table deleted successfully",
    success: true,
  });
});

module.exports = {
  getAllTables,
  createTable,
  updateTable,
  deleteTable,
  getTableById
};
