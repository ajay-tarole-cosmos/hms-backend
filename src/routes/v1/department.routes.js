const router = require('express').Router();
const { deparmentController } = require('../../controllers');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const checkStaffPermission = require('../../middlewares/checkResourcePermission');

router.post(
    '/create',
    authenticateUser,
    checkStaffPermission('departments', 'add'),
    deparmentController.create
  );
  
  router.post(
    '/all',
    authenticateUser,
    checkStaffPermission('departments', 'view'),
    deparmentController.getAll
  );
  
  router.post(
    '/:id',
    authenticateUser,
    checkStaffPermission('departments', 'view'),
    deparmentController.getOne
  );
  
  router.put(
    '/:id',
    authenticateUser,
    checkStaffPermission('departments', 'update'),
    deparmentController.update
  );
  
  router.delete(
    '/:id',
    authenticateUser,
    checkStaffPermission('departments', 'delete'),
    deparmentController.remove
  );
  

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management endpoints
 */

/**
 * @swagger
 * /departments/create:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
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
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /departments/all:
 *   post:
 *     summary: Get all departments
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: List of all departments
 */

/**
 * @swagger
 * /departments/{id}:
 *   post:
 *     summary: Get a department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department data retrieved
 *       404:
 *         description: Department not found
 */

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update a department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
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
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       404:
 *         description: Department not found
 */

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Delete a department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       204:
 *         description: Department deleted successfully
 *       404:
 *         description: Department not found
 */

