

const BaseModel = require('./BaseModel');

class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Find user by email for login
   * Returns password_hash — only use this for auth, nowhere else
   */
  async findByEmail(email) {
    return this.db(this.table)
      .select('id', 'email', 'password_hash', 'role', 'babysitter_id', 'is_active')
      .where({ email: email.toLowerCase().trim() })
      .first();
  }

  /**
   * Find user for a session — no password_hash
   */
  async findByIdSafe(id) {
    return this.db(this.table)
      .select('id', 'email', 'role', 'babysitter_id', 'is_active')
      .where({ id })
      .first();
  }

  /**
   * Find the active manager account
   * There's only one manager in this system
   */
  async findManager() {
    return this.db(this.table)
      .select('id', 'email', 'role')
      .where({ role: 'manager', is_active: true })
      .first();
  }

  /**
   * Create a user account — used when registering a babysitter with login access
   */
  async createAccount({ email, password_hash, role = 'babysitter', babysitter_id = null }) {
    return this.create({ email: email.toLowerCase(), password_hash, role, babysitter_id });
  }

  /**
   * Check if an email is already registered
   */
  async emailExists(email) {
    return this.exists({ email: email.toLowerCase() });
  }
}

module.exports = new UserModel();