const { RoomNumber } = require("../models")
const { ReportService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const StockLevelReport = require("../reports/stockLevelReport")
const InventoryConsumptionReport = require("../reports/inventoryConsumptionReport")
const ExpenseAnalysisReport = require("../reports/expenseAnalysisReport")
const OperationalPLReport = require("../reports/operationalPLReport")
const UpcomingBookingsReport = require("../reports/upcomingBookingsReport")
const httpStatus = require('http-status');
const { inventoryConsumptionService } = require('../services');
const { getDashboardReport } = require('../services/report.service');

exports.frontOfficeReports = catchAsync(async (req, res) => {
  const { filterType, startDate, endDate } = req.query

  const reports = await  ReportService.getFrontOfficeReports({ filterType, startDate, endDate })

  res.status(200).json({
    success: true,
    message: "Front Office Reports generated",
    data: reports,
  })
})

exports.getRevenueAndFinancialReport = catchAsync(async (req, res) => {
  const { filterType, startDate, endDate } = req.query
  const totalRooms = await RoomNumber.count();

  const report = await ReportService.getFinancialReports({
    filterType,
    startDate,
    endDate,
    totalRooms,
  })

  res.status(200).json({
    success: true,
    message: "Revenue and Financial Report Generated",
    data: report,
  })
})

exports.getPOSReport = catchAsync(async (req, res) => {
    const { filterType, startDate, endDate } = req.query
  
    const report = await ReportService.getPOSReports({
      filterType,
      startDate,
      endDate,
    })
  
    res.status(200).json({
      success: true,
      message: "POS Report Generated",
      data: report,
    })
  })

// New report controllers
exports.getStockLevelReport = catchAsync(async (req, res) => {
    const filters = req.query;
    // const report = await StockLevelReport.generateReport(filters);
    const report = await ReportService.StockLevelReport(filters);

    console.log(report)
    
    res.status(200).json({
        success: true,
        message: "Stock Level Report Generated",
        data: report.data
    });
});

exports.getInventoryConsumptionReport = catchAsync(async (req, res) => {
    const filter = {
        startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
        departmentId: req.query.departmentId,
        categoryId: req.query.categoryId,
        itemId: req.query.itemId,
        sourceType: req.query.sourceType
    };

    const options = {
        limit: parseInt(req.query.limit || 10, 10),
        offset: parseInt(req.query.offset || 0, 10)
    };

    const report = await inventoryConsumptionService.generateConsumptionReport(filter, options);
    
    res.status(200).json({
        success: true,
        message: "Inventory Consumption Report Generated",
        data: report
    });
});

exports.getExpenseAnalysisReport = catchAsync(async (req, res) => {
    const { startDate, endDate, category } = req.query;
    const report = await ReportService.generateExpenseAnalysisReport(
    // const report = await ExpenseAnalysisReport.generateReport(
        new Date(startDate),
        new Date(endDate),
        category
    );
    
    res.status(200).json({
        success: true,
        message: "Expense Analysis Report Generated",
        data: report.data
    });
});

exports.getOperationalPLReport = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    console.log("jsdnd")
    // const report = await OperationalPLReport.generateReport(
      const report = await ReportService.generateOperationalPLReport(new Date(startDate), new Date(endDate));
  
    res.status(200).json({
        success: true,
        message: "Operational P&L Report Generated",
        data: report
    });
});

exports.getUpcomingBookingsReport = catchAsync(async (req, res) => {
    const { daysAhead=30 } = req.query;
    const report = await UpcomingBookingsReport.generateReport(
        parseInt(daysAhead) || 30
    );

    console.log("3333333",report,daysAhead)

    
    res.status(200).json({
        success: true,
        message: "Upcoming Bookings Report Generated",
        data: report.data
    });
});

exports.getDashboard = catchAsync(async (req, res) => {
  try {
    const data = await getDashboardReport();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error generating dashboard report', error: err.message });
  }
});