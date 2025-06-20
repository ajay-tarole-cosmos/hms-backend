// controllers/department.controller.js
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');
const service = require('../services/department.service');

exports.create = catchAsync(async (req, res) => {
  const data = await service.create(req.body);
  sendResponse(res, { statusCode: 201, message: 'Department created', data });
});

exports.getAll = catchAsync(async (req, res) => {
  const data = await service.findAll(req);
  sendResponse(res, { statusCode: 200, message: 'Success', data});
});

exports.getOne = catchAsync(async (req, res) => {
  const data = await service.findById(req.params.id, req.user);

  if (!data) {
    return res.status(403).json({ message: 'Access denied or department not found' });
  }

  sendResponse(res, { statusCode: 200, message: 'Success', data });
});


exports.update = catchAsync(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  sendResponse(res, { statusCode: 200, message: 'Department updated', data });
});

exports.remove = catchAsync(async (req, res) => {
  await service.delete(req.params.id);
  sendResponse(res, { statusCode: 204, message: 'Department deleted' });
});
