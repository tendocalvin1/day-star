const logger = require('../config/logger');

/**
 * Global Error Handler
 * Must be the LAST middleware registered in app.js.
 * Express identifies it as an error handler by its 4-argument signature.
 *
 * All controllers call next(error) to reach this handler.
 * Never send error responses directly from controllers.
 */

// Custom error class for operational errors (expected errors with status codes)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle known DB constraint errors (PostgreSQL)
  if (err.code === '23505') {
    statusCode = 409;
    if (err.detail?.includes('nin')) {
      message = 'A babysitter with this National ID Number already exists.';
    } else if (err.detail?.includes('email')) {
      message = 'An account with this email already exists.';
    } else if (err.detail?.includes('child_id') && err.detail?.includes('date')) {
      message = 'Attendance has already been recorded for this child today.';
    } else {
      message = 'A record with these details already exists.';
    }
  }

  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced record does not exist.';
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 422;
    message = 'Validation failed';
    return res.status(statusCode).json({
      success: false,
      message,
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Log all errors through Winston — not console
  logger.error(`${req.method} ${req.path}`, {
    message: err.message,
    statusCode,
    userId: req.user?.id,
    stack: err.stack,
    isOperational: err.isOperational || false,
  });

  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { errorHandler, AppError };