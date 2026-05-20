

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


/**
 * @swagger
 * tags:
 *   name: Children
 *   description: Child enrollment and management
 */

/**
 * @swagger
 * /api/children:
 *   get:
 *     summary: Get all children with computed ages
 *     tags: [Children]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by child name
 *       - in: query
 *         name: session_type
 *         schema:
 *           type: string
 *           enum: [half_day, full_day]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *     responses:
 *       200:
 *         description: List of children
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:    { type: boolean }
 *                 count:      { type: integer }
 *                 total:      { type: integer }
 *                 pagination: { type: object }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Child'
 */


/**
 * @swagger
 * /api/children/not-checked-in:
 *   get:
 *     summary: Get children not yet checked in for a date
 *     tags: [Children]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-05-20'
 *     responses:
 *       200:
 *         description: Children available for check-in
 */ 


/**
 * @swagger
 * /api/children/{id}:
 *   get:
 *     summary: Get child by ID with attendance history
 *     tags: [Children]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Child details with recent attendance
 *       404:
 *         description: Child not found
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
/**
 * @swagger
 * /api/children/{id}:
 *   delete:
 *     summary: Deactivate a child record (soft delete)
 *     tags: [Children]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Child deactivated
 *       404:
 *         description: Child not found
 */

// DELETE /api/children/:id — manager only, soft delete
router.delete('/:id', requireManager, remove);

module.exports = router;