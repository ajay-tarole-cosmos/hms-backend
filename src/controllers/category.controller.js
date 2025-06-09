const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');
const CategoryService = require('../services/category.service');

exports.createCategory = catchAsync(async (req, res) => {
  const category = await CategoryService.createCategory(req);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

exports.getAllCategories = catchAsync(async (req, res) => {
  const categories = await CategoryService.getAllCategories(req);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All categories fetched',
    data: categories,
  });
});

exports.getCategoryById = catchAsync(async (req, res) => {
  const category = await CategoryService.getCategoryById(req.params.id);
  if (!category) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Category not found',
    });
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category fetched successfully',
    data: category,
  });
});

exports.updateCategory = catchAsync(async (req, res) => {
  const category = await CategoryService.updateCategory(req);
  if (!category) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Category not found',
    });
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

exports.deleteCategory = catchAsync(async (req, res) => {
  const category = await CategoryService.deleteCategory(req.params.id);
  if (!category) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Category not found',
    });
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category deleted successfully',
  });
});
