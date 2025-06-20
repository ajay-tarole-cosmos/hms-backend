const express = require("express");
const validate = require("../../middlewares/validate");
const { roomReservationController } = require("../../controllers");
const upload = require("../../middlewares/upload");
const checkStaffPermission = require("../../middlewares/checkResourcePermission");
const { authenticateUser, authorizeRoles } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticateUser); 

router.post(
  '/all',
  checkStaffPermission('reservation', 'view'),
  roomReservationController.getallGuestReservation
);

router.put(
  '/reassign-room/:reservation_id',
  checkStaffPermission('reservation', 'update'),
  roomReservationController.changeOrReassignRoom
);

router.post(
  '/export-reservations',
  checkStaffPermission('reservation', 'view'),
  roomReservationController.exportReservations
);

router.post(
  '/quick-room-booking/',
  checkStaffPermission('reservation', 'add'),
  roomReservationController.quickRoomBooking
);

router.post(
  '/:reservation_id/logs',
  authorizeRoles('admin', 'super_admin'), 
  checkStaffPermission('reservation', 'view'),
  roomReservationController.getReservationLogs
);

router.post(
  '/get-booking-details/:reservation_id',
  checkStaffPermission('reservation', 'view'),
  roomReservationController.getGuestReservation
);

router.post(
  '/create-room-booking',
  checkStaffPermission('reservation', 'add'),
  upload.array("guestDocuments", 10),
  roomReservationController.createReservation
);

router.post(
  '/calculate-prices',
  checkStaffPermission('reservation', 'view'),
  roomReservationController.calculatedPrices
);

router.patch(
  '/update-reservation/:reservation_id',
  checkStaffPermission('reservation', 'update'),
  upload.array("guestDocuments", 10),
  roomReservationController.updateReservation
);

router.post(
  '/all-room-availability',
  checkStaffPermission('reservation', 'view'),
  roomReservationController.getAllRoomAvailability
);

router.get(
  '/reservations',
  checkStaffPermission('reservation', 'view'),
  roomReservationController.getReservations
);

router.patch(
  '/update-reservation-details/:reservation_id',
  checkStaffPermission('reservation', 'update'),
  roomReservationController.updateReservationRoomById
);

router.post(
  '/reservation-list',
  checkStaffPermission('reservation', 'view'),

  roomReservationController.getAllReservationDetailList
);

router.post(
  '/checkout/:reservationId',
  checkStaffPermission('reservation', 'update'),
  roomReservationController.CheckoutBookinng
);

router.post(
  "/record-payment",
  checkStaffPermission('reservation', 'add'),
  roomReservationController.createPayment
);
module.exports = router

// /**
//  * @swagger
//  * /reservation/create-room-booking:
//  *   post:
//  *     summary: Create a new room booking with guest details and documents
//  *     tags:
//  *       - Room Reservation
//  *     consumes:
//  *       - multipart/form-data
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               room_id:
//  *                 type: string
//  *                 description: Room ID to book
//  *               guests:
//  *                 type: array
//  *                 description: List of guest objects
//  *                 items:
//  *                   type: object
//  *                   properties:
//  *                     first_name:
//  *                       type: string
//  *                     last_name:
//  *                       type: string
//  *                     email:
//  *                       type: string
//  *                     phone:
//  *                       type: string
//  *                     gender:
//  *                       type: string
//  *                     father_name:
//  *                       type: string
//  *                     occupation:
//  *                       type: string
//  *                     nationality:
//  *                       type: string
//  *                     date_of_birth:
//  *                       type: string
//  *                       format: date
//  *                     guestFullDetail:
//  *                       type: array
//  *                       items:
//  *                         type: object
//  *                         properties:
//  *                           document_type:
//  *                             type: string
//  *                           frontend_url:
//  *                             type: string
//  *                           backend_url:
//  *                             type: string
//  *                           mime_type:
//  *                             type: string
//  *                           state:
//  *                             type: string
//  *                           city:
//  *                             type: string
//  *                           zip_code:
//  *                             type: string
//  *                           address:
//  *                             type: string
//  *                           comment:
//  *                             type: string
//  *               guestDocuments:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                   format: binary
//  *                 description: Array of guest documents (e.g., ID proof)
//  *               extra_bed:
//  *                 type: integer
//  *                 description: Number of extra beds
//  *               check_in_date_time:
//  *                 type: string
//  *                 format: date-time
//  *               check_out_date_time:
//  *                 type: string
//  *                 format: date-time
//  *               booking_type:
//  *                 type: string
//  *               purpose_of_visit:
//  *                 type: string
//  *               remarks:
//  *                 type: string
//  *               total_amount:
//  *                 type: number
//  *               reason:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Booking created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 statusCode:
//  *                   type: integer
//  *                   example: 200
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   type: object
//  *                   description: Booking details
//  *                 message:
//  *                   type: string
//  *                   example: Room Booking created successfully
//  *       400:
//  *         description: Bad request, e.g., exceeding room capacity
//  *       500:
//  *         description: Internal server error
//  */

