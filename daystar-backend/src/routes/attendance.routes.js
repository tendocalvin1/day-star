

const router = require('express').Router();
const { getByDate, getDailySummary, checkIn, checkOut } = require('../controllers/attendance.controller');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { checkInSchema, checkOutSchema } = require('../config/schemas');
const { validateQuery } = require('../middleware/validate');
const { dateQuerySchema } = require('../config/schemas');

/**
 * Attendance Routes
 * Base path: /api/attendance
 * All routes require authentication
 * Both manager and babysitter can check children in and out
 */

router.use(requireAuth);

// GET /api/attendance?date=2025-04-15
// Returns all attendance records for a date with child + babysitter info
router.get('/', getByDate);

// GET /api/attendance/summary?date=2025-04-15
// Returns daily totals + per-babysitter breakdown
// Must be defined BEFORE /:id to avoid route conflict
router.get('/summary', getDailySummary);

// POST /api/attendance/check-in
// Prevents duplicate check-in for same child same day
router.post('/check-in', validate(checkInSchema), checkIn);

// PUT /api/attendance/:id/check-out
router.put('/:id/check-out', validate(checkOutSchema), checkOut);

router.get('/', validateQuery(dateQuerySchema), getByDate);
router.get('/summary', validateQuery(dateQuerySchema), getDailySummary);

module.exports = router;