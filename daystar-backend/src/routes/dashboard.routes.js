

const router = require('express').Router();
const {
  getTodayDashboard,
  getFinancialReport,
  getAttendanceReport,
  getNotifications,
  exportFinancialReport
} = require('../controllers/dashboard.controller');
const { requireAuth, requireManager } = require('../middleware/auth');
const { validateQuery } = require('../middleware/validate');
const { dateRangeQuerySchema } = require('../config/schemas');
/**
 * Dashboard & Reports Routes
 * Base path: /api
 * All routes require authentication
 */


/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Today's operational summary
 *   - name: Reports
 *     description: Financial and attendance reports
 *   - name: Notifications
 *     description: In-app notification management
 */

/**
 * @swagger
 * /api/dashboard/today:
 *   get:
 *     summary: Get today's complete operational dashboard
 *     tags: [Dashboard]
 *     description: Returns attendance, income, expenses, alerts in one request using parallel queries
 *     responses:
 *       200:
 *         description: Today's dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:               { type: string }
 *                     attendance:         { type: object }
 *                     income_today_ugx:   { type: integer }
 *                     expenses_today_ugx: { type: integer }
 *                     net_today_ugx:      { type: integer }
 *                     uncleared_payments: { type: object }
 *                     unresolved_incidents: { type: integer }
 */


/**
 * @swagger
 * /api/reports/financial:
 *   get:
 *     summary: Get financial report for a date range
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-05-01'
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-05-31'
 *     responses:
 *       200:
 *         description: Income vs expense summary with daily and category breakdowns
 */


/**
 * @swagger
 * /api/reports/financial/export:
 *   get:
 *     summary: Export financial report as CSV
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */



/**
 * @swagger
 * /api/reports/attendance:
 *   get:
 *     summary: Get attendance report for a date range
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Daily attendance counts and summary
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications and mark them as read
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.use(requireAuth);

// GET /api/dashboard/today — manager only
// Returns today's attendance, income, expenses, alerts in one request
router.get('/dashboard/today', requireManager, getTodayDashboard);

// GET /api/reports/financial?start=2025-04-01&end=2025-04-30 — manager only
router.get('/reports/financial', requireManager, getFinancialReport);

// GET /api/reports/attendance?start=2025-04-01&end=2025-04-30 — manager only
router.get('/reports/attendance', requireManager, getAttendanceReport);

// GET /api/notifications — both roles
// Returns last 20 notifications and marks them as read
router.get('/notifications', getNotifications);

router.get('/reports/financial', requireManager, validateQuery(dateRangeQuerySchema), getFinancialReport);
router.get('/reports/attendance', requireManager, validateQuery(dateRangeQuerySchema), getAttendanceReport);

// GET /api/reports/financial/export?start=&end=
router.get('/reports/financial/export', requireManager, exportFinancialReport);

module.exports = router;