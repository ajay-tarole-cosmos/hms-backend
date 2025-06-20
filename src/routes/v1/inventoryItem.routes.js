const router = require('express').Router();
const ctrl = require('../../controllers/inventoryItem.controller');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const checkStaffPermission = require('../../middlewares/checkResourcePermission');

router.post(
  '/create',
  authenticateUser,
  checkStaffPermission('departments', 'add'),
  ctrl.create
);

router.post(
  '/all',
  authenticateUser,
  checkStaffPermission('departments', 'view'),
  ctrl.getAll
);

router.post(
  '/by-category/:category_id',
  authenticateUser,
  checkStaffPermission('departments', 'view'),
  ctrl.getInventoryByCategoryId
);

router.post(
  '/:id',
  authenticateUser,
  checkStaffPermission('departments', 'view'),
  ctrl.getOne
);

router.put(
  '/:id',
  authenticateUser,
  checkStaffPermission('departments', 'update'),
  ctrl.update
);

// New route for recording consumption
router.post(
  '/:id/consume',
  authenticateUser,
  checkStaffPermission('departments', 'update'),
  ctrl.recordConsumption
);

router.delete(
  '/:id',
  authenticateUser,
  checkStaffPermission('departments', 'delete'),
  ctrl.delete
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Inventory Items
 *   description: Endpoints for managing inventory items
 */

/**
 * @swagger
 * /inventories/create:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - name
 *               - quantity
 *             properties:
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               unit:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inventory item created
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /inventories/all:
 *   post:
 *     summary: Get all inventory items
 *     tags: [Inventory Items]
 *     responses:
 *       200:
 *         description: List of all inventory items
 */

/**
 * @swagger
 * /inventories/by-category/{category_id}:
 *   post:
 *     summary: Get all inventories
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
 * /inventories/{id}:
 *   post:
 *     summary: Get a specific inventory item by ID
 *     tags: [Inventory Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item found
 *       404:
 *         description: Item not found
 */

/**
 * @swagger
 * /inventories/{id}:
 *   put:
 *     summary: Update an inventory item by ID
 *     tags: [Inventory Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               unit:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated
 *       404:
 *         description: Item not found
 */

/**
 * @swagger
 * /inventories/{id}:
 *   delete:
 *     summary: Delete an inventory item by ID
 *     tags: [Inventory Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Inventory item ID
 *     responses:
 *       204:
 *         description: Item deleted
 *       404:
 *         description: Item not found
 */