/**
 * @swagger
 * /reservation/reassign-room/{reservation_id}:
 *   put:
 *     summary: Reassign a room for an existing reservation
 *     tags:
 *       - Reservation
 *     parameters:
 *       - in: path
 *         name: reservation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the reservation to reassign
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - change_reason
 *               - note
 *               - room_id
 *             properties:
 *               change_reason:
 *                 type: string
 *                 example: Maintenance issue
 *               note:
 *                 type: string
 *                 example: AC not working in previous room
 *               room_id:
 *                 type: string
 *                 format: uuid
 *                 example: 4b7a6a50-2b3e-42c4-8a90-f5fdf6fba9b3
 *     responses:
 *       200:
 *         description: Room reassigned successfully
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
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   description: Updated reservation object
 *       400:
 *         description: Bad request or room already assigned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /reservation/{reservation_id}/logs:
 *   post:
 *     summary: Get logs related to a specific reservation
 *     tags:
 *       - Reservation
 *     parameters:
 *       - in: path
 *         name: reservation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the reservation to get logs for
 *     responses:
 *       200:
 *         description: Booking logs fetched successfully
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
 *                   example: Booking logs fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "d12a8c9e-1ef4-41c3-9000-882c6a1f8a91"
 *                       reservation_id:
 *                         type: string
 *                         example: "8b66f509-b415-4b48-8f03-ba41403e294f"
 *                       action:
 *                         type: string
 *                         example: "UPDATE"
 *                       remarks:
 *                         type: string
 *                         example: "Room reassigned from room 101 to room 110"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-18T14:22:00.000Z"
 *                       performed_by_user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "db1167fb-de69-4f0e-a257-0812311f4fab"
 *                           first_name:
 *                             type: string
 *                             example: "John"
 *                           last_name:
 *                             type: string
 *                             example: "Doe"
 *                           email:
 *                             type: string
 *                             example: "john.doe@hotel.com"
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /reservation/create-room-booking:
 *   post:
 *     summary: Create a new room booking
 *     tags:
 *       - Reservation
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               room_id:
 *                 type: string
 *                 format: uuid
 *               check_in_date_time:
 *                 type: string
 *                 format: date-time
 *               check_out_date_time:
 *                 type: string
 *                 format: date-time
 *               booking_type:
 *                 type: string
 *               purpose_of_visit:
 *                 type: string
 *               remarks:
 *                 type: string
 *               total_amount:
 *                 type: number
 *               reason:
 *                 type: string
 *               extra_bed:
 *                 type: integer
 *               guests:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     father_name:
 *                       type: string
 *                     occupation:
 *                       type: string
 *                     nationality:
 *                       type: string
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *               document:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation or availability error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /reservation/update-reservation/{reservation_id}:
 *   patch:
 *     summary: Update room booking status (Cancel / Check-In / Check-Out)
 *     tags:
 *       - Reservation
 *     parameters:
 *       - in: path
 *         name: reservation_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [BOOKED, CHECK_IN, CHECK_OUT, CANCELLED]
 *               check_in_date_time:
 *                 type: string
 *                 format: date-time
 *               check_out_date_time:
 *                 type: string
 *                 format: date-time
 *               cancellation_reason:
 *                 type: string
 *               room_number_id:
 *                 type: string
 *                 format: uuid
 *               extra_bed:
 *                 type: integer
 *               guests:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     father_name:
 *                       type: string
 *                     occupation:
 *                       type: string
 *                     nationality:
 *                       type: string
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       400:
 *         description: Invalid request or business rule violation
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /reservation/get-booking-details/{reservation_id}:
 *   post:
 *     summary: Get detailed information about a specific reservation
 *     tags:
 *       - Reservation
 *     parameters:
 *       - in: path
 *         name: reservation_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique reservation ID
 *     responses:
 *       200:
 *         description: Successfully retrieved reservation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     reservation_id:
 *                       type: string
 *                     booking_status:
 *                       type: string
 *                     check_in:
 *                       type: string
 *                       format: date-time
 *                     check_out:
 *                       type: string
 *                       format: date-time
 *                     additional_guests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           address:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               state:
 *                                 type: string
 *                               city:
 *                                 type: string
 *                               zip_code:
 *                                 type: string
 *                               address:
 *                                 type: string
 *                     room_number_details:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         room_number:
 *                           type: string
 *                         room_status:
 *                           type: string
 *                         floor_number:
 *                           type: integer
 *                     room_type_details:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         room_type:
 *                           type: string
 *                         capacity:
 *                           type: integer
 *                         extra_bed:
 *                           type: integer
 *                         price:
 *                           type: number
 *                         amenities:
 *                           type: array
 *                           items:
 *                             type: string
 *                         bed_type:
 *                           type: string
 *                         image_url:
 *                           type: string
 *                     guest_info:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                     guest_address:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         state:
 *                           type: string
 *                         city:
 *                           type: string
 *                         zip_code:
 *                           type: string
 *                         address:
 *                           type: string
 *       400:
 *         description: Invalid reservation ID
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /reservation/all-room-availability:
 *   post:
 *     summary: Get availability of all rooms by date or date range
 *     tags:
 *       - Reservation
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: today
 *         description: Single date to filter availability (e.g., 'today', 'tomorrow', or 'YYYY-MM-DD')
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-05-20
 *         description: Start date for range filter (use with `endDate`)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-05-25
 *         description: End date for range filter (use with `startDate`)
 *     responses:
 *       200:
 *         description: Room availability data fetched successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     room_types:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           room_type_id:
 *                             type: integer
 *                           room_type:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           capacity:
 *                             type: integer
 *                           amenities:
 *                             type: array
 *                             items:
 *                               type: string
 *                           bed_type:
 *                             type: string
 *                           image_url:
 *                             type: string
 *                           available_count:
 *                             type: integer
 *                           total_count:
 *                             type: integer
 *                           rooms:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 room_id:
 *                                   type: integer
 *                                 room_number:
 *                                   type: string
 *                                 floor:
 *                                   type: string
 *                                 current_status:
 *                                   type: string
 *                                 availability:
 *                                   type: string
 *                                   enum: [available, booked, occupied, unavailable]
 *                                 reservations:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       reservation_id:
 *                                         type: integer
 *                                       check_in:
 *                                         type: string
 *                                         format: date-time
 *                                       check_out:
 *                                         type: string
 *                                         format: date-time
 *                                       status:
 *                                         type: string
 *                                         enum: [booked, check_in]
 *                                       guest:
 *                                         type: object
 *                                         nullable: true
 *                                         properties:
 *                                           first_name:
 *                                             type: string
 *                                           last_name:
 *                                             type: string
 *                                           email:
 *                                             type: string
 *                                           phone:
 *                                             type: string
 *                     filter_applied:
 *                       type: boolean
 *                     date:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                     date_range:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         end:
 *                           type: string
 *                           format: date
 *       400:
 *         description: Invalid date format or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /reservation/export-reservations:
 *   post:
 *     summary: Export reservation data in CSV or Excel format
 *     tags:
 *       - Reservation
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *           default: csv
 *         description: File format to export. Choose between 'csv' and 'excel'.
 *     responses:
 *       200:
 *         description: File download (CSV or Excel)
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No reservations found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No reservations found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /reservation/{reservation_id}/logs:
 *   post:
 *     summary: Get booking logs for a reservation
 *     tags:
 *       - Reservation
 *     parameters:
 *       - in: path
 *         name: reservation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the reservation
 *     responses:
 *       200:
 *         description: Booking logs fetched successfully
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
 *                   example: Booking logs fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 35
 *                       reservation_id:
 *                         type: string
 *                         format: uuid
 *                         example: 01137ac0-fbbf-4d87-8b45-5db758621d23
 *                       action:
 *                         type: string
 *                         example: updated
 *                       performed_by:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-05-26T13:53:36.483Z
 *                       remarks:
 *                         type: string
 *                         example: Reservation updated
 *                       guest_id:
 *                         type: string
 *                         format: uuid
 *                         example: bf1a16b0-5da2-4048-ada9-725bc8a3b2b1
 *                       room_number_id:
 *                         type: string
 *                         format: uuid
 *                         example: 990fdcbf-2b89-4ef2-959d-fd6a6a0d8979
 *                       staff:
 *                         type: object
 *                         nullable: true
 *                         description: Associated staff data if available
 *       400:
 *         description: Invalid reservation ID
 *       500:
 *         description: Internal server error
 */
