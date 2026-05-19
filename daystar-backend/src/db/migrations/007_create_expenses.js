
/**
 * Migration: Create expenses table
 * Categories match the exam spec: salaries, toys, maintenance, utilities, other
 */
exports.up = function (knex) {
  return knex.schema.createTable('expenses', (table) => {
    table.increments('id').primary();
    table.enum('category', [
      'babysitter_salary',
      'toys_materials',
      'maintenance',
      'utilities',
      'other',
    ]).notNullable();
    table.string('description', 500).notNullable();
    table.integer('amount_ugx').notNullable();
    table.date('expense_date').notNullable();
    table.integer('created_by').unsigned().notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('expenses');
};