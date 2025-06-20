const express = require("express");
const validate = require("../../middlewares/validate");
const { RoomValidation } = require("../../validations");
const { roomController } = require("../../controllers");
const upload = require("../../middlewares/upload");
const { authenticateUser } = require("../../middlewares/authMiddleware");
const checkStaffPermission = require("../../middlewares/checkResourcePermission");

const router = express.Router();

// Room Type
router.post(
  '/create-room-type',
  authenticateUser,
  checkStaffPermission('rooms', 'add'),
  validate(RoomValidation.createRoomSchema),
  upload.fields([{ name: "image", maxCount: 1 }]),
  roomController.createRoom
);

router.post(
  '/room-types',
  authenticateUser,
  checkStaffPermission('rooms', 'view'),
  roomController.getAllRoomType
);

router.patch(
  '/update-room-type/:room_id',
  authenticateUser,
  checkStaffPermission('rooms', 'update'),
  validate(RoomValidation.updateRoomValidation),
  upload.fields([{ name: "image", maxCount: 1 }]),
  roomController.updateRoom
);

router.delete(
  '/delete-room-type/:id',
  authenticateUser,
  checkStaffPermission('rooms', 'delete'),
  roomController.deleteRoomTypeById
);

// Room Number
router.post(
  '/create-room-number',
  authenticateUser,
  checkStaffPermission('rooms', 'add'),
  validate(RoomValidation.createRoomNumberSchema),
  roomController.createRoomNumberWithType
);

router.post(
  '/all-room-number',
  authenticateUser,
  checkStaffPermission('rooms', 'view'),
  roomController.getAllRoomNumber
);

router.patch(
  '/update-room-number/:id',
  authenticateUser,
  checkStaffPermission('rooms', 'update'),
  validate(RoomValidation.updateRoomNumberValidation),
  roomController.updateRoomNumberById
);

router.delete(
  '/delete-room-number/:id',
  authenticateUser,
  checkStaffPermission('rooms', 'delete'),
  roomController.deleteRoomNumber
);

// Room Details, Status, List
router.post(
  '/room-detail/:id',
  authenticateUser,
  checkStaffPermission('rooms', 'view'),
  roomController.getRoomDetails
);
router.post('/rooms', roomController.allRooms)

router.post(
  '/get-room-list',
  authenticateUser,
  checkStaffPermission('rooms', 'view'),
  roomController.getAllRoomList
);

router.post(
  '/all-room-types',
  authenticateUser,
  checkStaffPermission('rooms', 'view'),
  roomController.getAllRoomBasedTypes
);

router.post(
  '/all-room-status',
  authenticateUser,
  checkStaffPermission('rooms', 'view'),
  roomController.getAllRoomStatus
);

router.post(
  '/room-status',
  authenticateUser,
  checkStaffPermission('rooms', 'view'),
  roomController.getRoomStatus
);

router.patch(
  '/update-room-status/:roomId',
  authenticateUser,
  checkStaffPermission('rooms', 'update'),
  validate(RoomValidation.updateRoomValidation),
  roomController.updateRoomStatus
);

// Room Availability
router.post(
  '/room-availability',
  authenticateUser,
  checkStaffPermission('rooms', 'view'),
  roomController.getRoomAvailability
);

// Offers
router.post(
  '/offer',
  authenticateUser,
  checkStaffPermission('rooms', 'add'),
  validate(RoomValidation.createOfferValidation),
  roomController.createOffer
);

router.post(
  '/offer/all',
  authenticateUser,
  checkStaffPermission('rooms', 'view'),
  roomController.getOffers
);

router.post(
  '/offer/:id',
  authenticateUser,
  checkStaffPermission('rooms', 'view'),
  roomController.getOfferById
);

router.put(
  '/offer/:id',
  authenticateUser,
  checkStaffPermission('rooms', 'update'),
  validate(RoomValidation.updateOfferValidation),
  roomController.updateOffer
);

router.delete(
  '/offer/:id',
  authenticateUser,
  checkStaffPermission('rooms', 'delete'),
  roomController.deleteOffer
);

// Packages
router.post(
  '/package',
  authenticateUser,
  checkStaffPermission('rooms', 'add'),
  validate(RoomValidation.createPackageValidation),
  roomController.createPackage
);

router.post(
  '/package/all',
  authenticateUser,
  checkStaffPermission('rooms', 'view'),
  roomController.getPackages
);

router.post(
  '/package/:id',
  authenticateUser,
  checkStaffPermission('rooms', 'view'),
  roomController.getPackageById
);

router.put(
  '/package/:id',
  authenticateUser,
  checkStaffPermission('rooms', 'update'),
  validate(RoomValidation.updatePackageValidation),
  roomController.updatePackage
);

router.delete(
  '/package/:id',
  authenticateUser,
  checkStaffPermission('rooms', 'delete'),
  roomController.deletePackage
);

