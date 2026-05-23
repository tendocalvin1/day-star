const router = require('express').Router();
const { getAll: getAllIncome, create: createIncome, remove: removeIncome } = require('../controllers/income.controller');
const { getAll: getAllExpenses, create: createExpense, update: updateExpense, remove: removeExpense } = require('../controllers/expense.controller');
const { getAll: getAllBudgets, getById: getBudgetById, create: createBudget, update: updateBudget, remove: removeBudget } = require('../controllers/budget.controller');
const { getAll: getAllPayments, generate: generatePayments, clear: clearPayment } = require('../controllers/babysitter.payment.controller');
const { requireAuth, requireManager } = require('../middleware/auth');
const { validate, validateQuery, validateParams } = require('../middleware/validate');
const {
  createIncomeSchema,
  createExpenseSchema,
  updateExpenseSchema,
  createBudgetSchema,
  idParamSchema,
  incomeQuerySchema,
  expenseQuerySchema,
  paymentQuerySchema,
  generatePaymentsSchema,
} = require('../config/schemas');

/**
 * Finance Routes
 * Base path: /api
 * All financial routes are manager only
 *
 * Covers:
 *  - Income (parent payments)
 *  - Expenses (operational costs)
 *  - Budgets (monthly/weekly category limits)
 *  - Babysitter payments (daily auto-calculated)
 */

/**
 * @swagger
 * tags:
 *   - name: Finance
 *     description: Manager-only income, expense, budget, and babysitter payment operations
 */

/**
 * @swagger
 * /api/income:
 *   get:
 *     summary: List income records
 *     tags: [Finance]
 *     description: Manager-only endpoint. Supports optional date range and child filters.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: start
 *         schema: { type: string, format: date, example: '2026-05-01' }
 *       - in: query
 *         name: end
 *         schema: { type: string, format: date, example: '2026-05-31' }
 *       - in: query
 *         name: child_id
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Income records and total amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: integer, example: 3 }
 *                 total_ugx: { type: integer, example: 65000 }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Income' }
 *       401: { description: Missing or invalid token }
 *       403: { description: Manager role required }
 *       422: { description: Invalid filters, content: { application/json: { schema: { $ref: '#/components/schemas/ValidationError' } } } }
 *   post:
 *     summary: Record parent payment
 *     tags: [Finance]
 *     description: Manager-only endpoint. Creates an income record for a child payment.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount_ugx, session_type, payment_date]
 *             properties:
 *               child_id: { type: integer, nullable: true, example: 1 }
 *               amount_ugx: { type: integer, example: 25000 }
 *               session_type: { type: string, enum: [half_day, full_day] }
 *               payment_date: { type: string, format: date, example: '2026-05-20' }
 *               payment_method: { type: string, enum: [cash, mobile_money], example: cash }
 *               notes: { type: string, nullable: true, example: Parent paid cash at drop-off. }
 *     responses:
 *       201: { description: Payment recorded }
 *       401: { description: Missing or invalid token }
 *       403: { description: Manager role required }
 *       422: { description: Validation failed }
 */

/**
 * @swagger
 * /api/income/{id}:
 *   delete:
 *     summary: Delete income record
 *     tags: [Finance]
 *     description: Manager-only correction endpoint. Deletion is audit logged.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200: { description: Income record deleted }
 *       401: { description: Missing or invalid token }
 *       403: { description: Manager role required }
 *       404: { description: Income record not found }
 */

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: List expenses
 *     tags: [Finance]
 *     description: Manager-only endpoint. Supports category and date range filters.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [babysitter_salary, toys_materials, maintenance, utilities, other] }
 *       - in: query
 *         name: start
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: end
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Expense records, totals, and category breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: integer, example: 2 }
 *                 total_ugx: { type: integer, example: 115000 }
 *                 by_category: { type: object }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Expense' }
 *       422: { description: Invalid filters }
 *   post:
 *     summary: Record expense
 *     tags: [Finance]
 *     description: Manager-only endpoint. Records an expense and checks budget thresholds.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, description, amount_ugx, expense_date]
 *             properties:
 *               category: { type: string, enum: [babysitter_salary, toys_materials, maintenance, utilities, other] }
 *               description: { type: string, example: Educational toys }
 *               amount_ugx: { type: integer, example: 45000 }
 *               expense_date: { type: string, format: date, example: '2026-05-20' }
 *     responses:
 *       201: { description: Expense recorded }
 *       422: { description: Validation failed }
 */

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update expense
 *     tags: [Finance]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Expense updated }
 *       404: { description: Expense not found }
 *   delete:
 *     summary: Delete expense
 *     tags: [Finance]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Expense deleted }
 *       404: { description: Expense not found }
 */

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: List budgets with spend status
 *     tags: [Finance]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Budgets with spent, remaining, percent used, and status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: integer, example: 4 }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Budget' }
 *   post:
 *     summary: Create budget
 *     tags: [Finance]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, amount_ugx, start_date, end_date]
 *             properties:
 *               category: { type: string, enum: [babysitter_salary, toys_materials, maintenance, utilities, other] }
 *               period: { type: string, enum: [monthly, weekly], example: monthly }
 *               amount_ugx: { type: integer, example: 150000 }
 *               start_date: { type: string, format: date }
 *               end_date: { type: string, format: date }
 *     responses:
 *       201: { description: Budget created }
 *       422: { description: Validation failed }
 */

