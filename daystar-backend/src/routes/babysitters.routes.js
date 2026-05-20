

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

/**
 * @swagger
 * tags:
 *   name: Babysitters
 *   description: Babysitter registration and management
 */

/**
 * @swagger
 * /api/babysitters:
 *   get:
 *     summary: Get all active babysitters
 *     tags: [Babysitters]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of babysitters with computed ages
 */


/**
 * @swagger
 * /api/babysitters/{id}:
 *   get:
 *     summary: Get babysitter by ID with linked user account
 *     tags: [Babysitters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Babysitter details
 *       404:
 *         description: Babysitter not found
 */


/**
 * @swagger
 * /api/babysitters:
 *   post:
 *     summary: Register a new babysitter
 *     tags: [Babysitters]
 *     description: Age is validated from date_of_birth — must be between 21 and 35 years old
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, phone, nin, date_of_birth, next_of_kin_name, next_of_kin_phone]
 *             properties:
 *               first_name:        { type: string, example: Grace }
 *               last_name:         { type: string, example: Nakato }
 *               phone:             { type: string, example: '0772123456' }
 *               nin:               { type: string, example: CM97100200001 }
 *               date_of_birth:     { type: string, format: date, example: '1998-05-14' }
 *               next_of_kin_name:  { type: string, example: Sarah Nakato }
 *               next_of_kin_phone: { type: string, example: '0701234567' }
 *               create_account:    { type: boolean, example: true }
 *               account_email:     { type: string, example: grace@daystar.ug }
 *               account_password:  { type: string, example: password123 }
 *     responses:
 *       201:
 *         description: Babysitter registered
 *       409:
 *         description: NIN already exists
 *       422:
 *         description: Age validation failed or invalid input
 */


/**
 * @swagger
 * /api/babysitters/{id}:
 *   put:
 *     summary: Update babysitter details
 *     tags: [Babysitters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Babysitter updated
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /api/babysitters/{id}:
 *   delete:
 *     summary: Deactivate babysitter (soft delete)
 *     tags: [Babysitters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Babysitter deactivated
 *       404:
 *         description: Not found
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