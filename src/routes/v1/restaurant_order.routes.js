const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/restaurant_order.controller');

/**
 * @swagger
 * tags:
 *   name: RestaurantOrders
 *   description: Restaurant Order management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new restaurant order
 *     tags: [RestaurantOrders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             table_id: "uuid-table"
 *             guest_id: "uuid-guest"
 *             comment: "No onions"
 *             tip: 5
 *             discount: 2
 *             service_charge: 1
 *             tax: 1.5
 *             order_items:
 *               - variant_id: "uuid-variant"
 *                 quantity: 2
 *                 unit_price: 10
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             example:
 *               id: "uuid-order"
 *               table_id: "uuid-table"
 *               guest_id: "uuid-guest"
 *               status: "open"
 *               items:
 *                 - id: "uuid-item"
 *                   variant_id: "uuid-variant"
 *                   quantity: 2
 *                   unit_price: 10
 *                   total_price: 20
 *                   variant: { name: "Pizza" }
 */
router.post('/orders', orderController.createOrder);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update a restaurant order
 *     tags: [RestaurantOrders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             comment: "Extra cheese"
 *             tip: 10
 *             order_items:
 *               - variant_id: "uuid-variant"
 *                 quantity: 1
 *                 unit_price: 12
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             example:
 *               id: "uuid-order"
 *               status: "open"
 *               items:
 *                 - id: "uuid-item"
 *                   variant_id: "uuid-variant"
 *                   quantity: 1
 *                   unit_price: 12
 *                   total_price: 12
 *                   variant: { name: "Pizza" }
 */
router.put('/orders/:id', orderController.updateOrder);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete a restaurant order
 *     tags: [RestaurantOrders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted
 *         content:
 *           application/json:
 *             example:
 *               message: "Order deleted"
 */
router.delete('/orders/:id', orderController.deleteOrder);

/**
 * @swagger
 * /orders-list:
 *   post:
 *     summary: Get all restaurant orders (paginated, filter by order_id)
 *     tags: [RestaurantOrders]
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
 *         description: Number of orders per page
 *       - in: query
 *         name: order_id
 *         schema:
 *           type: string
 *         description: Filter by order ID
 *     responses:
 *       200:
 *         description: Paginated list of orders
 *         content:
 *           application/json:
 *             example:
 *               total: 20
 *               page: 1
 *               totalPages: 2
 *               orders:
 *                 - id: "uuid-order"
 *                   table_id: "uuid-table"
 *                   guest_id: "uuid-guest"
 *                   status: "open"
 *                   items:
 *                     - id: "uuid-item"
 *                       variant_id: "uuid-variant"
 *                       quantity: 2
 *                       unit_price: 10
 *                       total_price: 20
 *                       variant: { name: "Pizza" }
 */
router.post('/orders-list', orderController.getAllOrders);

router.patch('/cancel/:id', orderController.cancelOrder);


module.exports = router; 