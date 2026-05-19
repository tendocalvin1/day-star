
/**
 * Migration: Create notifications table
 * In-app notifications only for MVP. SMS is a future integration.
 */
exports.up = function (knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.enum('type', [
      'incident_reported',
      'payment_due',
      'payment_overdue',
      'budget_exceeded',
      'child_checked_in',
      'child_checked_out',
    ]).notNullable();
    table.string('title', 200).notNullable();
    table.text('message').notNullable();
    table.integer('user_id').unsigned().notNullable(); // who sees this notification
    table.integer('related_id').nullable();            // child_id, incident_id, etc
    table.string('related_type', 50).nullable();       // 'child', 'incident', etc
    table.boolean('is_read').defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('notifications');
};