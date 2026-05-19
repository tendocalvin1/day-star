

/**
 * Migration: Create income table
 * Records every parent payment. Linked to child for reporting.
 */
exports.up = function (knex) {
  return knex.schema.createTable('income', (table) => {
    table.increments('id').primary();
    table.integer('child_id').unsigned().nullable().references('id').inTable('children').onDelete('SET NULL');
    table.integer('amount_ugx').notNullable();
    table.enum('session_type', ['half_day', 'full_day']).notNullable();
    table.date('payment_date').notNullable();
    table.string('payment_method', 50).defaultTo('cash'); // cash, mobile_money
    table.text('notes').nullable();
    table.integer('created_by').unsigned().notNullable(); // manager user id
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('income');
};