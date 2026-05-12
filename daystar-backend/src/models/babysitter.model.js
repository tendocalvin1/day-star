
const BaseModel = require('./BaseModel');
const { calculateAge } = require('../services/ageUtils');

class BabysitterModel extends BaseModel {
  constructor() {
    super('babysitters');
  }

  /**
   * Get all active babysitters with computed age
   */
  async findAllActive() {
    const rows = await this.db(this.table)
      .select(
        'id', 'first_name', 'last_name', 'email', 'phone',
        'nin', 'date_of_birth', 'next_of_kin_name',
        'next_of_kin_phone', 'is_active', 'created_at'
      )
      .where({ is_active: true })
      .orderBy('first_name');

    return rows.map((b) => ({ ...b, age: calculateAge(b.date_of_birth) }));
  }

  /**
   * Find babysitter by ID with their linked user account
   */
  async findByIdWithAccount(id) {
    const babysitter = await this.findById(id);
    if (!babysitter) return null;

    const userAccount = await this.db('users')
      .select('id', 'email', 'is_active')
      .where({ babysitter_id: id })
      .first();

    return {
      ...babysitter,
      age: calculateAge(babysitter.date_of_birth),
      user_account: userAccount || null,
    };
  }

  /**
   * Check if a National ID Number is already registered
   */
  async ninExists(nin) {
    return this.exists({ nin: nin.toUpperCase() });
  }

  /**
   * Find babysitter by their linked user account ID
   */
  async findByUserId(userId) {
    const user = await this.db('users').where({ id: userId }).first();
    if (!user?.babysitter_id) return null;
    return this.findById(user.babysitter_id);
  }

  /**
   * Create babysitter profile and optionally a user account in a transaction
   */
  async createWithAccount(babysitterData, accountData = null) {
    return this.transaction(async (trx) => {
      const [babysitter] = await trx(this.table)
        .insert(babysitterData)
        .returning('*');

      let userAccount = null;
      if (accountData) {
        const [user] = await trx('users')
          .insert({
            email: accountData.email.toLowerCase(),
            password_hash: accountData.password_hash,
            role: 'babysitter',
            babysitter_id: babysitter.id,
          })
          .returning('id', 'email', 'role');

        userAccount = user;
      }

      return { babysitter, userAccount };
    });
  }

  /**
   * Get babysitters with their child count for today
   * Used in attendance summary
   */
  async findWithTodayChildCount(date) {
    return this.db(this.table)
      .select(
        `${this.table}.id`,
        `${this.table}.first_name`,
        `${this.table}.last_name`,
        `${this.table}.phone`,
        this.db.raw('COUNT(attendance.id) as child_count')
      )
      .leftJoin('attendance', function () {
        this.on('attendance.babysitter_id', '=', 'babysitters.id')
            .andOn('attendance.date', '=', this.db.raw('?', [date]));
      })
      .where(`${this.table}.is_active`, true)
      .groupBy(
        `${this.table}.id`,
        `${this.table}.first_name`,
        `${this.table}.last_name`,
        `${this.table}.phone`
      );
  }
}

module.exports = new BabysitterModel();