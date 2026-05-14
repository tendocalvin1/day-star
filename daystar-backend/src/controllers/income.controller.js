

const { IncomeModel, ChildModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/income
 * Manager only — returns income records with optional filters
 * Query: ?start=2025-04-01&end=2025-04-30&child_id=1
 */
async function getAll(req, res, next) {
  try {
    const { start, end, child_id } = req.query;

    // IncomeModel.findWithFilters() — joins children table for names
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

    // Verify child exists if child_id is provided
    if (data.child_id) {
      const child = await ChildModel.findOne({ id: data.child_id, is_active: true });
      if (!child) throw new AppError('Child not found.', 404);
    }

    // BaseModel.create() — inserts and returns the new record
    const record = await IncomeModel.create({
      ...data,
      created_by: req.user.id,
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
 * Income records can be deleted and re-entered if a mistake was made
 */
async function remove(req, res, next) {
  try {
    // BaseModel.findById() — verify it exists first
    const record = await IncomeModel.findById(req.params.id);
    if (!record) throw new AppError('Income record not found.', 404);

    // BaseModel.deleteById() — hard delete is acceptable for income corrections
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