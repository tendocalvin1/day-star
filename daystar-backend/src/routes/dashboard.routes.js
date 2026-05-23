

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
 *     security:
 *       - bearerAuth: []
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
 *                   $ref: '#/components/schemas/DashboardToday'
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Manager role required
 */


/**
 * @swagger
 * /api/reports/financial:
 *   get:
 *     summary: Get financial report for a date range
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Manager-only financial report with income, expenses, net amount, margin, and chart-ready breakdowns.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/FinancialReport' }
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Manager role required
 *       422:
 *         description: Invalid date range
 */


/**
 * @swagger
 * /api/reports/financial/export:
 *   get:
 *     summary: Export financial report as CSV
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Manager-only CSV export for finance data in a date range.
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
 *       403:
 *         description: Manager role required
 *       422:
 *         description: Invalid date range
 */



/**
 * @swagger
 * /api/reports/attendance:
 *   get:
 *     summary: Get attendance report for a date range
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Manager-only attendance trend report with daily totals and session breakdowns.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/AttendanceReport' }
 *       403:
 *         description: Manager role required
 *       422:
 *         description: Invalid date range
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications and mark them as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     description: Available to authenticated managers and babysitters. Returns recent notifications and marks them as read.
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: integer, example: 2 }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Notification' }
 *       401:
 *         description: Missing or invalid token
 */
router.use(requireAuth);

// GET /api/dashboard/today — manager only
// Returns today's attendance, income, expenses, alerts in one request
router.get('/dashboard/today', requireManager, getTodayDashboard);

// GET /api/reports/financial?start=2026-05-01&end=2026-05-31 — manager only
router.get('/reports/financial', requireManager, validateQuery(dateRangeQuerySchema), getFinancialReport);

// GET /api/reports/attendance?start=2026-05-01&end=2026-05-31 — manager only
router.get('/reports/attendance', requireManager, validateQuery(dateRangeQuerySchema), getAttendanceReport);

// GET /api/reports/financial/export?start=2026-05-01&end=2026-05-31 — manager only
router.get('/reports/financial/export', requireManager, validateQuery(dateRangeQuerySchema), exportFinancialReport);

// GET /api/notifications — both roles
// Returns last 20 notifications and marks them as read
router.get('/notifications', getNotifications);

module.exports = router;
