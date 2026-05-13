
const BaseModel = require('./base.model');

class BabysitterPaymentModel extends BaseModel {
  constructor() {
    super('babysitter_payments');
  }

  async findWithFilters({ date, babysitter_id, is_cleared } = {}) {
    let query = this.db(this.table)
      .select(
        `${this.table}.*`,
        'babysitters.first_name',
        'babysitters.last_name',
        'babysitters.phone'
      )
      .join('babysitters', `${this.table}.babysitter_id`, 'babysitters.id')
      .orderBy(`${this.table}.date`, 'desc');

    if (date)          query = query.where(`${this.table}.date`, date);
    if (babysitter_id) query = query.where(`${this.table}.babysitter_id`, babysitter_id);
    if (is_cleared !== undefined) {
      query = query.where(`${this.table}.is_cleared`, is_cleared);
    }
    return query;
  }

  async getTotalUncleared() {
    const result = await this.db(this.table)
      .where({ is_cleared: false })
      .sum('amount_ugx as total')
      .count('id as count')
      .first();
    return {
      count: parseInt(result.count || 0, 10),
      total_ugx: parseInt(result.total || 0, 10),
    };
  }

  async upsert({ babysitter_id, date, half_day_children, full_day_children, total_children, amount_ugx, created_by }) {
    const existing = await this.db(this.table)
      .where({ babysitter_id, date })
      .first();

    if (existing) {
      const [updated] = await this.db(this.table)
        .where({ babysitter_id, date })
        .update({ half_day_children, full_day_children, total_children, amount_ugx, updated_at: this.db.fn.now() })
        .returning('*');
      return { ...updated, wasUpdated: true };
    }

    const [created] = await this.db(this.table)
      .insert({ babysitter_id, date, half_day_children, full_day_children, total_children, amount_ugx, is_cleared: false, created_by })
      .returning('*');
    return { ...created, wasUpdated: false };
  }

  async markAsCleared(id, managerId) {
    const [updated] = await this.db(this.table)
      .where({ id })
      .update({ is_cleared: true, cleared_by: managerId, cleared_at: this.db.fn.now(), updated_at: this.db.fn.now() })
      .returning('*');
    return updated;
  }
}

module.exports = new BabysitterPaymentModel();