

const { IncomeModel, ChildModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const auditService = require('../services/auditService');

/**
 * GET /api/income
 * Manager only — returns income records with optional filters
 * Query: ?start=2025-04-01&end=2025-04-30&child_id=1
 */
async function getAll(req, res, next) {
  try {
    const { start, end, child_id } = req.query;
    const records = await IncomeModel.findWithFilters({ start, end, child_id });
    const totalAmount = records.reduce((sum, r) => sum + r.amount_ugx, 0);

    return res.status(200).json({
      success: true,
      count: records.length,
      total_ugx: totalAmount,
      data: records,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/income
 * Manager only — records a parent payment
 */
async function create(req, res, next) {
  try {
    const data = req.validatedData;

    if (data.child_id) {
      const child = await ChildModel.findOne({ id: data.child_id, is_active: true });
      if (!child) throw new AppError('Child not found.', 404);
    }

    const record = await IncomeModel.create({
      ...data,
      created_by: req.user.id,
    });

    // Audit log — inside the function, not outside
    await auditService.log({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'income.created',
      entityType: 'income',
      entityId: record.id,
      newValues: record,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/income/:id
 * Manager only — hard delete allowed for income correction
 */
async function remove(req, res, next) {
  try {
    const record = await IncomeModel.findById(req.params.id);
    if (!record) throw new AppError('Income record not found.', 404);

    // Audit log before deleting
    await auditService.log({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'income.deleted',
      entityType: 'income',
      entityId: record.id,
      oldValues: record,
      req,
    });

    await IncomeModel.deleteById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Income record deleted.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, create, remove };