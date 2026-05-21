require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const knex = require('knex');
const path = require('path');

/**
 * PostgreSQL Database Connection
 *
 * This file does two things:
 *  1. Creates and exports the database connection used by all models
 *  2. Exports knexConfig so CLI commands work without a separate knexfile.js
 *
 * Usage in models:
 *   const database = require('../config/database');
 *
 * package.json scripts reference this file directly:
 *   "migrate": "knex migrate:latest --knexfile src/config/database.js"
 *   "seed":    "knex seed:run --knexfile src/config/database.js"
 */

const environment = process.env.NODE_ENV || 'development';

// ── Connection config based on environment ─────────────────────────────────

const connectionConfig =
  environment === 'production'
    ? {
        // Production (Supabase / Render): single DATABASE_URL string
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        // Development: individual .env variables
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME     || 'daystar_daycare',
        user:     process.env.DB_USER     || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      };

// ── Knex configuration ─────────────────────────────────────────────────────
// Defined separately so the Knex CLI can read it from this file directly

const knexConfig = {
  client: 'pg',                    // PostgreSQL - not MongoDB, not MySQL
  connection: connectionConfig,
  pool: { min: 2, max: 10 },       // Keep 2 connections alive, max 10
  migrations: {
    directory: path.join(__dirname, '../db/migrations'),
    tableName: 'knex_migrations',  // Tracking table knex creates automatically
  },
  seeds: {
    directory: path.join(__dirname, '../db/seeds'),
  },
};

// ── Create the connection instance ─────────────────────────────────────────

const database = knex(knexConfig);

// ── Test connection when server starts ─────────────────────────────────────

database
  .raw('SELECT 1 + 1 AS result')
  .then(() => {
  logger.info(`PostgreSQL connected [${environment}] — database: ${process.env.DB_NAME || 'daystar_daycare'}`);
})
.catch((err) => {
  logger.error('PostgreSQL connection failed', { error: err.message, environment });
  process.exit(1);
});

// ── Exports ────────────────────────────────────────────────────────────────

module.exports = database;               // all models use this
module.exports.knexConfig = knexConfig;  // Knex CLI uses this