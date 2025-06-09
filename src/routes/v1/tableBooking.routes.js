const express = require('express');
const router = express.Router();
const tableBookingController = require('../../controllers/tableBooking.controller');

/**
 * @swagger
 * tags:
 *   name: TableBooking
 *   description: Restaurant Table Booking management
 */

/**
 * @swagger
 * /table-bookings:
 *   post:
 *     summary: Book a restaurant table (with or without order)
 *     tags: [TableBooking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             table_id: "uuid-table"
 *             guest_id: "uuid-guest" # or null for walk-in
 *             walkin_name: "Walk-in Guest" # optional
 *             booking_time: "2024-06-01T12:00:00Z"
 *             order_items:
 *               - variant_id: "uuid-variant"
 *                 quantity: 2
 *                 unit_price: 10.0
 *     responses:
 *       201:
 *         description: Table booked
 *         content:
 *           application/json:
 *             example:
 *               id: "uuid-booking"
 *               table_id: "uuid-table"
 *               guest_id: "uuid-guest"
 *               walkin_name: null
 *               booking_time: "2024-06-01T12:00:00Z"
 *               status: "booked"
 *               order_id: "uuid-order"
 */
router.post('/table-bookings', tableBookingController.bookTable);

/**
 * @swagger
 * /tables/{id}/status:
 *   post:
 *     summary: Get table status (free/available/occupied)
 *     tags: [TableBooking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table status
 *         content:
 *           application/json:
 *             example:
 *               id: "uuid-table"
 *               name: "Table 1"
 *               status: "available"
 */
router.post('/tables/:id/status', tableBookingController.getTableStatus);

/**
 * @swagger
 * /table-bookings-list:
 *   post:
 *     summary: List all table bookings
 *     tags: [TableBooking]
 *     parameters:
 *       - in: query
 *         name: table_id
 *         schema:
 *           type: string
 *         description: Filter by table ID
 *       - in: query
 *         name: guest_id
 *         schema:
 *           type: string
 *         description: Filter by guest ID
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             example:
 *               - id: "uuid-booking"
 *                 table_id: "uuid-table"
 *                 guest_id: "uuid-guest"
 *                 walkin_name: null
 *                 booking_time: "2024-06-01T12:00:00Z"
 *                 status: "booked"
 *                 order_id: "uuid-order"
 */
router.post('/table-bookings-list', tableBookingController.listBookings);

/**
 * @swagger
 * /table-bookings/{id}:
 *   put:
 *     summary: Update a table booking (time, guest, etc.)
 *     tags: [TableBooking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             booking_time: "2023-06-05T14:00:00Z"
 *             guest_id: "new-guest-id"
 *             walkin_name: "Updated Name"
 *             order_items:
 *               - variant_id: "13b39780-be76-4829-a42b-7b1291e744bb"
 *                 quantity: 1
 *                 unit_price: 10
 *     responses:
 *       200:
 *         description: Booking updated
 *         content:
 *           application/json:
 *             example:
 *               id: "uuid-booking"
 *               table_id: "uuid-table"
 *               guest_id: "new-guest-id"
 *               walkin_name: "Updated Name"
 *               booking_time: "2023-06-05T14:00:00Z"
 *               status: "booked"
 *               order_id: "uuid-order"
 */
router.put('/table-bookings/:id', tableBookingController.updateTableBooking);

/**
 * @swagger
 * /table-bookings/{id}/cancel:
 *   post:
 *     summary: Cancel a table booking
 *     tags: [TableBooking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled
 *         content:
 *           application/json:
 *             example:
 *               message: "Booking cancelled"
 *               booking:
 *                 id: "uuid-booking"
 *                 status: "cancelled"
 */
router.post('/table-bookings/:id/cancel', tableBookingController.cancelTableBooking);

module.exports = router; 