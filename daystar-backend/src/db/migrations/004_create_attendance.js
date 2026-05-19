
/**
 * Migration: Create attendance table
 * One record per child per day. babysitter_id = who is responsible for this child today.
 */
exports.up = function (knex) {
  return knex.schema.createTable('attendance', (table) => {
    table.increments('id').primary();
    table.integer('child_id').unsigned().notNullable().references('id').inTable('children').onDelete('RESTRICT');
    table.integer('babysitter_id').unsigned().nullable().references('id').inTable('babysitters').onDelete('SET NULL');
    table.date('date').notNullable();
    table.enum('session_type', ['half_day', 'full_day']).notNullable();
    table.time('check_in_time').nullable();
    table.time('check_out_time').nullable();
    table.enum('status', ['present', 'absent', 'late']).defaultTo('present');
    table.integer('recorded_by').unsigned().nullable(); // user id
    table.timestamps(true, true);

    // A child can only have ONE attendance record per day
    table.unique(['child_id', 'date']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('attendance');
};