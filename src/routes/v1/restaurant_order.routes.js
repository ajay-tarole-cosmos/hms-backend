const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/restaurant_order.controller');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const checkStaffPermission = require('../../middlewares/checkResourcePermission');

router.post(
  '/orders',
  authenticateUser,
  checkStaffPermission('restaurant', 'add'),
  orderController.createOrder
);

router.put(
  '/orders/:id',
  authenticateUser,
  checkStaffPermission('restaurant', 'update'),
  orderController.updateOrder
);

router.delete(
  '/orders/:id',
  authenticateUser,
  checkStaffPermission('restaurant', 'delete'),
  orderController.deleteOrder
);

router.post(
  '/orders-list',
  authenticateUser,
  checkStaffPermission('restaurant', 'view'),
  orderController.getAllOrders
);

router.patch(
  '/cancel/:id',
  authenticateUser,
  checkStaffPermission('restaurant', 'update'),
  orderController.cancelOrder
);

router.post(
  '/restaurant-invoice/create',
  authenticateUser,
  checkStaffPermission('restaurant', 'add'),
  orderController.createInvoice
);

router.post(
  '/order-payment',
  authenticateUser,
  checkStaffPermission('restaurant', 'add'),
  orderController.createPayment
);

module.exports = router;

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
 *           schema:
 *             type: object
 *             properties:
 *               table_id:
 *                 type: string
 *                 format: uuid
 *               guest_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               room_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               comment:
 *                 type: string
 *               tip:
 *                 type: number
 *               discount:
 *                 type: number
 *               service_charge:
 *                 type: number
 *               tax:
 *                 type: number
 *               name:
 *                 type: string
 *                 description: Required if guest_id is not provided
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               date_time:
 *                 type: string
 *                 format: date-time
 *               order_items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - subcategory_id
 *                     - quantity
 *                   properties:
 *                     subcategory_id:
 *                       type: string
 *                       format: uuid
 *                     variant_id:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     quantity:
 *                       type: integer
 *                     notes:
 *                       type: string
 *           example:
 *             table_id: "e8f5a89d-872d-456f-8235-123456789abc"
 *             guest_id: "c12345f6-7890-456b-bdef-abcdef123456"
 *             comment: "Extra spicy"
 *             tip: 50
 *             discount: 5
 *             service_charge: 2
 *             tax: 12
 *             order_items:
 *               - subcategory_id: "1a2b3c4d-5e6f-7a8b-9c0d-112233445566"
 *                 variant_id: "aabbccdd-eeff-1122-3344-556677889900"
 *                 quantity: 2
 *                 notes: "No onions"
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     order_id:
 *                       type: string
 *                       format: uuid
 *                     guest_type:
 *                       type: string
 *                     guest_id:
 *                       type: string
 *                       format: uuid
 *             example:
 *               statusCode: 200
 *               success: true
 *               message: "Restaurant order created successfully"
 *               data:
 *                 order_id: "ddee1122-3344-5566-7788-99aabbccddeeff"
 *                 guest_type: "restaurant_guest"
 *                 guest_id: "c12345f6-7890-456b-bdef-abcdef123456"
 */

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

/**
 * @swagger
 * /cancel/{id}:
 *   patch:
 *     summary: Cancel a restaurant order
 *     tags: [RestaurantOrders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the restaurant order to cancel
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order cancelled successfully
 *       400:
 *         description: Order is already cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Order is already cancelled
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Order not found
 *       500:
 *         description: Server error during cancellation
 */


/**
 * @swagger
 * /restaurant-invoice/create:
 *   post:
 *     summary: Create an invoice for a restaurant order
 *     tags: [RestaurantOrders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: string
 *                 format: uuid
 *                 example: "a7b4c8d2-1e9b-4f0c-8233-b32a6b9dc345"
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Invoice created successfully
 *                 data:
 *                   $ref: '#/components/schemas/RestaurantInvoice'
 *       200:
 *         description: Invoice already exists for this order
 *       404:
 *         description: Folio not found for given order
 */

/**
 * @swagger
 * /order-payment:
 *   post:
 *     summary: Create a payment for a restaurant order invoice
 *     tags: [RestaurantOrders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - method
 *               - amount
 *             properties:
 *               order_id:
 *                 type: string
 *                 format: uuid
 *                 example: "a7b4c8d2-1e9b-4f0c-8233-b32a6b9dc345"
 *               method:
 *                 type: string
 *                 example: "cash"
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 500.00
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment recorded successfully
 *                 data:
 *                   $ref: '#/components/schemas/RestaurantPayment'
 *       400:
 *         description: Payment exceeds invoice total
 *       404:
 *         description: Folio not found for given order
 */

