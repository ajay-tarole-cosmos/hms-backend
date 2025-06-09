const express = require("express");
const validate = require("../../middlewares/validate");
const { guestController, roomReservationController } = require("../../controllers");
const { GuestValidation } = require("../../validations");
const upload = require("../../middlewares/upload");
const { createStaffUser } = require('../../controllers/user.controller');

const router = express.Router();

router.post(
    "/create",
    upload.fields([{ name: "document", maxCount: 1 }]),
    validate(GuestValidation.CreateGuest),
    guestController.createGuestUser
);

router.put(
    "/update/:id",
    upload.fields([{ name: "document", maxCount: 1 }]),
    validate(GuestValidation.UpdateGuest),
    guestController.updateGuestUser
);
router.post("/today-guest", guestController.getTodayGuestUser)

router.delete("/delete-guest/:id", guestController.deleteGuestDetails)
router.post("/all-guest", guestController.getGuestUser)
router.post("/:guestId", guestController.getGuestById)
router.post("/guest-history/:id",roomReservationController.getGuestReservation)
router.post('/create-staff', createStaffUser);


// router.post(
//     "/upload-docs/:id", upload.fields([
//       { name: "profileImage", maxCount: 1 },
//     //   { name: "cover_profile", maxCount: 1 },
//     ]),
//     uploadDocsRoute.uploadDocsById
//   );

module.exports = router;

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User module
 */

/**
 * @swagger
 * /guest/create:
 *   post:
 *     summary: Create a new guest user
 *     tags: [User]
 *     description: This endpoint creates a new guest user in the system, including file upload (document).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               country_code:
 *                 type: string
 *                 example: +91
 *               fatherName:
 *                 type: string
 *                 example: Richard Doe
 *               gender:
 *                 type: string
 *                 example: Male
 *               occupation:
 *                 type: string
 *                 example: Developer
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               nationality:
 *                 type: string
 *                 example: Indian
 *               state:
 *                 type: string
 *                 example: Maharashtra
 *               city:
 *                 type: string
 *                 example: Mumbai
 *               zip_code:
 *                 type: string
 *                 example: 400001
 *               address:
 *                 type: string
 *                 example: 123 Street, Near Park
 *               comment:
 *                 type: string
 *                 example: Guest for 2 nights
 *               document_type:
 *                 type: string
 *                 example: Aadhar Card
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Document file (PDF/Image)
 *     responses:
 *       200:
 *         description: Guest created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Guest data created successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     createdGuest:
 *                       type: object
 *                       description: Basic guest info
 *                     createdGuestDetail:
 *                       type: object
 *                       description: Additional guest details
 *       400:
 *         description: Invalid input or creation failure
 */

/**
 * @swagger
 * /guest/create:
 *   post:
 *     summary: Create a new guest user
 *     tags: [User]
 *     description: This endpoint creates a new guest user in the system, including file upload (document).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               country_code:
 *                 type: string
 *                 example: +91
 *               fatherName:
 *                 type: string
 *                 example: Richard Doe
 *               gender:
 *                 type: string
 *                 example: Male
 *               occupation:
 *                 type: string
 *                 example: Developer
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               nationality:
 *                 type: string
 *                 example: Indian
 *               state:
 *                 type: string
 *                 example: Maharashtra
 *               city:
 *                 type: string
 *                 example: Mumbai
 *               zip_code:
 *                 type: string
 *                 example: 400001
 *               address:
 *                 type: string
 *                 example: 123 Street, Near Park
 *               comment:
 *                 type: string
 *                 example: Guest for 2 nights
 *               document_type:
 *                 type: string
 *                 example: Aadhar Card
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Document file (PDF/Image)
 *     responses:
 *       200:
 *         description: Guest created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Guest data created successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     createdGuest:
 *                       type: object
 *                       description: Basic guest info
 *                     createdGuestDetail:
 *                       type: object
 *                       description: Additional guest details
 *       400:
 *         description: Invalid input or creation failure
 */

