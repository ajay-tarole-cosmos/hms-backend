const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const { validateLogin, validateForgotPassword, validateResetPassword, validateVerifyOtp } = require('../../validations/auth.validation');
const { authenticateUser, authorizeRoles } = require('../../middlewares/authMiddleware');
const checkStaffPermission = require('../../middlewares/checkResourcePermission');

router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/verify-otp', validateVerifyOtp, authController.verifyOtp);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.post('/create-user',authenticateUser,authorizeRoles('super_admin', 'admin'), authController.createUser);
router.post('/logout', authenticateUser, authController.logout);
router.post('/staff/:id/permissions', authenticateUser, checkStaffPermission('setting', 'update'), authController.assignPermissions);
router.post('/:staffId/permissions',authenticateUser, authController.getStaffPermissions);
router.post('/staff',authenticateUser, checkStaffPermission('setting', 'view'), authController.getStaff );
router.post('/staff/default/:role',authenticateUser,authorizeRoles('super_admin', 'admin'), authController.getDefaultPermissions);
// // Protected routes example
// router.get('/profile', authenticate, (req, res) => {
//   res.json({ user: req.user });
// });

// // Admin only route example
// router.get('/admin/dashboard', 
//   authenticate, 
//   authorize('super_admin', 'admin'),
//   (req, res) => {
//     res.json({ message: 'Admin dashboard data' });
//   }
// );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Authorization APIs
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Staff login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and invalidate tokens
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       404:
 *         description: No user found with this email
 */

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: OTP not requested or expired
 *       401:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, password]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: OTP not requested or expired
 *       401:
 *         description: Invalid or expired OTP / OTP not verified
 */

/**
 * @swagger
 * /auth/create-user:
 *   post:
 *     summary: Create a new staff user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, role]
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               hotel_id:
 *                 type: string
 *               has_global_access:
 *                 type: boolean
 *               department_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff user created successfully
 *       400:
 *         description: Email, password, and role are required or user already exists
 *       403:
 *         description: Not allowed to assign this role
 */

/**
 * @swagger
 * /auth/staff/{id}/permissions:
 *   post:
 *     summary: Assign permissions to a staff user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Staff ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     resource:
 *                       type: string
 *                     can_view:
 *                       type: boolean
 *                     can_add:
 *                       type: boolean
 *                     can_update:
 *                       type: boolean
 *                     can_delete:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Permissions assigned successfully
 */

/**
 * @swagger
 * /auth/{staffId}/permissions:
 *   post:
 *     summary: Get permissions of a staff user
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff permissions fetched successfully
 */


// const express = require('express');
// const router = express.Router();
// const { authController } = require('../controllers/auth.controller');
// const { verifyToken, checkRole, checkPermission } = require('../middleware/auth.middleware');

// // Public routes
// router.post('/login', authController.login);

// // Protected routes with role-based access
// // Example 1: Route accessible only by Managers and SuperAdmins
// router.get('/staff-management', 
//     verifyToken, 
//     checkRole(['Manager', 'SuperAdmin']), 
//     (req, res) => {
//         res.json({ message: 'Staff management access granted' });
//     }
// );

// // Protected routes with permission-based access
// // Example 1: View reservations
// router.get('/reservations', 
//     verifyToken, 
//     checkPermission('reservations', 'view'), 
//     (req, res) => {
//         res.json({ message: 'View reservations access granted' });
//     }
// );

// // Example 2: Add new reservation
// router.post('/reservations', 
//     verifyToken, 
//     checkPermission('reservations', 'add'), 
//     (req, res) => {
//         res.json({ message: 'Add reservation access granted' });
//     }
// );

// // Example 3: Update reservation
// router.put('/reservations/:id', 
//     verifyToken, 
//     checkPermission('reservations', 'update'), 
//     (req, res) => {
//         res.json({ message: 'Update reservation access granted' });
//     }
// );

// // Example 4: Delete reservation
// router.delete('/reservations/:id', 
//     verifyToken, 
//     checkPermission('reservations', 'delete'), 
//     (req, res) => {
//         res.json({ message: 'Delete reservation access granted' });
//     }
// );

// // Example 5: Combined role and permission check
// router.get('/reports', 
//     verifyToken, 
//     checkRole(['Manager', 'SuperAdmin', 'HotelOwner']),
//     checkPermission('reports', 'view'),
//     (req, res) => {
//         res.json({ message: 'Reports access granted' });
//     }
// );

// module.exports = router; z