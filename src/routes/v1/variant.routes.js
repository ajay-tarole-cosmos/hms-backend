const express = require('express');
const router = express.Router();
const variantController = require('../../controllers/variant.controller');

/**
 * @swagger
 * tags:
 *   name: Variants
 *   description: Variant management endpoints
 */

/**
 * @swagger
 * /variant/create:
 *   post:
 *     summary: Create a new variant
 *     tags: [Variants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subcategory_id, name, price, quantity]
 *             properties:
 *               category_id:
 *                 type: string
 *               subcategory_id:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               flavor:
 *                 type: string
 *               size:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Variant created successfully
 *       400:
 *         description: Bad request
 */
router.post('/create', variantController.createVariant);

/**
 * @swagger
 * /variant/all:
 *   post:
 *     summary: Get all variants
 *     tags: [Variants]
 *     responses:
 *       200:
 *         description: List of variants
 */
router.post('/all', variantController.getAllVariants);

/**
 * @swagger
 * /variant/by-sub/{subcategory_id}:
 *   post:
 *     summary: Get all variants
 *     tags: [Variants]
 *     parameters:
 *       - in: path
 *         name: subcategory_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: List of variants
 */
router.post('/by-sub/:subcategory_id', variantController.getVariantsBySubcategoryId);

/**
 * @swagger
 * /variant/{id}:
 *   get:
 *     summary: Get a variant by ID
 *     tags: [Variants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Variant data
 *       404:
 *         description: Variant not found
 */
router.post('/:id', variantController.getVariantById);

/**
 * @swagger
 * /variant/{id}:
 *   put:
 *     summary: Update a variant
 *     tags: [Variants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               flavor:
 *                 type: string
 *               size:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               category_id:
 *                 type: string
 *               subcategory_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Variant updated successfully
 *       404:
 *         description: Variant not found
 */
router.put('/:id', variantController.updateVariant);

/**
 * @swagger
 * /variant/{id}:
 *   delete:
 *     summary: Delete a variant
 *     tags: [Variants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Variant deleted
 *       404:
 *         description: Variant not found
 */
router.delete('/:id', variantController.deleteVariant);

module.exports = router;
