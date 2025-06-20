const express = require("express");
const { hotelController } = require("../../controllers");
const { authenticateUser } = require("../../middlewares/authMiddleware");
const checkStaffPermission = require("../../middlewares/checkResourcePermission");

const router = express.Router();

  router.post(
    '/create',
    // authenticateUser,
    // checkStaffPermission('hotels', 'add'),
    hotelController.createHotel
  );
  
  router.post(
    '/all',
    // authenticateUser,
    // checkStaffPermission('hotels', 'view'),
    hotelController.getHotels
  );
  
  router.post(
    '/:id',
    // authenticateUser,
    // checkStaffPermission('hotels', 'view'),
    hotelController.getHotelById
  );
  
  router.put(
    '/:id',
    // authenticateUser,
    // checkStaffPermission('hotels', 'update'),
    hotelController.updateHotel
  );
  
  router.delete(
    '/:id',
    // authenticateUser,
    // checkStaffPermission('hotels', 'delete'),
    hotelController.deleteHotel
  );
  

router.post('/facility/all', hotelController.getFacilities);
router.post('/facility/:id', hotelController.getFacilityById);
router.post('/facility', hotelController.createFacility);
router.put('/facility/:id', hotelController.updateFacility);
router.delete('/facility/:id', hotelController.deleteFacility);

// Amenity Routes
router.post('/amenity/all', hotelController.getAmenities);
router.post('/amenity/create', hotelController.createAmenity);
router.post('/amenity/:id', hotelController.getAmenityById);
router.put('/amenityupdate/:id', hotelController.updateAmenity);
router.delete('/amenitydelete/:id', hotelController.deleteAmenity);

module.exports = router



// /**
//  * @swagger
//  * tags:
//  *   name: Hotel
//  *   description: Hotel management APIs
//  */

// /**
//  * @swagger
//  * /hotel/create:
//  *   post:
//  *     summary: Create a new hotel
//  *     tags: [Hotel]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               address:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               city:
//  *                 type: string
//  *               country:
//  *                 type: string
//  *               phone:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *             required:
//  *               - name
//  *               - address
//  *     responses:
//  *       200:
//  *         description: Hotel created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/HotelResponse'
//  *       500:
//  *         description: Internal server error
//  */

// /**
//  * @swagger
//  * /hotel/all:
//  *   post:
//  *     summary: Get all hotels
//  *     tags: [Hotel]
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *         required: false
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *         required: false
//  *     responses:
//  *       200:
//  *         description: List of hotels
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/PaginatedHotelResponse'
//  *       500:
//  *         description: Internal server error
//  */

// /**
//  * @swagger
//  * /hotel/{id}:
//  *   post:
//  *     summary: Get a hotel by ID
//  *     tags: [Hotel]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Hotel ID
//  *     responses:
//  *       200:
//  *         description: Hotel fetched successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/HotelResponse'
//  *       404:
//  *         description: Hotel not found
//  */

// /**
//  * @swagger
//  * /hotel/{id}:
//  *   put:
//  *     summary: Update a hotel
//  *     tags: [Hotel]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Hotel ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               address:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               city:
//  *                 type: string
//  *               country:
//  *                 type: string
//  *               phone:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *             required:
//  *               - name
//  *               - address
//  *     responses:
//  *       200:
//  *         description: Hotel updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/HotelResponse'
//  *       404:
//  *         description: Hotel not found
//  */

// /**
//  * @swagger
//  * /hotel/{id}:
//  *   delete:
//  *     summary: Delete a hotel
//  *     tags: [Hotel]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Hotel ID
//  *     responses:
//  *       200:
//  *         description: Hotel deleted successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 statusCode:
//  *                   type: integer
//  *                   example: 200
//  *                 message:
//  *                   type: string
//  *                   example: Hotel deleted successfully
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *       404:
//  *         description: Hotel not found
//  */

/**
 * @swagger
 * tags:
 *   - name: Amenity
 *     description: Amenity management APIs
 */

/**
 * @swagger
 * /hotel/amenity/all:
 *   post:
 *     summary: Get all amenities
 *     tags: [Amenity]
 *     responses:
 *       200:
 *         description: List of amenities
 */

/**
 * @swagger
 * /hotel/amenity/{id}:
 *   post:
 *     summary: Get an amenity by ID
 *     tags: [Amenity]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Amenity retrieved
 *       404:
 *         description: Amenity not found
 */

/**
 * @swagger
 * /hotel/amenity:
 *   post:
 *     summary: Create a new amenity
 *     tags: [Amenity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amenity_name:
 *                 type: string
 *             required:
 *               - amenity_name
 *     responses:
 *       201:
 *         description: Amenity created
 */

/**
 * @swagger
 * /hotel/amenity/{id}:
 *   put:
 *     summary: Update an amenity by ID
 *     tags: [Amenity]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amenity_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Amenity updated
 *       404:
 *         description: Amenity not found
 */

/**
 * @swagger
 * /hotel/amenity/{id}:
 *   delete:
 *     summary: Delete an amenity by ID
 *     tags: [Amenity]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Amenity deleted
 *       404:
 *         description: Amenity not found
 */



// /**
//  * @swagger
//  * tags:
//  *   - name: Facility
//  *     description: Facility management APIs
//  *   - name: Amenity
//  *     description: Amenity management APIs
//  */

// /**
//  * @swagger
//  * /hotel/facility/all:
//  *   post:
//  *     summary: Get all facilities
//  *     tags: [Facility]
//  *     responses:
//  *       200:
//  *         description: List of facilities
//  */

// /**
//  * @swagger
//  * /hotel/facility/{id}:
//  *   post:
//  *     summary: Get a facility by ID
//  *     tags: [Facility]
//  *     parameters:
//  *       - name: id
//  *         in: path
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Facility retrieved
//  *       404:
//  *         description: Facility not found
//  */

// /**
//  * @swagger
//  * /hotel/facility:
//  *   post:
//  *     summary: Create a new facility
//  *     tags: [Facility]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               facility_name:
//  *                 type: string
//  *             required:
//  *               - facility_name
//  *     responses:
//  *       201:
//  *         description: Facility created
//  */

// /**
//  * @swagger
//  * /hotel/facility/{id}:
//  *   put:
//  *     summary: Update a facility by ID
//  *     tags: [Facility]
//  *     parameters:
//  *       - name: id
//  *         in: path
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               facility_name:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Facility updated
//  *       404:
//  *         description: Facility not found
//  */

// /**
//  * @swagger
//  * /hotel/facility/{id}:
//  *   delete:
//  *     summary: Delete a facility by ID
//  *     tags: [Facility]
//  *     parameters:
//  *       - name: id
//  *         in: path
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       204:
//  *         description: Facility deleted
//  *       404:
//  *         description: Facility not found
//  */