module.exports = router;

/**
 * @swagger
 * /room/create-room-type:
 *   post:
 *     summary: Create a new room type
 *     tags:
 *       - Room
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               room_type:
 *                 type: string
 *                 example: Deluxe King Room
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Comma-separated or array of amenity IDs
 *                 example: ["1", "2", "3"]
 *               capacity:
 *                 type: integer
 *                 example: 4
 *               bed_count:
 *                 type: integer
 *                 example: 2
 *               bed_type:
 *                 type: string
 *                 example: King
 *               extra_bed:
 *                 type: integer
 *                 example: 1
 *               room_size:
 *                 type: string
 *                 example: "30sqm"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 120.5
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Room image file
 *     responses:
 *       200:
 *         description: Room created successfully
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
 *                   example: Room created successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     createdRoom:
 *                       $ref: '#/components/schemas/Room'
 *       400:
 *         description: Bad Request – Missing or invalid input
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /room/create-room-number:
 *   post:
 *     summary: Create a new room number with associated type
 *     tags: [Room]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_number
 *               - room_type
 *               - room_status
 *               - floor_number
 *               - standard_checkout
 *             properties:
 *               room_number:
 *                 type: string
 *                 example: "101A"
 *               room_type:
 *                 type: string
 *                 example: "Deluxe"
 *               room_status:
 *                 type: string
 *                 example: "available"
 *               floor_number:
 *                 type: integer
 *                 example: 1
 *               standard_checkout:
 *                 type: string
 *                 example: "11:00 AM"
 *     responses:
 *       200:
 *         description: Room created successfully
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
 *                   example: Room created successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     createRoomStatus:
 *                       $ref: '#/components/schemas/RoomNumber'
 *       400:
 *         description: Bad request - room already exists or room type invalid
 */

/**
 * @swagger
 * /room/room-detail/{room_number}:
 *   post:
 *     summary: Get room details by room number
 *     tags:
 *       - Room
 *     parameters:
 *       - in: path
 *         name: room_number
 *         required: true
 *         schema:
 *           type: integer
 *         description: The room number to retrieve details for
 *     responses:
 *       200:
 *         description: Successfully fetched room details
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
 *                 data:
 *                   $ref: '#/components/schemas/RoomNumber'
 *       400:
 *         description: Invalid room number provided
 *       404:
 *         description: Room not found
 */

/**
 * @swagger
 * /room/update-room-type/{room_id}:
 *   patch:
 *     summary: Update room information
 *     tags: [Room]
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the room to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               number_of_room:
 *                 type: integer
 *                 example: 101
 *               room_type:
 *                 type: string
 *                 example: "Deluxe"
 *               description:
 *                 type: string
 *                 example: "Spacious room with balcony"
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["1", "2"]
 *               capacity:
 *                 type: integer
 *                 example: 3
 *               bed_count:
 *                 type: integer
 *                 example: 2
 *               bed_type:
 *                 type: string
 *                 example: "Queen"
 *               extra_bed:
 *                 type: integer
 *                 example: 0
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 120.50
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Room updated successfully
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
 *                   example: Room updated successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedRoom:
 *                       $ref: '#/components/schemas/Room'
 *       400:
 *         description: Invalid input or missing required fields
 *       404:
 *         description: Room not found
 */

