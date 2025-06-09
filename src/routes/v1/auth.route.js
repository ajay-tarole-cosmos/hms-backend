const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const { validateLogin, validateForgotPassword, validateResetPassword, validateVerifyOtp } = require('../../validations/auth.validation');
const { authenticateUser } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and password management
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login as Super Admin or Staff
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: superadmin@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 tokens:
 *                   type: object
 *       401:
 *         description: Incorrect email or password
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request OTP for password reset (Super Admin or Staff)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: superadmin@example.com
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
 *     summary: Verify OTP for password reset (Super Admin or Staff)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: superadmin@example.com
 *               otp:
 *                 type: string
 *                 example: 123456
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
 *     summary: Reset password (Super Admin or Staff)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: superadmin@example.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: OTP not requested or expired
 *       401:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /auth/create-user:
 *   post:
 *     summary: Create a new user (Super Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Jane
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 example: department_admin
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 staff:
 *                   type: object
 *                   description: Created user info
 *       400:
 *         description: Invalid input or user already exists
 *       403:
 *         description: "Forbidden: Access denied"
 */

router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/verify-otp', validateVerifyOtp, authController.verifyOtp);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.post('/create-user', authController.createUserBySuperAdmin);

module.exports = router;