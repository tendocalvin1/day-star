

const router = require('express').Router();
const { getAll, getById, create, update, remove } = require('../controllers/babysitter.controller');
const { requireAuth, requireManager } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createBabysitterSchema, updateBabysitterSchema } = require('../config/schemas');

/**
 * Babysitter Routes
 * Base path: /api/babysitters
 * All routes require authentication
 * All routes require manager role
 */

router.use(requireAuth, requireManager);

// GET /api/babysitters
router.get('/', getAll);

// GET /api/babysitters/:id
router.get('/:id', getById);

// POST /api/babysitters
router.post('/', validate(createBabysitterSchema), create);

// PUT /api/babysitters/:id
router.put('/:id', validate(updateBabysitterSchema), update);

// DELETE /api/babysitters/:id  (soft delete)
router.delete('/:id', remove);

module.exports = router;