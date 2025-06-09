const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');
const httpStatus = require('http-status');
const SubcategoryService = require('../services/subcategory.service');

// CREATE
exports.createSubcategory = catchAsync(async (req, res) => {
  const subcategory = await SubcategoryService.createSubcategory(req.body);
  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Subcategory created successfully',
    success: true,
    data: subcategory,
  });
});

// READ ALL
exports.getAllSubcategories = catchAsync(async (req, res) => {
  const { subcategories, pagination } = await SubcategoryService.getAllSubcategories(req);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'All subcategories fetched successfully',
    success: true,
    data: { subcategories, pagination },
  });
});

// READ ONE
exports.getSubcategoryById = catchAsync(async (req, res) => {
  const subcategory = await SubcategoryService.getSubcategoryById(req.params.id);
  if (!subcategory) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      message: 'Subcategory not found',
      success: false,
    });
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Subcategory fetched successfully',
    success: true,
    data: subcategory,
  });
});

exports.getSubcategoriesByCategoryId = catchAsync(async (req, res) => {
  const subcategories = await SubcategoryService.getSubcategoriesByCategoryId(req);

  if (!subcategories || subcategories.length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'No subcategories found for the given category ID',
    });
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subcategories fetched successfully',
    data: subcategories,
  });
});

// UPDATE
exports.updateSubcategory = catchAsync(async (req, res) => {
  const subcategory = await SubcategoryService.updateSubcategory(req.params.id, req.body);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Subcategory updated successfully',
    success: true,
    data: subcategory,
  });
});

// DELETE
exports.deleteSubcategory = catchAsync(async (req, res) => {
  await SubcategoryService.deleteSubcategory(req.params.id);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Subcategory deleted successfully',
    success: true,
  });
});
