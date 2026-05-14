

const { ExpenseModel, BudgetModel, UserModel, NotificationModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/expenses
 * Manager only — returns expenses with optional filters
 * Query: ?category=utilities&start=2025-04-01&end=2025-04-30
 */
async function getAll(req, res, next) {
  try {
    const { category, start, end } = req.query;

    // ExpenseModel.findWithFilters() — filters by category and date range
    const records = await ExpenseModel.findWithFilters({ category, start, end });

    const totalAmount = records.reduce((sum, r) => sum + r.amount_ugx, 0);

    // Group by category for the summary breakdown
    const byCategory = records.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.amount_ugx;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      count: records.length,
      total_ugx: totalAmount,
      by_category: byCategory,
      data: records,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/expenses
 * Manager only — records an expense
 * Automatically checks budget threshold and notifies manager if exceeded
 */
async function create(req, res, next) {
  try {
    const data = req.validatedData;

    // BudgetModel.checkThreshold() — checks BEFORE saving the expense
    // Returns { hasBudget, exceeded, nearLimit, budget, spent, newTotal }
    const budgetStatus = await BudgetModel.checkThreshold(
      data.category,
      data.amount_ugx,
      data.expense_date
    );

    // BaseModel.create() — save the expense
    const record = await ExpenseModel.create({
      ...data,
      created_by: req.user.id,
    });

    // If budget is exceeded, create an in-app notification for the manager
    if (budgetStatus.exceeded) {
      const manager = await UserModel.findManager();
      if (manager) {
        // NotificationModel.notify() — stores in-app notification
        await NotificationModel.notify({
          type: 'budget_exceeded',
          title: `Budget exceeded: ${data.category.replace(/_/g, ' ')}`,
          message: `The ${data.category.replace(/_/g, ' ')} budget of UGX ${budgetStatus.budget.amount_ugx.toLocaleString()} has been exceeded. Total spent: UGX ${budgetStatus.newTotal.toLocaleString()}.`,
          userId: manager.id,
          relatedType: 'budget',
        });
      }
    }

    // Build budget alert for the API response
    let budgetAlert = null;
    if (budgetStatus.exceeded) {
      budgetAlert = {
        type: 'exceeded',
        message: `Budget for ${data.category.replace(/_/g, ' ')} has been exceeded.`,
        budget_amount_ugx: budgetStatus.budget?.amount_ugx,
        total_spent_ugx: budgetStatus.newTotal,
      };
    } else if (budgetStatus.nearLimit) {
      budgetAlert = {
        type: 'near_limit',
        message: `Approaching budget limit for ${data.category.replace(/_/g, ' ')}.`,
        budget_amount_ugx: budgetStatus.budget?.amount_ugx,
        total_spent_ugx: budgetStatus.newTotal,
      };
    }

    return res.status(201).json({
      success: true,
      message: 'Expense recorded successfully.',
      data: record,
      budget_alert: budgetAlert,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/expenses/:id
 * Manager only — updates an expense record
 */
async function update(req, res, next) {
  try {
    const existing = await ExpenseModel.findById(req.params.id);
    if (!existing) throw new AppError('Expense record not found.', 404);

    // BaseModel.updateById() — updates and returns full updated record
    const updated = await ExpenseModel.updateById(req.params.id, req.validatedData);

    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/expenses/:id
 * Manager only — hard delete
 */
async function remove(req, res, next) {
  try {
    const existing = await ExpenseModel.findById(req.params.id);
    if (!existing) throw new AppError('Expense record not found.', 404);

    await ExpenseModel.deleteById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, create, update, remove };