const router = require('express').Router();
const { deparmentCateegoryController } = require('../../controllers');
const { authenticateUser } = require('../../middlewares/authMiddleware');
const checkStaffPermission = require('../../middlewares/checkResourcePermission');

router.post(
    '/create',
    authenticateUser,
    checkStaffPermission('departments', 'add'),
    deparmentCateegoryController.create
  );
  
  router.post(
    '/all',
    authenticateUser,
    checkStaffPermission('departments', 'view'),
    deparmentCateegoryController.getAll
  );
  
  router.post(
    '/by-department/:department_id',
    authenticateUser,
    checkStaffPermission('departments', 'view'),
    deparmentCateegoryController.getCategoryByDepartmentId
  );
  
  router.post(
    '/:id',
    authenticateUser,
    checkStaffPermission('departments', 'view'),
    deparmentCateegoryController.getOne
  );
  
  router.put(
    '/:id',
    authenticateUser,
    checkStaffPermission('departments', 'update'),
    deparmentCateegoryController.update
  );
  
  router.delete(
    '/:id',
    authenticateUser,
    checkStaffPermission('departments', 'delete'),
    deparmentCateegoryController.remove
  );
  

module.exports = router;
/**
 * @swagger
 * tags:
 *   name: Department Categories
 *   description: Endpoints for managing department department-categories
 */

/**
 * @swagger
 * /department-categories/create:
 *   post:
 *     summary: Create a new department category
 *     tags: [Department Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - department_id
 *               - name
 *             properties:
 *               department_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department category created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /department-categories/all:
 *   post:
 *     summary: Get all department department-categories
 *     tags: [Department Categories]
 *     responses:
 *       200:
 *         description: List of all department department-categories
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
 * /department-categories/{id}:
 *   post:
 *     summary: Get a specific department category by ID
 *     tags: [Department Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Department category details
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /department-categories/{id}:
 *   put:
 *     summary: Update a department category
 *     tags: [Department Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
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
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /department-categories/{id}:
 *   delete:
 *     summary: Delete a department category
 *     tags: [Department Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       204:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */

