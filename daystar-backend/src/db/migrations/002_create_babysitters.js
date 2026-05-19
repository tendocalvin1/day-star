

/**
 * Migration: Create babysitters table
 * Stores babysitter profile data. Age is derived from date_of_birth, never stored directly.
 */
exports.up = function (knex) {
  return knex.schema.createTable('babysitters', (table) => {
    table.increments('id').primary();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('email', 255).nullable();
    table.string('phone', 20).notNullable();
    table.string('nin', 20).notNullable().unique(); // National ID Number
    table.date('date_of_birth').notNullable(); // Age validated from this, not stored
    table.string('next_of_kin_name', 200).notNullable();
    table.string('next_of_kin_phone', 20).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('created_by').unsigned().nullable(); // manager who registered them
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('babysitters');
};