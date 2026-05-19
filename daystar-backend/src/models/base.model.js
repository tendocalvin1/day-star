const db = require('../config/database.js');

/**
 * BaseModel
 * Every model extends this. Provides common CRUD operations so
 * individual models only define what's unique to their table.
 *
 * Pattern: Repository — controllers never touch db() directly.
 * They call model methods. The model owns the query.
 */
class BaseModel {
  constructor(tableName) {
    this.table = tableName;
    this.db = db;
  }

  /**
   * Find a single record by primary key
   */
  async findById(id) {
    return this.db(this.table).where({ id }).first();
  }

  /**
   * Find a single record matching conditions
   * @param {object} conditions - e.g. { email: 'x@y.com', is_active: true }
   */
  async findOne(conditions) {
    return this.db(this.table).where(conditions).first();
  }

  /**
   * Find all records matching conditions
   * @param {object} conditions
   */
  async findAll(conditions = {}) {
    return this.db(this.table).where(conditions);
  }

  /**
   * Insert a record and return the full created row
   */
  async create(data) {
    const [record] = await this.db(this.table).insert(data).returning('*');
    return record;
  }

  /**
   * Update a record by ID and return the updated row
   */
  async updateById(id, data) {
    const [record] = await this.db(this.table)
      .where({ id })
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');
    return record;
  }

  /**
   * Hard delete by ID — use only where appropriate (e.g. income corrections)
   */
  async deleteById(id) {
    return this.db(this.table).where({ id }).delete();
  }

  /**
   * Soft delete — sets is_active = false
   * Only use on tables that have is_active column
   */
  async softDeleteById(id) {
    const [record] = await this.db(this.table)
      .where({ id })
      .update({ is_active: false, updated_at: this.db.fn.now() })
      .returning('*');
    return record;
  }

  /**
   * Count records matching conditions
   */
  async count(conditions = {}) {
    const result = await this.db(this.table).where(conditions).count('id as count').first();
    return parseInt(result.count, 10);
  }

  /**
   * Check if a record exists
   */
  async exists(conditions) {
    const record = await this.db(this.table).where(conditions).first();
    return !!record;
  }

  /**
   * Run operations inside a transaction
   * Usage: await model.transaction(async (trx) => { ... })
   */
  async transaction(callback) {
    return this.db.transaction(callback);
  }


  /**
 * Find records with pagination support
 * @param {object} conditions
 * @param {number} limit - records per page
 * @param {number} offset - records to skip
 */
async findPaginated(conditions = {}, limit = 20, offset = 0) {
  return this.db(this.table)
    .where(conditions)
    .limit(limit)
    .offset(offset);
}

/**
 * Count total records for pagination metadata
 */
async countWhere(conditions = {}) {
  const result = await this.db(this.table)
    .where(conditions)
    .count('id as count')
    .first();
  return parseInt(result.count, 10);
}
}

module.exports = BaseModel;