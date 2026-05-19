

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const path = require('path');

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME     || 'daystar_daycare',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || 'daystar123',
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: path.join(__dirname, 'src/db/migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'src/db/seeds'),
    },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    migrations: {
      directory: path.join(__dirname, 'src/db/migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'src/db/seeds'),
    },
  },
};