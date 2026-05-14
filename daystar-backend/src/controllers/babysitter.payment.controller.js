

const { BabysitterPaymentModel, AttendanceModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');

// Payment rates as defined in the exam spec
const RATES = {
  half_day: 2000, // UGX 2,000 per child for half-day session
  full_day: 5000, // UGX 5,000 per child for full-day session
};

/**
 * GET /api/babysitter-payments
 * Manager only — returns payment records with optional filters
 * Query: ?date=2025-04-15&babysitter_id=1&is_cleared=false
 */
async function getAll(req, res, next) {
  try {
    const { date, babysitter_id, is_cleared } = req.query;

    const filters = {
      date,
      babysitter_id,
      // Convert string 'true'/'false' to boolean for the model
      is_cleared: is_cleared !== undefined ? is_cleared === 'true' : undefined,
    };

    // BabysitterPaymentModel.findWithFilters() — joins babysitter names
    const records = await BabysitterPaymentModel.findWithFilters(filters);

    // BabysitterPaymentModel.getTotalUncleared() — total owed to babysitters
    const uncleared = await BabysitterPaymentModel.getTotalUncleared();

    return res.status(200).json({
      success: true,
      count: records.length,
      total_owed_ugx: uncleared.total_ugx,
      uncleared_count: uncleared.count,
      data: records,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/babysitter-payments/generate
 * Manager only — generates payment records from today's attendance
 *
 * Flow:
 * 1. Read attendance for the date (grouped by babysitter + session type)
 * 2. Calculate payment per babysitter using exam rates
 * 3. Upsert payment records (safe to call multiple times for same date)
 *
 * Body: { date: "2025-04-15" } (defaults to today)
 */
async function generate(req, res, next) {
  try {
    const date = req.body.date || new Date().toISOString().split('T')[0];

    // AttendanceModel.getForPaymentCalculation() — groups by babysitter + session type
    const attendanceRows = await AttendanceModel.getForPaymentCalculation(date);

    if (attendanceRows.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No attendance records found for ${date}. No payments generated.`,
        data: [],
      });
    }

    // Pivot: { babysitterId: { half_day: N, full_day: N } }
    const byBabysitter = {};
    for (const row of attendanceRows) {
      const bid = row.babysitter_id;
      if (!byBabysitter[bid]) {
        byBabysitter[bid] = { half_day: 0, full_day: 0 };
      }
      byBabysitter[bid][row.session_type] += parseInt(row.child_count, 10);
    }

    // Generate one payment record per babysitter
    const results = [];
    for (const [babysitterId, counts] of Object.entries(byBabysitter)) {
      const amount_ugx =
        counts.half_day * RATES.half_day +
        counts.full_day * RATES.full_day;

      const total_children = counts.half_day + counts.full_day;

      // BabysitterPaymentModel.upsert() — creates or updates, safe to repeat
      const record = await BabysitterPaymentModel.upsert({
        babysitter_id: parseInt(babysitterId, 10),
        date,
        half_day_children: counts.half_day,
        full_day_children: counts.full_day,
        total_children,
        amount_ugx,
        created_by: req.user.id,
      });

      results.push(record);
    }

    return res.status(201).json({
      success: true,
      message: `${results.length} payment record(s) generated for ${date}.`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/babysitter-payments/:id/clear
 * Manager only — marks a payment as cleared (cash handed over)
 */
async function clear(req, res, next) {
  try {
    const { id } = req.params;

    // BaseModel.findById() — verify the payment exists
    const payment = await BabysitterPaymentModel.findById(id);
    if (!payment) throw new AppError('Payment record not found.', 404);

    if (payment.is_cleared) {
      throw new AppError('This payment has already been cleared.', 409);
    }

    // BabysitterPaymentModel.markAsCleared() — sets is_cleared, cleared_by, cleared_at
    const updated = await BabysitterPaymentModel.markAsCleared(id, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Payment marked as cleared.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, generate, clear };