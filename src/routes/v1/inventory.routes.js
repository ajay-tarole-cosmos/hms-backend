const express = require('express');
const inventoryConsumptionController = require('../../controllers/inventoryConsumption.controller');
const { reportController } = require('../../controllers');
const router = express.Router();

// Consumption report routes
router.get('/consumption-report', inventoryConsumptionController.generateReport);

module.exports = router; 