

const router = require('express').Router();
const { getAll, getById, getNotCheckedIn, create, update, remove } = require('../controllers/child.controller');
const { requireAuth, requireManager } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createChildSchema, updateChildSchema } = require('../config/schemas');

/**
 * Children Routes
 * Base path: /api/children
 * All routes require authentication
 * Write operations require manager role
 */

router.use(requireAuth);

// GET /api/children?search=&session_type=&is_active=
// Both roles can view children list
router.get('/', getAll);

// GET /api/children/not-checked-in?date=2025-04-15
// Must be defined BEFORE /:id to avoid conflict
router.get('/not-checked-in', getNotCheckedIn);

// GET /api/children/:id  — includes recent attendance history
router.get('/:id', getById);

// POST /api/children — manager only
router.post('/', requireManager, validate(createChildSchema), create);

// PUT /api/children/:id — manager only
router.put('/:id', requireManager, validate(updateChildSchema), update);

// DELETE /api/children/:id — manager only, soft delete
router.delete('/:id', requireManager, remove);

module.exports = router;