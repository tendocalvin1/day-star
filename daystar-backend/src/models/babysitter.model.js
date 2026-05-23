
const BaseModel = require('./base.model');
const { calculateAge } = require('../services/ageUtils');

class BabysitterModel extends BaseModel {
  constructor() {
    super('babysitters');
  }

  /**
   * Search active babysitters with computed age.
   */
  async searchActive(filters = {}) {
    const { limit = 20, offset = 0 } = filters;
    const query = this.buildSearchQuery(filters);

    this.applySort(query, filters.sort_by, filters.sort_order);

    const rows = await query.limit(limit).offset(offset);
    return rows.map((b) => ({ ...b, age: calculateAge(b.date_of_birth) }));
  }

  async countSearchActive(filters = {}) {
    const result = await this.buildSearchQuery(filters)
      .clearSelect()
      .clearOrder()
      .count('id as count')
      .first();

    return parseInt(result.count, 10);
  }

  buildSearchQuery({
    search,
    name,
    skills,
    availability,
    min_experience,
    max_experience,
    location,
  } = {}) {
    const query = this.db(this.table)
      .select(
        'id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'nin',
        'date_of_birth',
        'skills',
        'availability',
        'years_experience',
        'location',
        'next_of_kin_name',
        'next_of_kin_phone',
        'is_active',
        'created_at'
      )
      .where({ is_active: true });

    if (search) {
      query.andWhere((builder) => {
        builder
          .whereILike('first_name', `%${search}%`)
          .orWhereILike('last_name', `%${search}%`)
          .orWhereRaw("concat(first_name, ' ', last_name) ILIKE ?", [`%${search}%`])
          .orWhereILike('phone', `%${search}%`)
          .orWhereILike('nin', `%${search}%`)
          .orWhereILike('location', `%${search}%`);
      });
    }

    if (name) {
      query.andWhere((builder) => {
        builder
          .whereILike('first_name', `%${name}%`)
          .orWhereILike('last_name', `%${name}%`)
          .orWhereRaw("concat(first_name, ' ', last_name) ILIKE ?", [`%${name}%`]);
      });
    }

    if (skills?.length) {
      query.whereRaw('skills && ?::text[]', [skills]);
    }

    if (availability?.length) {
      query.whereRaw('availability && ?::text[]', [availability]);
    }

    if (min_experience !== undefined) {
      query.where('years_experience', '>=', min_experience);
    }

    if (max_experience !== undefined) {
      query.where('years_experience', '<=', max_experience);
    }

    if (location) {
      query.whereILike('location', `%${location}%`);
    }

    return query;
  }

  applySort(query, sortBy = 'name', sortOrder = 'asc') {
    const direction = sortOrder === 'desc' ? 'desc' : 'asc';

    if (sortBy === 'years_experience') {
      query.orderBy('years_experience', direction).orderBy('first_name', 'asc');
      return;
    }

    if (sortBy === 'created_at') {
      query.orderBy('created_at', direction).orderBy('id', 'asc');
      return;
    }

    if (sortBy === 'location') {
      query.orderBy('location', direction).orderBy('first_name', 'asc');
      return;
    }

    query.orderBy('first_name', direction).orderBy('last_name', direction).orderBy('id', 'asc');
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
