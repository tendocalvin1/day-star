

/**
 * Environment Variable Validation
 * Called once at server startup in server.js
 * If any required variable is missing, server exits immediately
 * with a clear error message instead of failing silently later
 */

const required = [
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
];

function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\n   Add these to your .env file and restart the server.\n');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

module.exports = validateEnv;