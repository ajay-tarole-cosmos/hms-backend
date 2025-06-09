// controllers/inventoryItem.controller.js
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');
const service = require('../services/inventoryItem.service');
const httpStatus = require('http-status');

exports.create = catchAsync(async (req, res) => {
  const data = await service.create(req.body);
  sendResponse(res, { statusCode: 201, message: 'Item created', data });
});

exports.getAll = catchAsync(async (req, res) => {
  const { data, pagination } = await service.findAll(req.query);
  sendResponse(res, { statusCode: 200, message: 'Success', data, pagination });
});

exports.getInventoryByCategoryId=catchAsync(async (req, res) => {
  const categories = await service.findByCategoryId(req);

  if (!categories || categories.length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'No categories found for the given department ID',
    });
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories fetched successfully',
    data: categories,
  });
});

exports.getOne = catchAsync(async (req, res) => {
  const data = await service.findById(req.params.id);
  sendResponse(res, { statusCode: 200, message: 'Success', data });
});

exports.update = catchAsync(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  sendResponse(res, { statusCode: 200, message: 'Item updated', data });
});

exports.remove = catchAsync(async (req, res) => {
  await service.delete(req.params.id);
  sendResponse(res, { statusCode: 204, message: 'Item deleted' });
});
