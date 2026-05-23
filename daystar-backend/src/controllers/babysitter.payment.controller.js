

const { BabysitterPaymentModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger'); 
const db = require('../config/database');
const { generateDailyPayments } = require('../services/paymentCalculator');
const auditService = require('../services/auditService');


/**
 * GET /api/babysitter-payments
 * Manager only — returns payment records with optional filters
 * Query: ?date=2025-04-15&babysitter_id=1&is_cleared=false
 */
async function getAll(req, res, next) {
  try {
    const { date, babysitter_id, is_cleared } = req.validatedQuery || req.query;

    const filters = {
      date,
      babysitter_id,
      is_cleared,
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
 * Manager only — generates payment records from attendance for a date
 *
 * Flow:
 * 1. Read attendance for the date
 * 2. Calculate and upsert per-babysitter payment records
 * 3. Return generated/updated records
 *
 * Body: { date: "2025-04-15" } (defaults to today)
 */
async function generate(req, res, next) {
  try {
    const date = req.validatedData.date || new Date().toISOString().split('T')[0];

    const records = await generateDailyPayments(date, db, req.user.id);

    await auditService.log({
      actorId: req.user.id,
      userEmail: req.user.email,
      action: 'babysitter_payments.generated',
      entityType: 'babysitter_payment',
      entityId: null,
      newValues: records,
      metadata: {
        date,
        generatedCount: records.length,
        updatedCount: records.filter((record) => record.updated).length,
      },
      req,
    });

    logger.info('Babysitter payments generated', {
      date,
      managerId: req.user.id,
      count: records.length,
    });

    return res.status(200).json({
      success: true,
      message: `Payment records for ${date} generated successfully.`,
      count: records.length,
      data: records,
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

    await auditService.log({
      actorId: req.user.id,
      userEmail: req.user.email,
      action: 'babysitter_payment.cleared',
      entityType: 'babysitter_payment',
      entityId: updated.id,
      oldValues: payment,
      newValues: updated,
      req,
    });

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
