const express = require("express");
const categoryController = require('../../controllers/category.controller');
const checkStaffPermission = require("../../middlewares/checkResourcePermission");
const { authenticateUser } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.post(
    '/create',
    authenticateUser,
    checkStaffPermission('restaurant', 'add'),
    categoryController.createCategory
  );
  
  router.post(
    '/all',
    authenticateUser,
    checkStaffPermission('restaurant', 'view'),
    categoryController.getAllCategories
  );
  
  router.post(
    '/:id',
    authenticateUser,
    checkStaffPermission('restaurant', 'view'),
    categoryController.getCategoryById
  );
  
  router.put(
    '/:id',
    authenticateUser,
    checkStaffPermission('restaurant', 'update'),
    categoryController.updateCategory
  );
  
  router.delete(
    '/:id',
    authenticateUser,
    checkStaffPermission('restaurant', 'delete'),
    categoryController.deleteCategory
  );  
  
module.exports = router;
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /categories/create:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Beverages
 *               description:
 *                 type: string
 *                 example: All drinkable items
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /categories/all:
 *   post:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */

/**
 * @swagger
 * /categories/{id}:
 *   post:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category found
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Category
 *               description:
 *                 type: string
 *                 example: Updated description
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 */

