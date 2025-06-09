const express = require('express');
const router = express.Router();
const tableController = require('../../controllers/restaurant_table.controller');

/**
 * @swagger
 * tags:
 *   name: RestaurantTables
 *   description: Restaurant Table management
 */

/**
 * @swagger
 * /tables/all:
 *   post:
 *     summary: Get all restaurant tables (paginated)
 *     tags: [RestaurantTables]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tables per page
 *     responses:
 *       200:
 *         description: Paginated list of tables
 *         content:
 *           application/json:
 *             example:
 *               total: 42
 *               page: 1
 *               totalPages: 5
 *               tables:
 *                 - id: "uuid-1"
 *                   name: "Table 1"
 *                   status: "available"
 *                   capacity: 4
 *                   location: "Window"
 *                   created_at: "2024-06-01T12:00:00Z"
 *                   updated_at: "2024-06-01T12:00:00Z"
 *                 - id: "uuid-2"
 *                   name: "Table 2"
 *                   status: "occupied"
 *                   capacity: 2
 *                   location: "Patio"
 *                   created_at: "2024-06-01T12:00:00Z"
 *                   updated_at: "2024-06-01T12:00:00Z"
 */
router.post('/tables/all', tableController.getAllTables);
router.post('/table/:id', tableController.getTableById);

/**
 * @swagger
 * /tables:
 *   post:
 *     summary: Create a new restaurant table
 *     tags: [RestaurantTables]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Table 3"
 *             status: "available"
 *             capacity: 6
 *             location: "Center"
 *     responses:
 *       201:
 *         description: Table created
 *         content:
 *           application/json:
 *             example:
 *               id: "uuid-3"
 *               name: "Table 3"
 *               status: "available"
 *               capacity: 6
 *               location: "Center"
 */
router.post('/tables', tableController.createTable);

/**
 * @swagger
 * /tables/{id}:
 *   put:
 *     summary: Update a restaurant table
 *     tags: [RestaurantTables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Table ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Table 1 - Updated"
 *             status: "reserved"
 *             capacity: 4
 *             location: "Window"
 *     responses:
 *       200:
 *         description: Table updated
 *         content:
 *           application/json:
 *             example:
 *               id: "uuid-1"
 *               name: "Table 1 - Updated"
 *               status: "reserved"
 *               capacity: 4
 *               location: "Window"
 */
router.put('/tables/:id', tableController.updateTable);

/**
 * @swagger
 * /tables/{id}:
 *   delete:
 *     summary: Delete a restaurant table
 *     tags: [RestaurantTables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table deleted
 *         content:
 *           application/json:
 *             example:
 *               message: "Table deleted"
 */
router.delete('/tables/:id', tableController.deleteTable);

module.exports = router; 