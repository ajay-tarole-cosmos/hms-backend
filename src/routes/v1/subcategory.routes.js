const express = require("express");
const router = express.Router();
const subcategoryController = require('../../controllers/subcategory.controller');
const upload = require("../../middlewares/upload");
const { authenticateUser } = require("../../middlewares/authMiddleware");
const checkStaffPermission = require("../../middlewares/checkResourcePermission");

// Create menu category (subcategory)
router.post(
  '/create',
  authenticateUser,
  checkStaffPermission('restaurant', 'add'),
  upload.single("image"),
  subcategoryController.createSubcategory
);

// View all menu categories
router.post(
  '/all',
  authenticateUser,
  checkStaffPermission('restaurant', 'view'),
  subcategoryController.getAllSubcategories
);

// View by main category
router.post(
  '/by-category/:category_id',
  authenticateUser,
  checkStaffPermission('restaurant', 'view'),
  subcategoryController.getSubcategoriesByCategoryId
);

// View one subcategory
router.post(
  '/:id',
  authenticateUser,
  checkStaffPermission('restaurant', 'view'),
  subcategoryController.getSubcategoryById
);

// Update menu subcategory
router.put(
  '/:id',
  authenticateUser,
  checkStaffPermission('restaurant', 'update'),
  upload.single("image"),
  subcategoryController.updateSubcategory
);

// Delete subcategory
router.delete(
  '/:id',
  authenticateUser,
  checkStaffPermission('restaurant', 'delete'),
  subcategoryController.deleteSubcategory
);

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Subcategories
 *   description: Manage food and beverage subcategories
 */

/**
 * @swagger
 * /subcategories/create:
 *   post:
 *     summary: Create a new subcategory
 *     tags: [Subcategories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alcoholic
 *               category_id:
 *                 type: string
 *                 format: uuid
 *                 example: 3f472e1b-9b33-4aa3-8d3c-1c0a1a67820e
 *     responses:
 *       201:
 *         description: Subcategory created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /subcategories/all:
 *   post:
 *     summary: Get all subcategories
 *     tags: [Subcategories]
 *     responses:
 *       200:
 *         description: A list of subcategories
 */

/**
 * @swagger
 * /subcategories/by-category/{category_id}:
 *   post:
 *     summary: Get all subcategories
 *     tags: [Subcategories]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The subcategory ID
 *     responses:
 *       200:
 *         description: A list of subcategories
 */

/**
 * @swagger
 * /subcategories/{id}:
 *   post:
 *     summary: Get a single subcategory by ID
 *     tags: [Subcategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The subcategory ID
 *     responses:
 *       200:
 *         description: Subcategory details
 *       404:
 *         description: Subcategory not found
 */

/**
 * @swagger
 * /subcategories/{id}:
 *   put:
 *     summary: Update a subcategory
 *     tags: [Subcategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The subcategory ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Non-Alcoholic
 *               category_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Subcategory updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Subcategory not found
 */

/**
 * @swagger
 * /subcategories/{id}:
 *   delete:
 *     summary: Delete a subcategory
 *     tags: [Subcategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The subcategory ID
 *     responses:
 *       200:
 *         description: Subcategory deleted
 *       404:
 *         description: Subcategory not found
 */
