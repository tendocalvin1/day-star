
const router = require('express').Router();
const { login, getMe } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema } = require('../config/schemas');

/**
 * Auth Routes
 * Base path: /api/auth
 */

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me
router.get('/me', requireAuth, getMe);

module.exports = router;