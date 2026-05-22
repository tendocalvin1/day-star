

const { BabysitterPaymentModel, AttendanceModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger'); 
const { addPaymentJob } = require('../config/queue');

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
 * Manager only — generates payment records from today's attendance asynchronously
 *
 * Flow:
 * 1. Queue a payment calculation job
 * 2. Return 202 Accepted
 *
 * Body: { date: "2025-04-15" } (defaults to today)
 */
async function generate(req, res, next) {
  try {
    const date = req.body.date || new Date().toISOString().split('T')[0];

    // Enqueue background payment processing job
    await addPaymentJob({
      date,
      userId: req.user.id,
    });

    logger.info('Babysitter payment generation job enqueued', {
      date,
      managerId: req.user.id,
    });

    return res.status(202).json({
      success: true,
      message: `Payment generation job for ${date} has been enqueued.`,
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