exports.up = async function (knex) {
  await knex.schema.alterTable('babysitters', (table) => {
    table.specificType('skills', 'text[]').notNullable().defaultTo('{}');
    table.specificType('availability', 'text[]').notNullable().defaultTo('{}');
    table.integer('years_experience').notNullable().defaultTo(0);
    table.string('location', 150).nullable();
  });

  await knex.schema.alterTable('audit_logs', (table) => {
    table.jsonb('metadata').nullable();
  });

  await knex.raw('CREATE INDEX babysitters_active_name_idx ON babysitters (is_active, first_name, last_name)');
  await knex.raw('CREATE INDEX babysitters_location_idx ON babysitters (location)');
  await knex.raw('CREATE INDEX babysitters_years_experience_idx ON babysitters (years_experience)');
  await knex.raw('CREATE INDEX babysitters_skills_gin_idx ON babysitters USING GIN (skills)');
  await knex.raw('CREATE INDEX babysitters_availability_gin_idx ON babysitters USING GIN (availability)');
};

exports.down = async function (knex) {
  await knex.raw('DROP INDEX IF EXISTS babysitters_availability_gin_idx');
  await knex.raw('DROP INDEX IF EXISTS babysitters_skills_gin_idx');
  await knex.raw('DROP INDEX IF EXISTS babysitters_years_experience_idx');
  await knex.raw('DROP INDEX IF EXISTS babysitters_location_idx');
  await knex.raw('DROP INDEX IF EXISTS babysitters_active_name_idx');

  await knex.schema.alterTable('audit_logs', (table) => {
    table.dropColumn('metadata');
  });

  await knex.schema.alterTable('babysitters', (table) => {
    table.dropColumn('location');
    table.dropColumn('years_experience');
    table.dropColumn('availability');
    table.dropColumn('skills');
  });
};
