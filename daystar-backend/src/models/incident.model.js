

const BaseModel = require('./base.model');

class IncidentModel extends BaseModel {
  constructor() {
    super('incidents');
  }

  /**
   * Get incidents with child and babysitter names joined
   * Manager sees all, babysitter sees only their own
   */
  async findWithDetails({ babysitter_id, is_resolved } = {}) {
    let query = this.db(this.table)
      .select(
        `${this.table}.*`,
        'children.full_name as child_name',
        'babysitters.first_name as babysitter_first_name',
        'babysitters.last_name as babysitter_last_name'
      )
      .join('children', `${this.table}.child_id`, 'children.id')
      .join('babysitters', `${this.table}.babysitter_id`, 'babysitters.id')
      .orderBy(`${this.table}.created_at`, 'desc');

    if (babysitter_id !== undefined) {
      query = query.where(`${this.table}.babysitter_id`, babysitter_id);
    }
    if (is_resolved !== undefined) {
      query = query.where(`${this.table}.is_resolved`, is_resolved);
    }

    return query;
  }

  /**
   * Count unresolved incidents (for dashboard alert badge)
   */
  async countUnresolved() {
    const result = await this.db(this.table)
      .where({ is_resolved: false })
      .count('id as count')
      .first();
    return parseInt(result.count || 0, 10);
  }

  /**
   * Resolve an incident with manager notes
   */
  async resolve(id, { resolution_notes, resolved_by }) {
    const [updated] = await this.db(this.table)
      .where({ id })
      .update({
        is_resolved: true,
        resolution_notes,
        resolved_by,
        resolved_at: this.db.fn.now(),
        updated_at: this.db.fn.now(),
      })
      .returning('*');
    return updated;
  }
}

module.exports = new IncidentModel();