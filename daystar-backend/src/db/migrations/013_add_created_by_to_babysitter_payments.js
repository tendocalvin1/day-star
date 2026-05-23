exports.up = async function (knex) {
  await knex.schema.alterTable('babysitter_payments', (table) => {
    table.integer('created_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('babysitter_payments', (table) => {
    table.dropColumn('created_by');
  });
};
