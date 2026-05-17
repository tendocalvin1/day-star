const router = require('express').Router();
const { getAll: getAllIncome, create: createIncome, remove: removeIncome } = require('../controllers/income.controller');
const { getAll: getAllExpenses, create: createExpense, update: updateExpense, remove: removeExpense } = require('../controllers/expense.controller');
const { getAll: getAllBudgets, getById: getBudgetById, create: createBudget, update: updateBudget, remove: removeBudget } = require('../controllers/budget.controller');
const { getAll: getAllPayments, generate: generatePayments, clear: clearPayment } = require('../controllers/babysitter.payment.controller');
const { requireAuth, requireManager } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createIncomeSchema,
  createExpenseSchema,
  updateExpenseSchema,
  createBudgetSchema,
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

router.use(requireAuth, requireManager);

// ── Income ─────────────────────────────────────────────────────────────────
// GET  /api/income?start=&end=&child_id=
router.get('/income', getAllIncome);

// POST /api/income
router.post('/income', validate(createIncomeSchema), createIncome);

// DELETE /api/income/:id
router.delete('/income/:id', removeIncome);

// ── Expenses ───────────────────────────────────────────────────────────────
// GET  /api/expenses?category=&start=&end=
router.get('/expenses', getAllExpenses);

// POST /api/expenses  — auto-checks budget threshold
router.post('/expenses', validate(createExpenseSchema), createExpense);

// PUT  /api/expenses/:id
router.put('/expenses/:id', validate(updateExpenseSchema), updateExpense);

// DELETE /api/expenses/:id
router.delete('/expenses/:id', removeExpense);

// ── Budgets ────────────────────────────────────────────────────────────────
// GET  /api/budgets  — includes spent/remaining/percent_used per budget
router.get('/budgets', getAllBudgets);

// GET  /api/budgets/:id
router.get('/budgets/:id', getBudgetById);

// POST /api/budgets
router.post('/budgets', validate(createBudgetSchema), createBudget);

// PUT  /api/budgets/:id
router.put('/budgets/:id', validate(createBudgetSchema), updateBudget);

// DELETE /api/budgets/:id
router.delete('/budgets/:id', removeBudget);

// ── Babysitter Payments ────────────────────────────────────────────────────
// GET  /api/babysitter-payments?date=&babysitter_id=&is_cleared=
router.get('/babysitter-payments', getAllPayments);

// POST /api/babysitter-payments/generate  body: { date }
// Reads attendance and auto-calculates amounts
router.post('/babysitter-payments/generate', generatePayments);

// PUT  /api/babysitter-payments/:id/clear
// Manager marks payment as cleared after handing over cash
router.put('/babysitter-payments/:id/clear', clearPayment);

module.exports = router;