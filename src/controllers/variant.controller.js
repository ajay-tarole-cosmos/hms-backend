const VariantService = require('../services/variant.service');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');
const httpStatus = require('http-status');

exports.createVariant = catchAsync(async (req, res) => {
  const variant = await VariantService.createVariant(req.body);
  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Variant created successfully',
    success: true,
    data: variant,
  });
});

exports.getAllVariants = catchAsync(async (req, res) => {
  const variants = await VariantService.getAllVariants(req);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'All variants retrieved',
    success: true,
    data: variants,
  });
});

exports.getVariantById = catchAsync(async (req, res) => {
  const variant = await VariantService.getVariantById(req.params.id);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Variant retrieved',
    success: true,
    data: variant,
  });
});

exports.getVariantsBySubcategoryId = catchAsync(async (req, res) => {
  const variants = await VariantService.getVariantsBySubcategoryId(req);

  if (!variants || variants.length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'No variants found for the given category ID',
    });
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Variants fetched successfully',
    data: variants,
  });
});

exports.updateVariant = catchAsync(async (req, res) => {
  const variant = await VariantService.updateVariant(req.params.id, req.body);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Variant updated successfully',
    success: true,
    data: variant,
  });
});

exports.deleteVariant = catchAsync(async (req, res) => {
  const result = await VariantService.deleteVariant(req.params.id);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    success: true,
  });
});
