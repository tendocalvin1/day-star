

const BaseModel = require('./BaseModel');

class AttendanceModel extends BaseModel {
  constructor() {
    super('attendance');
  }

  /**
   * Get all attendance records for a specific date with child + babysitter info
   */
  async findByDate(date) {
    return this.db(this.table)
      .select(
        `${this.table}.*`,
        'children.full_name as child_name',
        'children.parent_phone',
        'children.special_needs',
        'babysitters.first_name as babysitter_first_name',
        'babysitters.last_name as babysitter_last_name'
      )
      .join('children', `${this.table}.child_id`, 'children.id')
      .leftJoin('babysitters', `${this.table}.babysitter_id`, 'babysitters.id')
      .where(`${this.table}.date`, date)
      .orderBy(`${this.table}.check_in_time`);
  }

  /**
   * Check if a child already has an attendance record for a date
   */
  async isAlreadyCheckedIn(childId, date) {
    return this.exists({ child_id: childId, date });
  }

  /**
   * Get today's summary statistics
   */
  async getDailySummary(date) {
    const summary = await this.db(this.table)
      .select(
        this.db.raw('COUNT(*) as total_children'),
        this.db.raw("SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present"),
        this.db.raw("SUM(CASE WHEN session_type = 'full_day' THEN 1 ELSE 0 END) as full_day"),
        this.db.raw("SUM(CASE WHEN session_type = 'half_day' THEN 1 ELSE 0 END) as half_day"),
        this.db.raw('SUM(CASE WHEN check_out_time IS NOT NULL THEN 1 ELSE 0 END) as checked_out'),
        this.db.raw("SUM(CASE WHEN check_out_time IS NULL AND status = 'present' THEN 1 ELSE 0 END) as still_in")
      )
      .where('date', date)
      .first();

    return {
      total_children: parseInt(summary.total_children || 0),
      present:        parseInt(summary.present        || 0),
      full_day:       parseInt(summary.full_day       || 0),
      half_day:       parseInt(summary.half_day       || 0),
      checked_out:    parseInt(summary.checked_out    || 0),
      still_in:       parseInt(summary.still_in       || 0),
    };
  }

  /**
   * Get per-babysitter breakdown for a date
   * Shows how many children each babysitter is responsible for
   */
  async getBabysitterBreakdown(date) {
    return this.db(this.table)
      .select(
        'babysitters.id',
        'babysitters.first_name',
        'babysitters.last_name',
        this.db.raw('COUNT(attendance.id) as child_count'),
        this.db.raw("SUM(CASE WHEN attendance.session_type = 'half_day' THEN 1 ELSE 0 END) as half_day_count"),
        this.db.raw("SUM(CASE WHEN attendance.session_type = 'full_day' THEN 1 ELSE 0 END) as full_day_count")
      )
      .join('babysitters', `${this.table}.babysitter_id`, 'babysitters.id')
      .where(`${this.table}.date`, date)
      .groupBy('babysitters.id', 'babysitters.first_name', 'babysitters.last_name');
  }

  /**
   * Get attendance by babysitter for payment calculation
   * Groups by babysitter and session type — used by paymentCalculator service
   */
  async getForPaymentCalculation(date) {
    return this.db(this.table)
      .select(
        `${this.table}.babysitter_id`,
        `${this.table}.session_type`,
        this.db.raw('COUNT(*) as child_count')
      )
      .where(`${this.table}.date`, date)
      .where(`${this.table}.status`, 'present')
      .whereNotNull(`${this.table}.babysitter_id`)
      .groupBy(`${this.table}.babysitter_id`, `${this.table}.session_type`);
  }

  /**
   * Daily attendance count over a date range (for charts)
   */
  async getDailyCountsInRange(startDate, endDate) {
    return this.db(this.table)
      .select(
        this.db.raw('date'),
        this.db.raw('COUNT(*) as total'),
        this.db.raw("SUM(CASE WHEN session_type = 'full_day' THEN 1 ELSE 0 END) as full_day"),
        this.db.raw("SUM(CASE WHEN session_type = 'half_day' THEN 1 ELSE 0 END) as half_day")
      )
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .groupBy('date')
      .orderBy('date');
  }
}

module.exports = new AttendanceModel();