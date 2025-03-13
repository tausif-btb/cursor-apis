const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { 
  registerValidation, 
  loginValidation, 
  validate 
} = require('../middleware/validationMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new employee
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - department
 *             properties:
 *               name:
 *                 type: string
 *                 description: Employee name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Employee password (min 6 characters)
 *               role:
 *                 type: string
 *                 enum: [employee, admin]
 *                 description: Employee role (default is employee)
 *               department:
 *                 type: string
 *                 description: Employee department
 *     responses:
 *       201:
 *         description: Employee successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       400:
 *         description: Validation error or employee already exists
 *       500:
 *         description: Server error
 */
router.post('/register', registerValidation, validate, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the application
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Employee password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', loginValidation, validate, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout from the application
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 *       401:
 *         description: Not authorized
 */
router.post('/logout', protect, logout);

module.exports = router; 