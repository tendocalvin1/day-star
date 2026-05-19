

const {
  AttendanceModel,
  IncomeModel,
  ExpenseModel,
  BabysitterPaymentModel,
  IncidentModel,
  NotificationModel,
} = require('../models');

/**
 * GET /api/dashboard/today
 * Manager only — returns everything needed for the dashboard in one request
 * All 6 queries run in parallel using Promise.all for performance
 */
async function getTodayDashboard(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Run all queries in parallel — do NOT run them sequentially
    const [
      attendance,
      incomeTotal,
      expensesTotal,
      uncleared,
      unresolvedIncidents,
      unreadNotifications,
    ] = await Promise.all([
      // AttendanceModel.getDailySummary() — present, still_in, full_day, half_day counts
      AttendanceModel.getDailySummary(today),

      // IncomeModel.getTodayTotal() — sum of all parent payments today
      IncomeModel.getTodayTotal(today),

      // ExpenseModel.getTodayTotal() — sum of all expenses today
      ExpenseModel.getTodayTotal(today),

      // BabysitterPaymentModel.getTotalUncleared() — { count, total_ugx }
      BabysitterPaymentModel.getTotalUncleared(),

      // IncidentModel.countUnresolved() — number of open incidents
      IncidentModel.countUnresolved(),

      // NotificationModel.countUnread() — unread count for bell badge
      NotificationModel.countUnread(req.user.id),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        date: today,
        attendance,
        income_today_ugx: incomeTotal,
        expenses_today_ugx: expensesTotal,
        net_today_ugx: incomeTotal - expensesTotal,
        uncleared_payments: uncleared,
        unresolved_incidents: unresolvedIncidents,
        unread_notifications: unreadNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/financial
 * Manager only — income vs expense report for a date range
 * Query: ?start=2025-04-01&end=2025-04-30
 */
async function getFinancialReport(req, res, next) {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Both start and end query parameters are required. Format: YYYY-MM-DD',
      });
    }

    const [totalIncome, totalExpenses, incomeByDay, expensesByCategory] = await Promise.all([
      // IncomeModel.getTotalForRange() — sum of income in period
      IncomeModel.getTotalForRange(start, end),

      // ExpenseModel.getTotalForRange() — sum of expenses in period
      ExpenseModel.getTotalForRange(start, end),

      // IncomeModel.getDailyTotalsForRange() — daily data for line/bar chart
      IncomeModel.getDailyTotalsForRange(start, end),

      // ExpenseModel.getByCategory() — category breakdown for pie chart
      ExpenseModel.getByCategory(start, end),
    ]);

    const netAmount = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0
      ? Math.round((netAmount / totalIncome) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        period: { start, end },
        summary: {
          total_income_ugx: totalIncome,
          total_expenses_ugx: totalExpenses,
          net_ugx: netAmount,
          profit_margin_percent: profitMargin,
        },
        income_by_day: incomeByDay,         // for bar/line chart
        expenses_by_category: expensesByCategory, // for pie chart
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/attendance
 * Manager only — attendance trends for a date range
 * Query: ?start=2025-04-01&end=2025-04-30
 */
async function getAttendanceReport(req, res, next) {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Both start and end query parameters are required. Format: YYYY-MM-DD',
      });
    }

    // AttendanceModel.getDailyCountsInRange() — day by day totals for chart
    const daily = await AttendanceModel.getDailyCountsInRange(start, end);

    const totalSessions = daily.reduce((sum, d) => sum + parseInt(d.total), 0);
    const averageDaily = daily.length > 0
      ? Math.round(totalSessions / daily.length)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        period: { start, end },
        summary: {
          total_sessions: totalSessions,
          days_tracked: daily.length,
          average_daily_attendance: averageDaily,
        },
        daily, // array of { date, total, full_day, half_day }
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/notifications
 * Both roles — returns recent notifications and marks them as read
 */
async function getNotifications(req, res, next) {
  try {
    // NotificationModel.findForUser() — last 20 notifications for this user
    const notifications = await NotificationModel.findForUser(req.user.id);

    // NotificationModel.markAllRead() — clears the unread badge
    await NotificationModel.markAllRead(req.user.id);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * GET /api/reports/financial/export
 * Manager only — exports financial data as CSV
 * Query: ?start=2026-05-01&end=2026-05-31
 */
async function exportFinancialReport(req, res, next) {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'start and end query parameters are required.',
      });
    }

    const [incomeRecords, expenseRecords] = await Promise.all([
      IncomeModel.findWithFilters({ start, end }),
      ExpenseModel.findWithFilters({ start, end }),
    ]);

    // Build CSV content
    const rows = [
      // Header row
      'Type,Date,Description,Category,Amount (UGX),Payment Method',

      // Income rows
      ...incomeRecords.map((r) =>
        `Income,${r.payment_date},${r.child_name || 'N/A'},Parent Payment,${r.amount_ugx},${r.payment_method}`
      ),

      // Expense rows
      ...expenseRecords.map((r) =>
        `Expense,${r.expense_date},${r.description},${r.category.replace(/_/g, ' ')},${r.amount_ugx},N/A`
      ),
    ];

    const csv = rows.join('\n');
    const filename = `daystar-financial-report-${start}-to-${end}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTodayDashboard,
  getFinancialReport,
  getAttendanceReport,
  getNotifications,
  exportFinancialReport
};