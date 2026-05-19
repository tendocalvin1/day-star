

/**
 * Migration: Create children table
 */
exports.up = function (knex) {
  return knex.schema.createTable('children', (table) => {
    table.increments('id').primary();
    table.string('full_name', 200).notNullable();
    table.date('date_of_birth').notNullable();
    table.string('parent_name', 200).notNullable();
    table.string('parent_phone', 20).notNullable();
    table.string('parent_email', 255).nullable();
    table.enum('session_type', ['half_day', 'full_day']).notNullable().defaultTo('full_day');
    // Special care needs stored as free text - simple, flexible
    table.text('special_needs').nullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('created_by').unsigned().nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('children');
};