// In auth.routes.js
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to get JWT token
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
 *                 example: manager@daystar.ug
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

const router = require('express').Router();
const { login, getMe, changePassword} = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema } = require('../config/schemas');

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me
router.get('/me', requireAuth, getMe);

router.put('/change-password', requireAuth, changePassword);

module.exports = router;