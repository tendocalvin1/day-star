

const router = require('express').Router();
const { getByDate, getDailySummary, checkIn, checkOut } = require('../controllers/attendance.controller');
const { requireAuth } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');
const { checkInSchema, checkOutSchema, dateQuerySchema } = require('../config/schemas');

router.use(requireAuth);

// GET /api/attendance?date=2026-05-19
router.get('/', validateQuery(dateQuerySchema), getByDate);

// GET /api/attendance/summary?date=2026-05-19
router.get('/summary', validateQuery(dateQuerySchema), getDailySummary);

// POST /api/attendance/check-in
router.post('/check-in', validate(checkInSchema), checkIn);

// PUT /api/attendance/:id/check-out
router.put('/:id/check-out', validate(checkOutSchema), checkOut);

module.exports = router;