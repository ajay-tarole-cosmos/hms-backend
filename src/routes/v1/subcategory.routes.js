/**
 * @swagger
 * tags:
 *   name: Subcategories
 *   description: Manage food and beverage subcategories
 */

const express = require("express");
const router = express.Router();
const subcategoryController = require('../../controllers/subcategory.controller');

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
router.post('/create', subcategoryController.createSubcategory);

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
router.post('/all', subcategoryController.getAllSubcategories);

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
router.post('/by-category/:category_id', subcategoryController.getSubcategoriesByCategoryId);

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
router.post('/:id', subcategoryController.getSubcategoryById);

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
router.put('/:id', subcategoryController.updateSubcategory);

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
router.delete('/:id', subcategoryController.deleteSubcategory);

module.exports = router;
