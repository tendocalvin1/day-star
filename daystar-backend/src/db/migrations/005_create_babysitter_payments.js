
/**
 * Migration: Create babysitter_payments table
 * Auto-generated daily. Manager marks as cleared after paying cash.
 * amount_ugx is calculated: children_count * rate_per_session
 */
exports.up = function (knex) {
  return knex.schema.createTable('babysitter_payments', (table) => {
    table.increments('id').primary();
    table.integer('babysitter_id').unsigned().notNullable().references('id').inTable('babysitters').onDelete('RESTRICT');
    table.date('date').notNullable();
    table.integer('half_day_children').defaultTo(0);
    table.integer('full_day_children').defaultTo(0);
    table.integer('total_children').notNullable();
    table.integer('amount_ugx').notNullable(); // No decimals - UGX is whole numbers
    table.boolean('is_cleared').defaultTo(false);
    table.integer('cleared_by').unsigned().nullable(); // manager user id
    table.timestamp('cleared_at').nullable();
    table.timestamps(true, true);

    // Only one payment record per babysitter per day
    table.unique(['babysitter_id', 'date']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('babysitter_payments');
};