

const BaseModel = require('./base.model');

class BudgetModel extends BaseModel {
  constructor() {
    super('budgets');
  }

  /**
   * Get all budgets with their current spend calculated
   * This is the main budgets page query
   */
  async findAllWithSpend() {
    const budgets = await this.db(this.table).orderBy('start_date', 'desc');

    const budgetsWithSpend = await Promise.all(
      budgets.map(async (budget) => {
        const result = await this.db('expenses')
          .where('category', budget.category)
          .where('expense_date', '>=', budget.start_date)
          .where('expense_date', '<=', budget.end_date)
          .sum('amount_ugx as spent')
          .first();

        const spent = parseInt(result.spent || 0, 10);
        const remaining = budget.amount_ugx - spent;
        const percentUsed = budget.amount_ugx > 0
          ? Math.round((spent / budget.amount_ugx) * 100)
          : 0;

        return {
          ...budget,
          spent_ugx:    spent,
          remaining_ugx: remaining,
          percent_used:  percentUsed,
          status:
            percentUsed >= 100 ? 'exceeded' :
            percentUsed >= 80  ? 'near_limit' :
            'on_track',
        };
      })
    );

    return budgetsWithSpend;
  }

  /**
   * Find an active budget for a category covering a specific date
   * Used by the budget threshold checker before recording an expense
   */
  async findActiveBudgetForCategory(category, date) {
    return this.db(this.table)
      .where('category', category)
      .where('start_date', '<=', date)
      .where('end_date', '>=', date)
      .first();
  }

  /**
   * Check if adding an expense would exceed or approach budget limits
   * Returns a status object used to generate alerts
   */
  async checkThreshold(category, newAmountUgx, date) {
    const budget = await this.findActiveBudgetForCategory(category, date);
    if (!budget) {
      return { hasBudget: false, exceeded: false, nearLimit: false };
    }

    const currentSpend = await this.db('expenses')
      .where('category', category)
      .where('expense_date', '>=', budget.start_date)
      .where('expense_date', '<=', budget.end_date)
      .sum('amount_ugx as total')
      .first()
      .then((r) => parseInt(r.total || 0, 10));

    const newTotal = currentSpend + newAmountUgx;

    return {
      hasBudget:  true,
      budget,
      spent:      currentSpend,
      newTotal,
      exceeded:   newTotal > budget.amount_ugx,
      nearLimit:  newTotal > budget.amount_ugx * 0.8 && newTotal <= budget.amount_ugx,
    };
  }
}

module.exports = new BudgetModel();