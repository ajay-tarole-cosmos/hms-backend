const express = require("express");
const { reportController } = require("../../controllers");
const { authenticateUser } = require("../../middlewares/authMiddleware");
const checkStaffPermission = require("../../middlewares/checkResourcePermission");

const router = express.Router();

router.post(
  "/front-office-reports",
  authenticateUser,
  checkStaffPermission("reports", "view"),
  reportController.frontOfficeReports
);

router.post(
  "/financial-reports",
  authenticateUser,
  checkStaffPermission("reports", "view"),
  reportController.getRevenueAndFinancialReport
);

router.post(
  "/pos-reports",
  authenticateUser,
  checkStaffPermission("reports", "view"),
  reportController.getPOSReport
);

router.post(
  "/stock-level",
  authenticateUser,
  checkStaffPermission("inventory", "view"),
  reportController.getStockLevelReport
);

router.post(
  "/upcoming-bookings",
  authenticateUser,
  checkStaffPermission("reservation", "view"),
  reportController.getUpcomingBookingsReport
);

router.post(
  "/inventory-consumption",
  authenticateUser,
  checkStaffPermission("inventory", "view"),
  reportController.getInventoryConsumptionReport
);

router.post(
  "/expense-analysis",
  authenticateUser,
  checkStaffPermission("reports", "view"),
  reportController.getExpenseAnalysisReport
);

router.post(
  "/operational-pl",
  authenticateUser,
  checkStaffPermission("reports", "view"),
  reportController.getOperationalPLReport
);

router.post('/dashboard', reportController.getDashboard);

module.exports = router;
