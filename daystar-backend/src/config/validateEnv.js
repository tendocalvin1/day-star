const logger = require('./logger');

/**
 * Environment Variable Validation
 * Called once at server startup in server.js
 * If any required variable is missing, server exits immediately
 * with a clear error message instead of failing silently later
 */

const commonRequired = [
  'JWT_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
];

const developmentDbRequired = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
];

function validateEnv() {
  const required = [...commonRequired];

  if (process.env.NODE_ENV === 'production') {
    required.push('DATABASE_URL');
  } else {
    required.push(...developmentDbRequired);
  }

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    logger.error('JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  logger.info('Environment variables validated');
}

module.exports = validateEnv;