/**
 * @swagger
 * /guest/all-guest:
 *   post:
 *     summary: Get all guest users
 *     tags: [User]
 *     description: Retrieve a paginated list of all guest users with optional filtering and sorting.
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter guests by first or last name (case-insensitive, partial match)
 *       - in: query
 *         name: phone 
 *         schema:
 *           type: string
 *         description: Filter guests by booking ID (partial match)
 *       - in: query
 *         name: email 
 *         schema:
 *           type: string
 *         description: Filter guests by email (partial match)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Field to sort results by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (asc or desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number to retrieve
 *     responses:
 *       200:
 *         description: A list of guest users with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: All Guest Data
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     guests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           firstName:
 *                             type: string
 *                             example: John
 *                           lastName:
 *                             type: string
 *                             example: Doe
 *                           phone :
 *                             type: string
 *                             example: BK12345
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 100
 *                         totalPages:
 *                           type: integer
 *                           example: 10
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /guest/{guestId}:
 *   post:
 *     summary: Get guest full data by ID
 *     description: Retrieve guest information including details, reservation, room, and payment by guest ID.
 *     tags: [User]
 *     parameters:
 *       - name: guestId
 *         in: path
 *         required: true
 *         description: The UUID of the guest
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Guest data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Guest Data get successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     guestData:
 *                       type: object
 *                       description: Basic guest data
 *                     guestDetails:
 *                       type: object
 *                       description: Additional details about the guest
 *                     roomId:
 *                       type: object
 *                       description: The room assigned to the guest
 *                     reservationDetails:
 *                       type: object
 *                       description: Reservation details for the guest
 *                     paymentDetails:
 *                       type: object
 *                       description: Payment details for the reservation
 *       400:
 *         description: Bad request (Guest ID not provided or invalid)
 *       404:
 *         description: Guest, room, reservation, or payment not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /guest/update/{id}:
 *   put:
 *     summary: Update an existing guest user
 *     tags: [User]
 *     description: This endpoint updates an existing guest user in the system, including file upload (document).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Guest ID to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               country_code:
 *                 type: string
 *                 example: +91
 *               fatherName:
 *                 type: string
 *                 example: Richard Doe
 *               gender:
 *                 type: string
 *                 example: Male
 *               occupation:
 *                 type: string
 *                 example: Developer
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               nationality:
 *                 type: string
 *                 example: Indian
 *               state:
 *                 type: string
 *                 example: Maharashtra
 *               city:
 *                 type: string
 *                 example: Mumbai
 *               zip_code:
 *                 type: string
 *                 example: 400001
 *               address:
 *                 type: string
 *                 example: 123 Street, Near Park
 *               comment:
 *                 type: string
 *                 example: Updated comment
 *               document_type:
 *                 type: string
 *                 example: Passport
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Updated document file (PDF/Image)
 *     responses:
 *       200:
 *         description: Guest updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Guest data updated successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedGuest:
 *                       type: object
 *                       description: Updated guest info
 *                     updatedGuestDetail:
 *                       type: object
 *                       description: Updated guest details
 *       400:
 *         description: Invalid input or update failure
 *       404:
 *         description: Guest not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /guest/delete-guest/{id}:
 *   delete:
 *     summary: Delete a guest user
 *     tags: [User]
 *     description: This endpoint deletes a guest user by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guest ID
 *     responses:
 *       200:
 *         description: Guest detail deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Delete Guest detail successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 *       404:
 *         description: Guest not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Provide Indentity not exist.."
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: array
 *                   example: []
 *       400:
 *         description: Invalid ID or request format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provided valid identity"
 */


/**
 * @swagger
 * /guest/guest-history/{id}:
 *   post:
 *     summary: Get guest reservation history
 *     description: Retrieve the reservation history for a specific guest by their ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The unique identifier of the guest
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reservation details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: The HTTP status code
 *                 success:
 *                   type: boolean
 *                   description: Success status
 *                 data:
 *                   type: object
 *                   description: The reservation data for the guest
 *                   properties:
 *                     guestId:
 *                       type: object
 *                       description: The details of the guest
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                     roomId:
 *                       type: object
 *                       description: The details of the room reserved
 *                       properties:
 *                         id:
 *                           type: integer
 *                         roomNumber:
 *                           type: string
 *                     reservationID:
 *                       type: object
 *                       description: The reservation details
 *                       properties:
 *                         id:
 *                           type: integer
 *                         bookingReferenceNo:
 *                           type: string
 *                         checkInDateTime:
 *                           type: string
 *                           format: date-time
 *                         checkOutDateTime:
 *                           type: string
 *                           format: date-time
 *                     paymentId:
 *                       type: object
 *                       description: The payment details
 *                       properties:
 *                         id:
 *                           type: integer
 *                         paymentStatus:
 *                           type: string
 *                         paymentAmount:
 *                           type: number
 *                           format: float
 *                         paymentDate:
 *                           type: string
 *                           format: date-time
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (invalid or missing guest ID)
 *       404:
 *         description: Guest or related data not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /v1/guest/create-reservation:
 *   post:
 *     summary: Create a guest reservation
 *     description: Create a reservation for a guest with the provided details.
 *     parameters:
 *       - in: body
 *         name: body
 *         description: The reservation details
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             guestId:
 *               type: string
 *               format: uuid
 *               description: The unique identifier of the guest
 *             check_in_date_time:
 *               type: string
 *               format: date-time
 *               description: The check-in date and time
 *             check_out_date_time:
 *               type: string
 *               format: date-time
 *               description: The check-out date and time
 *             booking_type:
 *               type: string
 *               description: The type of booking (e.g., online, walk-in)
 *             booking_reference_no:
 *               type: string
 *               description: The booking reference number
 *             purpose_of_visit:
 *               type: string
 *               description: The purpose of the visit (e.g., business, leisure)
 *             remarks:
 *               type: string
 *               description: Any additional remarks
 *     responses:
 *       200:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: The HTTP status code
 *                 success:
 *                   type: boolean
 *                   description: Success status
 *                 data:
 *                   type: object
 *                   description: The reservation data
 *                   properties:
 *                     guestId:
 *                       type: string
 *                       format: uuid
 *                     check_in_date_time:
 *                       type: string
 *                       format: date-time
 *                     check_out_date_time:
 *                       type: string
 *                       format: date-time
 *                     booking_type:
 *                       type: string
 *                     booking_reference_no:
 *                       type: string
 *                     purpose_of_visit:
 *                       type: string
 *                     remarks:
 *                       type: string
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Bad request (missing or invalid input)
 *       404:
 *         description: Guest not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /guest/create-staff:
 *   post:
 *     summary: Create a department/application user (staff)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Jane
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 example: department_admin
 *     responses:
 *       200:
 *         description: Staff user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Staff user created successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     staff:
 *                       type: object
 *                       description: Created staff user info
 *       400:
 *         description: Invalid input or user already exists
 */

