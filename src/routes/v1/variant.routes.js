const express = require('express');
const router = express.Router();
const variantController = require('../../controllers/variant.controller');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const checkStaffPermission = require('../../middlewares/checkResourcePermission');

router.post(
  '/create',
  authenticateUser,
  checkStaffPermission('restaurant', 'add'),
  variantController.createVariant
);

router.post(
  '/all',
  authenticateUser,
  checkStaffPermission('restaurant', 'view'),
  variantController.getAllVariants
);

router.post(
  '/by-sub/:subcategory_id',
  authenticateUser,
  checkStaffPermission('restaurant', 'view'),
  variantController.getVariantsBySubcategoryId
);

router.get(
  '/:id',
  authenticateUser,
  checkStaffPermission('restaurant', 'view'),
  variantController.getVariantById
);

router.put(
  '/:id',
  authenticateUser,
  checkStaffPermission('restaurant', 'update'),
  variantController.updateVariant
);

router.delete(
  '/:id',
  authenticateUser,
  checkStaffPermission('restaurant', 'delete'),
  variantController.deleteVariant
);

module.exports = router;

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
 *             required: [subcategory_id, name, price]
 *             properties:
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
 *     responses:
 *       201:
 *         description: Variant created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /variant/all:
 *   post:
 *     summary: Get all variants (with optional filters)
 *     tags: [Variants]
 *     responses:
 *       200:
 *         description: List of variants
 */

/**
 * @swagger
 * /variant/by-sub/{subcategory_id}:
 *   post:
 *     summary: Get all variants by subcategory
 *     tags: [Variants]
 *     parameters:
 *       - in: path
 *         name: subcategory_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subcategory ID
 *     responses:
 *       200:
 *         description: List of variants
 *       404:
 *         description: No variants found
 */

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
 *     responses:
 *       200:
 *         description: Variant updated successfully
 *       404:
 *         description: Variant not found
 */

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
 *         description: Variant deleted successfully
 *       404:
 *         description: Variant not found
 */

