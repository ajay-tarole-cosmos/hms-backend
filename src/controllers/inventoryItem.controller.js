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

exports.getInventoryByCategoryId = catchAsync(async (req, res) => {
  const categories = await service.findByCategoryId(req);

  if (!categories || categories.length === 0) {
    return sendResponse(res, {
      statusCode: 404,
      message: 'No inventory items found for this category',
    });
  }

  return sendResponse(res, {
    statusCode: 200,
    message: 'Success',
    data: categories,
  });
});

exports.getOne = catchAsync(async (req, res) => {
  const data = await service.findById(req.params.id);
  if (!data) {
    return sendResponse(res, {
      statusCode: 404,
      message: 'Inventory item not found',
    });
  }
  sendResponse(res, { statusCode: 200, message: 'Success', data });
});

exports.update = catchAsync(async (req, res) => {
  // Extract source information from request
  const sourceInfo = {
    sourceType: 'manual',
    notes: req.body.notes,
    user: { id: req.user?.id },
    metadata: {
      updatedVia: 'web',
      updatedAt: new Date().toISOString(),
      previousQuantity: req.body.previousQuantity,
      reason: req.body.reason || 'Manual update'
    }
  };

  console.log('Updating inventory with source info:', sourceInfo);

  const data = await service.update(req.params.id, req.body, sourceInfo);
  sendResponse(res, { statusCode: 200, message: 'Item updated', data });
});

exports.delete = catchAsync(async (req, res) => {
  await service.delete(req.params.id);
  sendResponse(res, { statusCode: 200, message: 'Item deleted' });
});

exports.recordConsumption = catchAsync(async (req, res) => {
  const { quantity, notes } = req.body;
  const userId = req.user?.id;

  const data = await service.recordConsumption(req.params.id, quantity, userId, notes);
  sendResponse(res, { 
    statusCode: 200, 
    message: 'Consumption recorded successfully', 
    data 
  });
});
