
const BaseModel = require('./BaseModel');
const { calculateChildAge } = require('../services/ageUtils');

class ChildModel extends BaseModel {
  constructor() {
    super('children');
  }

  /**
   * Find all children with computed age, supports filtering
   */
  async findAllWithAge({ search, session_type, is_active = true } = {}) {
    let query = this.db(this.table).select(
      'id', 'full_name', 'date_of_birth', 'parent_name',
      'parent_phone', 'parent_email', 'session_type',
      'special_needs', 'is_active', 'created_at'
    );

    if (is_active !== 'all') {
      query = query.where('is_active', is_active === 'true' || is_active === true);
    }
    if (session_type) query = query.where('session_type', session_type);
    if (search)       query = query.whereILike('full_name', `%${search}%`);

    const rows = await query.orderBy('full_name');
    return rows.map((c) => ({ ...c, age: calculateChildAge(c.date_of_birth) }));
  }

  /**
   * Find child by ID with recent attendance history
   */
  async findByIdWithAttendance(id) {
    const child = await this.findById(id);
    if (!child) return null;

    const recentAttendance = await this.db('attendance')
      .select(
        'attendance.*',
        'babysitters.first_name',
        'babysitters.last_name'
      )
      .leftJoin('babysitters', 'attendance.babysitter_id', 'babysitters.id')
      .where('attendance.child_id', id)
      .orderBy('attendance.date', 'desc')
      .limit(7);

    return {
      ...child,
      age: calculateChildAge(child.date_of_birth),
      recent_attendance: recentAttendance,
    };
  }

  /**
   * Find all children who are NOT yet checked in for a given date
   * Used to populate the check-in screen with available children
   */
  async findNotCheckedIn(date) {
    const checkedInIds = await this.db('attendance')
      .select('child_id')
      .where({ date });

    const checkedInIdList = checkedInIds.map((r) => r.child_id);

    let query = this.db(this.table)
      .select('id', 'full_name', 'session_type', 'special_needs', 'parent_phone')
      .where({ is_active: true });

    if (checkedInIdList.length > 0) {
      query = query.whereNotIn('id', checkedInIdList);
    }

    return query.orderBy('full_name');
  }

  /**
   * Find children assigned to a specific babysitter today
   */
  async findByBabysitterAndDate(babysitterId, date) {
    return this.db(this.table)
      .select(
        `${this.table}.id`,
        `${this.table}.full_name`,
        `${this.table}.special_needs`,
        `${this.table}.parent_phone`,
        'attendance.session_type',
        'attendance.check_in_time',
        'attendance.check_out_time',
        'attendance.status',
        'attendance.id as attendance_id'
      )
      .join('attendance', function () {
        this.on('attendance.child_id', '=', 'children.id')
            .andOn('attendance.date', '=', this.db.raw('?', [date]))
            .andOn('attendance.babysitter_id', '=', this.db.raw('?', [babysitterId]));
      })
      .where(`${this.table}.is_active`, true);
  }
}

module.exports = new ChildModel();