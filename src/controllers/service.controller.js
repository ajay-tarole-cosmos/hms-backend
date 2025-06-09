const httpStatus = require("http-status");
const { serviceService } = require("../services");
const catchAsync = require("../utils/catchAsync");
const sendResponse = require("../utils/sendResponse");

const create = catchAsync(async (req, res) => {
    const service = await serviceService.createService(req.body);
    return sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: "Service created successfully",
        success: true,
      });
})

const getAll = catchAsync(async (req, res) => {
    const services = await serviceService.getAllServices();
    return sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Services fetched successfully",
        success: true,
        data:services
      });
})

const getById = catchAsync(async (req, res) => {
    const service = await serviceService.getServiceById(req.params.id);
    return sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Service fetched successfully",
        success: true,
        data:service
      });
})

const update = catchAsync(async (req, res) => {
    const service = await serviceService.updateService(req.params.id, req.body);
    return sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Service updated successfully",
        success: true,
        data:service
      });})

const remove = catchAsync(async (req, res) => {
    const result = await serviceService.deleteService(req.params.id);
    return sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Service deleted successfully",
        success: true,
      });
})

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove,
};
