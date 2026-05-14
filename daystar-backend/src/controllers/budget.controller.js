

const { BudgetModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/budgets
 * Manager only — returns all budgets with current spend calculated
 */
async function getAll(req, res, next) {
  try {
    // BudgetModel.findAllWithSpend() — calculates spent, remaining, percent_used
    // and adds status: 'on_track' | 'near_limit' | 'exceeded' to each budget
    const budgets = await BudgetModel.findAllWithSpend();

    return res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/budgets/:id
 * Manager only — returns a single budget with spend details
 */
async function getById(req, res, next) {
  try {
    // BaseModel.findById() — get raw budget record
    const budget = await BudgetModel.findById(req.params.id);
    if (!budget) throw new AppError('Budget not found.', 404);

    return res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/budgets
 * Manager only — creates a budget for a category and period
 */
async function create(req, res, next) {
  try {
    // BaseModel.create() — inserts and returns the new record
    const budget = await BudgetModel.create({
      ...req.validatedData,
      created_by: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Budget created successfully.',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/budgets/:id
 * Manager only — updates a budget amount or period
 */
async function update(req, res, next) {
  try {
    const existing = await BudgetModel.findById(req.params.id);
    if (!existing) throw new AppError('Budget not found.', 404);

    // BaseModel.updateById() — updates and returns updated record
    const updated = await BudgetModel.updateById(req.params.id, req.validatedData);

    return res.status(200).json({
      success: true,
      message: 'Budget updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/budgets/:id
 * Manager only — deletes a budget
 */
async function remove(req, res, next) {
  try {
    const existing = await BudgetModel.findById(req.params.id);
    if (!existing) throw new AppError('Budget not found.', 404);

    // BaseModel.deleteById() — hard delete is fine for budgets
    await BudgetModel.deleteById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Budget deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };