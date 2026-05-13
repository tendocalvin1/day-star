require('dotenv').config();
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
    console.log(`✅ PostgreSQL connected [${environment}]`);
    console.log(`   Database: ${process.env.DB_NAME || 'daystar_daycare'}`);
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection failed!');
    console.error(`   Error: ${err.message}`);
    console.error('');
    console.error('   Fix checklist:');
    console.error('   1. Is PostgreSQL running?');
    console.error('      Windows: open Services → find postgresql → Start');
    console.error('   2. Does the database exist?');
    console.error(`      Run: createdb ${process.env.DB_NAME || 'daystar_daycare'}`);
    console.error('   3. Check DB_USER and DB_PASSWORD in your .env file');
    process.exit(1);
  });

// ── Exports ────────────────────────────────────────────────────────────────

module.exports = database;               // all models use this
module.exports.knexConfig = knexConfig;  // Knex CLI uses this