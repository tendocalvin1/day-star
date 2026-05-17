const router = require('express').Router();
const { getAll, create, resolve } = require('../controllers/incident.controller');
const { requireAuth, requireManager } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createIncidentSchema, resolveIncidentSchema } = require('../config/schemas');

/**
 * Incident Routes
 * Base path: /api/incidents
 * All routes require authentication
 *
 * Role behaviour:
 *  - Manager: sees ALL incidents, can resolve them
 *  - Babysitter: sees ONLY their own incidents, can create them
 * Role enforcement happens inside the controller, not the route
 */

router.use(requireAuth);

// GET /api/incidents?is_resolved=false
// Manager: all incidents | Babysitter: own incidents only (enforced in controller)
router.get('/', getAll);

// POST /api/incidents
// Babysitter files a report — controller enforces babysitter role
router.post('/', validate(createIncidentSchema), create);

// PUT /api/incidents/:id/resolve — manager only
router.put('/:id/resolve', requireManager, validate(resolveIncidentSchema), resolve);

module.exports = router;