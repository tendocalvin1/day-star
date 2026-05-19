

/**
 * Migration: Create incidents table
 * Babysitter files a report. Manager resolves it.
 */
exports.up = function (knex) {
  return knex.schema.createTable('incidents', (table) => {
    table.increments('id').primary();
    table.integer('child_id').unsigned().notNullable().references('id').inTable('children').onDelete('RESTRICT');
    table.integer('babysitter_id').unsigned().notNullable().references('id').inTable('babysitters').onDelete('RESTRICT');
    table.text('description').notNullable();
    table.enum('severity', ['low', 'medium', 'high']).notNullable().defaultTo('low');
    table.boolean('is_resolved').defaultTo(false);
    table.text('resolution_notes').nullable();
    table.integer('resolved_by').unsigned().nullable();
    table.timestamp('resolved_at').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('incidents');
};