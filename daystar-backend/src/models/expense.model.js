const BaseModel = require('./BaseModel');

class ExpenseModel extends BaseModel {
  constructor() {
    super('expenses');
  }

  /**
   * Get expenses with optional category + date range filters
   */
  async findWithFilters({ category, start, end } = {}) {
    let query = this.db(this.table)
      .select('*')
      .orderBy('expense_date', 'desc');

    if (category) query = query.where('category', category);
    if (start)    query = query.where('expense_date', '>=', start);
    if (end)      query = query.where('expense_date', '<=', end);

    return query;
  }

  /**
   * Total expenses for today
   */
  async getTodayTotal(date) {
    const result = await this.db(this.table)
      .where('expense_date', date)
      .sum('amount_ugx as total')
      .first();
    return parseInt(result.total || 0, 10);
  }

  /**
   * Total expenses for a date range
   */
  async getTotalForRange(startDate, endDate) {
    const result = await this.db(this.table)
      .where('expense_date', '>=', startDate)
      .where('expense_date', '<=', endDate)
      .sum('amount_ugx as total')
      .first();
    return parseInt(result.total || 0, 10);
  }

  /**
   * Totals grouped by category for a date range (pie chart data)
   */
  async getByCategory(startDate, endDate) {
    return this.db(this.table)
      .select('category', this.db.raw('SUM(amount_ugx) as amount'))
      .where('expense_date', '>=', startDate)
      .where('expense_date', '<=', endDate)
      .groupBy('category')
      .orderBy('amount', 'desc');
  }

  /**
   * Get total spent for a specific category within a budget period
   * Used by budget threshold checker
   */
  async getCategorySpendInPeriod(category, startDate, endDate) {
    const result = await this.db(this.table)
      .where('category', category)
      .where('expense_date', '>=', startDate)
      .where('expense_date', '<=', endDate)
      .sum('amount_ugx as total')
      .first();
    return parseInt(result.total || 0, 10);
  }
}

module.exports = new ExpenseModel();