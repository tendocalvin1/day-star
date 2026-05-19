
/**
 * Migration: Create users table
 * Stores auth credentials only. Profile data lives in babysitters table.
 * Manager accounts are seeded - not self-registered.
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['manager', 'babysitter']).notNullable().defaultTo('babysitter');
    // Links a babysitter user account to their babysitter profile
    table.integer('babysitter_id').unsigned().nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true); // created_at, updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};