/**
 * @swagger
 * /room/get-room-list:
 *   post:
 *     summary: Get a list of available rooms
 *     tags: [Room]
 *     description: Retrieve a paginated list of available rooms with optional filters such as room type, status, and availability by date range.
 *     parameters:
 *       - in: query
 *         name: room_type
 *         schema:
 *           type: string
 *         description: Filter rooms by room type
 *       - in: query
 *         name: room_status
 *         schema:
 *           type: string
 *         description: Filter rooms by status (e.g., available, occupied)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Check-in date to filter out reserved rooms
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Check-out date to filter out reserved rooms
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
 *         description: Sort order
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
 *         description: Rooms retrieved successfully
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
 *                   example: Rooms retrieved successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     rooms:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           room_number:
 *                             type: string
 *                           room_type:
 *                             type: string
 *                           room_status:
 *                             type: string
 *                           price:
 *                             type: number
 *                           floor:
 *                             type: integer
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         currentPage:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /room/room-types:
 *   post:
 *     summary: Get a list of room types
 *     tags: [Room]
 *     description: Retrieve a paginated list of room types, with optional filtering by room type and amenities.
 *     parameters:
 *       - in: query
 *         name: room_type
 *         schema:
 *           type: string
 *         description: Filter room types by type (partial match)
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: string
 *         description: Comma-separated list of amenity IDs to filter room types
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
 *         description: Sort order
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
 *         description: Room types retrieved successfully
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
 *                   example: Rooms Types retrieved successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     rooms:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           room_type:
 *                             type: string
 *                           amenities:
 *                             type: array
 *                             items:
 *                               type: string
 *                           amenity_details:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 amenity_name:
 *                                   type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         currentPage:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /room/room-types-with-offer:
 *   post:
 *     summary: Get a list of room types
 *     tags: [Room]
 *     description: Retrieve a paginated list of room types, with optional filtering by room type and amenities.
 *     parameters:
 *       - in: query
 *         name: room_type
 *         schema:
 *           type: string
 *         description: Filter room types by type (partial match)
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: string
 *         description: Comma-separated list of amenity IDs to filter room types
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
 *         description: Sort order
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
 *         description: Room types retrieved successfully
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
 *                   example: Rooms Types retrieved successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     rooms:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           room_type:
 *                             type: string
 *                           amenities:
 *                             type: array
 *                             items:
 *                               type: string
 *                           amenity_details:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 amenity_name:
 *                                   type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         currentPage:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /room/all-room-types:
 *   post:
 *     summary: Get all unique room types
 *     tags:
 *       - Room
 *     responses:
 *       200:
 *         description: A list of all room types
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       room_type:
 *                         type: string
 *                         example: Deluxe
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /room/all-room-status:
 *   post:
 *     summary: Get all possible room statuses
 *     tags:
 *       - Room
 *     responses:
 *       200:
 *         description: A list of all room statuses
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                         example: AVAILABLE
 *                       value:
 *                         type: string
 *                         example: Available
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /room/update-room-status/{roomId}:
 *   patch:
 *     summary: Update an existing room number by ID
 *     tags: [Room]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room number ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room_numbeer:
 *                 type: string
 *                 example: "202B"
 *               room_status:
 *                 type: string
 *                 example: "occupied"
 *               floor_number:
 *                 type: integer
 *                 example: 2
 *               stanndard_checkout:
 *                 type: string
 *                 example: "12:00 PM"
 *     responses:
 *       200:
 *         description: Room Number updated successfully
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
 *                   example: Room Number updated successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request - missing or invalid room ID
 *       404:
 *         description: Room number not found
 */


/**
 * @swagger
 * /room/delete-room-type/{id}:
 *   delete:
 *     summary: Delete a room type by ID
 *     tags: [Room]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room type ID to delete
 *     responses:
 *       200:
 *         description: Room details deleted successfully
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
 *                   example: Room details deleted successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request - invalid or missing ID
 *       404:
 *         description: Room not found
 */


/**
 * @swagger
 * /room/delete-room-number/{id}:
 *   delete:
 *     summary: Delete a room number by ID
 *     tags: [Room]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room number ID to delete
 *     responses:
 *       200:
 *         description: Room type deleted successfully
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
 *                   example: Room type deleted successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request - invalid or missing ID
 *       404:
 *         description: Room number not found
 */

/**
 * @swagger
 * tags:
 *   name: Offer
 *   description: Room pricing offer management
 */

/**
 * @swagger
 * /room/offer/all:
 *   post:
 *     summary: Get all room pricing offers
 *     tags: [Offer]
 *     responses:
 *       200:
 *         description: A list of room pricing offers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OfferResponse'
 */

/**
 * @swagger
 * /room/offer/{id}:
 *   post:
 *     summary: Get offer by ID
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The offer ID
 *     responses:
 *       200:
 *         description: Offer fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
 */

/**
 * @swagger
 * /room/offer:
 *   post:
 *     summary: Create a new room pricing offer
 *     tags: [Offer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OfferInput'
 *     responses:
 *       200:
 *         description: Offer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
 */

/**
 * @swagger
 * /room/offer/{id}:
 *   put:
 *     summary: Update an existing room pricing offer
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the offer to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OfferInput'
 *     responses:
 *       200:
 *         description: Offer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
 */

/**
 * @swagger
 * /room/offer/{id}:
 *   delete:
 *     summary: Delete an offer
 *     tags: [Offer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */

/**
 * @swagger
 * tags:
 *   name: Package
 *   description: Room package management
 */

/**
 * @swagger
 * /room/package:
 *   post:
 *     summary: Create a new room package
 *     tags: [Package]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PackageInput'
 *     responses:
 *       200:
 *         description: Package created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PackageResponse'
 */

/**
 * @swagger
 * /room/package/all:
 *   post:
 *     summary: Get all packages
 *     tags: [Package]
 *     responses:
 *       200:
 *         description: A list of packages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PackageResponse'
 */

/**
 * @swagger
 * /room/package/{id}:
 *   post:
 *     summary: Get package by ID
 *     tags: [Package]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PackageResponse'
 */

/**
 * @swagger
 * /room/package/{id}:
 *   put:
 *     summary: Update a package
 *     tags: [Package]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PackageInput'
 *     responses:
 *       200:
 *         description: Package updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PackageResponse'
 */

/**
 * @swagger
 * /room/package/{id}:
 *   delete:
 *     summary: Delete a package
 *     tags: [Package]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */
