

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const validateEnv = require('./config/validateEnv');
validateEnv();

const app = require('./app');
const logger = require('./config/logger');
const db = require('./config/database');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Daystar Daycare API running on port ${PORT}`, {
    url: `http://localhost:${PORT}`,
    health: `http://localhost:${PORT}/health`,
    docs: `http://localhost:${PORT}/api/docs`,
    environment: process.env.NODE_ENV || 'development',
  });
});

async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully.`);

  server.close(async () => {
    try {
      await db.destroy();
      logger.info('HTTP server closed and database pool destroyed');
      process.exit(0);
    } catch (err) {
      logger.error('Error during graceful shutdown', {
        error: err.message,
        stack: err.stack,
      });
      process.exit(1);
    }
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', {
    error: err.message,
    stack: err.stack,
  });
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
