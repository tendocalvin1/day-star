

const router = require('express').Router();
const {
  getTodayDashboard,
  getFinancialReport,
  getAttendanceReport,
  getNotifications,
} = require('../controllers/dashboard.controller');
const { requireAuth, requireManager } = require('../middleware/auth');

/**
 * Dashboard & Reports Routes
 * Base path: /api
 * All routes require authentication
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

module.exports = router;