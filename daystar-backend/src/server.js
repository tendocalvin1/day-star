

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

let shuttingDown = false;

function closeServer() {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info(`${signal} received. Shutting down gracefully.`);

  // Forced shutdown timeout: exit after 10 seconds if graceful shutdown hangs
  const shutdownTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded. Force exiting.');
    process.exit(1);
  }, 10000);
  shutdownTimeout.unref(); // Allow Node to exit even if timer is pending

  try {
    await closeServer();
    await db.destroy();
    clearTimeout(shutdownTimeout);
    logger.info('HTTP server closed and database pool destroyed');
    process.exit(0);
  } catch (err) {
    clearTimeout(shutdownTimeout);
    logger.error('Error during graceful shutdown', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
}

async function handleFatalError(err, origin) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.error('Fatal error', {
    origin,
    message: err?.message,
    stack: err?.stack,
  });

  // Forced shutdown timeout: exit after 5 seconds if fatal shutdown hangs
  const shutdownTimeout = setTimeout(() => {
    logger.error('Fatal error shutdown timeout exceeded. Force exiting.');
    process.exit(1);
  }, 5000);
  shutdownTimeout.unref();

  try {
    await closeServer();
    await db.destroy();
    clearTimeout(shutdownTimeout);
  } catch (shutdownError) {
    clearTimeout(shutdownTimeout);
    logger.error('Error during shutdown after fatal error', {
      error: shutdownError.message,
      stack: shutdownError.stack,
    });
  }

  process.exit(1);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  handleFatalError(reason, 'unhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  handleFatalError(err, 'uncaughtException');
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
