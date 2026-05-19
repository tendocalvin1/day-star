

/**
 * Migration: Create budgets table
 * Manager sets monthly budget per expense category.
 * System alerts when spending approaches/exceeds limit.
 */
exports.up = function (knex) {
  return knex.schema.createTable('budgets', (table) => {
    table.increments('id').primary();
    table.enum('category', [
      'babysitter_salary',
      'toys_materials',
      'maintenance',
      'utilities',
      'other',
    ]).notNullable();
    table.enum('period', ['monthly', 'weekly']).notNullable().defaultTo('monthly');
    table.integer('amount_ugx').notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.integer('created_by').unsigned().notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('budgets');
};