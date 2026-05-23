const router = require('express').Router();
const { getAll, create, resolve } = require('../controllers/incident.controller');
const { requireAuth, requireManager } = require('../middleware/auth');
const { validate, validateQuery, validateParams } = require('../middleware/validate');
const {
  createIncidentSchema,
  resolveIncidentSchema,
  incidentQuerySchema,
  idParamSchema,
} = require('../config/schemas');

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

/**
 * @swagger
 * tags:
 *   name: Incidents
 *   description: Babysitter incident reporting and manager resolution workflow
 */

/**
 * @swagger
 * /api/incidents:
 *   get:
 *     summary: List incidents
 *     tags: [Incidents]
 *     description: Managers see all incidents. Babysitters see only incidents linked to their babysitter profile.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: is_resolved
 *         schema:
 *           type: boolean
 *         description: Filter by resolution status.
 *     responses:
 *       200:
 *         description: Incidents visible to the current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: integer, example: 2 }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Incident' }
 *       401: { description: Missing or invalid token }
 *       422: { description: Invalid filters, content: { application/json: { schema: { $ref: '#/components/schemas/ValidationError' } } } }
 *   post:
 *     summary: File incident report
 *     tags: [Incidents]
 *     description: Babysitter-only workflow. Managers cannot file babysitter incident reports.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [child_id, description]
 *             properties:
 *               child_id: { type: integer, example: 1 }
 *               description: { type: string, example: Child scraped knee during outdoor play and received first aid. }
 *               severity: { type: string, enum: [low, medium, high], example: low }
 *     responses:
 *       201:
 *         description: Incident report created and manager notified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Incident reported. Manager has been notified. }
 *                 data: { $ref: '#/components/schemas/Incident' }
 *       403: { description: Only babysitters can file incident reports }
 *       404: { description: Child not found }
 *       422: { description: Validation failed }
 */

/**
 * @swagger
 * /api/incidents/{id}/resolve:
 *   put:
 *     summary: Resolve incident
 *     tags: [Incidents]
 *     description: Manager-only workflow. Adds resolution notes and marks an incident as resolved.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resolution_notes]
 *             properties:
 *               resolution_notes: { type: string, example: Parent notified and child monitored for the rest of the day. }
 *     responses:
 *       200:
 *         description: Incident marked as resolved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Incident marked as resolved. }
 *                 data: { $ref: '#/components/schemas/Incident' }
 *       403: { description: Manager role required }
 *       404: { description: Incident not found }
 *       409: { description: Incident already resolved }
 *       422: { description: Validation failed }
 */

router.use(requireAuth);

// GET /api/incidents?is_resolved=false
// Manager: all incidents | Babysitter: own incidents only (enforced in controller)
router.get('/', validateQuery(incidentQuerySchema), getAll);

// POST /api/incidents
// Babysitter files a report — controller enforces babysitter role
router.post('/', validate(createIncidentSchema), create);

// PUT /api/incidents/:id/resolve — manager only
router.put('/:id/resolve', requireManager, validateParams(idParamSchema), validate(resolveIncidentSchema), resolve);

module.exports = router;