/**
 * @swagger
 * /api/babysitter-payments:
 *   get:
 *     summary: List babysitter payment records
 *     tags: [Finance]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: babysitter_id
 *         schema: { type: integer }
 *       - in: query
 *         name: is_cleared
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Payment records and uncleared totals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: integer, example: 3 }
 *                 total_owed_ugx: { type: integer, example: 42000 }
 *                 uncleared_count: { type: integer, example: 3 }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/BabysitterPayment' }
 */

/**
 * @swagger
 * /api/babysitter-payments/generate:
 *   post:
 *     summary: Generate babysitter payments from attendance
 *     tags: [Finance]
 *     description: Manager-only endpoint. Idempotently creates or updates per-babysitter payment records for a date.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date: { type: string, format: date, example: '2026-05-20' }
 *     responses:
 *       200: { description: Payments generated }
 *       422: { description: Invalid date }
 */

/**
 * @swagger
 * /api/babysitter-payments/{id}/clear:
 *   put:
 *     summary: Mark babysitter payment as cleared
 *     tags: [Finance]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Payment marked as cleared }
 *       409: { description: Payment already cleared }
 */

router.use(['/income', '/expenses', '/budgets', '/babysitter-payments'], requireAuth, requireManager);

// ── Income ─────────────────────────────────────────────────────────────────
// GET  /api/income?start=&end=&child_id=
router.get('/income', validateQuery(incomeQuerySchema), getAllIncome);

// POST /api/income
router.post('/income', validate(createIncomeSchema), createIncome);

// DELETE /api/income/:id
router.delete('/income/:id', validateParams(idParamSchema), removeIncome);

// ── Expenses ───────────────────────────────────────────────────────────────
// GET  /api/expenses?category=&start=&end=
router.get('/expenses', validateQuery(expenseQuerySchema), getAllExpenses);

// POST /api/expenses  — auto-checks budget threshold
router.post('/expenses', validate(createExpenseSchema), createExpense);

// PUT  /api/expenses/:id
router.put('/expenses/:id', validateParams(idParamSchema), validate(updateExpenseSchema), updateExpense);

// DELETE /api/expenses/:id
router.delete('/expenses/:id', validateParams(idParamSchema), removeExpense);

// ── Budgets ────────────────────────────────────────────────────────────────
// GET  /api/budgets  — includes spent/remaining/percent_used per budget
router.get('/budgets', getAllBudgets);

// GET  /api/budgets/:id
router.get('/budgets/:id', validateParams(idParamSchema), getBudgetById);

// POST /api/budgets
router.post('/budgets', validate(createBudgetSchema), createBudget);

// PUT  /api/budgets/:id
router.put('/budgets/:id', validateParams(idParamSchema), validate(createBudgetSchema), updateBudget);

// DELETE /api/budgets/:id
router.delete('/budgets/:id', validateParams(idParamSchema), removeBudget);

// ── Babysitter Payments ────────────────────────────────────────────────────
// GET  /api/babysitter-payments?date=&babysitter_id=&is_cleared=
router.get('/babysitter-payments', validateQuery(paymentQuerySchema), getAllPayments);

// POST /api/babysitter-payments/generate  body: { date }
// Reads attendance and auto-calculates amounts
router.post('/babysitter-payments/generate', validate(generatePaymentsSchema), generatePayments);

// PUT  /api/babysitter-payments/:id/clear
// Manager marks payment as cleared after handing over cash
router.put('/babysitter-payments/:id/clear', validateParams(idParamSchema), clearPayment);

module.exports = router;
