const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { inventoryConsumptionService } = require('../services');

const generateReport = catchAsync(async (req, res) => {
  const filter = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    departmentId: req.query.departmentId,
    categoryId: req.query.categoryId,
    itemId: req.query.itemId,
    sourceType: req.query.sourceType
  };

  const options = {
    limit: parseInt(req.query.limit, 10),
    offset: parseInt(req.query.offset, 10)
  };

  const report = await inventoryConsumptionService.generateConsumptionReport(filter, options);
  res.send(report);
});

module.exports = {
  generateReport
}; 