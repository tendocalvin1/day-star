
const BaseModel = require('./BaseModel');

class IncomeModel extends BaseModel {
  constructor() {
    super('income');
  }

  /**
   * Get income records with optional date range and child filter
   * Returns records joined with child names
   */
  async findWithFilters({ start, end, child_id } = {}) {
    let query = this.db(this.table)
      .select(
        `${this.table}.*`,
        'children.full_name as child_name',
        'children.parent_name'
      )
      .leftJoin('children', `${this.table}.child_id`, 'children.id')
      .orderBy(`${this.table}.payment_date`, 'desc');

    if (start)    query = query.where(`${this.table}.payment_date`, '>=', start);
    if (end)      query = query.where(`${this.table}.payment_date`, '<=', end);
    if (child_id) query = query.where(`${this.table}.child_id`, child_id);

    return query;
  }

  /**
   * Total income for today
   */
  async getTodayTotal(date) {
    const result = await this.db(this.table)
      .where('payment_date', date)
      .sum('amount_ugx as total')
      .first();
    return parseInt(result.total || 0, 10);
  }

  /**
   * Total income for a date range
   */
  async getTotalForRange(startDate, endDate) {
    const result = await this.db(this.table)
      .where('payment_date', '>=', startDate)
      .where('payment_date', '<=', endDate)
      .sum('amount_ugx as total')
      .first();
    return parseInt(result.total || 0, 10);
  }

  /**
   * Daily income totals for chart data
   */
  async getDailyTotalsForRange(startDate, endDate) {
    return this.db(this.table)
      .select(
        this.db.raw('payment_date as date'),
        this.db.raw('SUM(amount_ugx) as amount')
      )
      .where('payment_date', '>=', startDate)
      .where('payment_date', '<=', endDate)
      .groupBy('payment_date')
      .orderBy('payment_date');
  }

  /**
   * Income breakdown by session type
   */
  async getBySessionType(startDate, endDate) {
    return this.db(this.table)
      .select('session_type', this.db.raw('SUM(amount_ugx) as total'))
      .where('payment_date', '>=', startDate)
      .where('payment_date', '<=', endDate)
      .groupBy('session_type');
  }
}

module.exports = new IncomeModel();