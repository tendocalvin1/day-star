
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
    this.isOperational = true; // vs programming errors (bugs)
    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle known DB constraint errors (PostgreSQL)
  if (err.code === '23505') {
    // Unique constraint violation
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
    // Foreign key constraint violation
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

  // Don't leak stack traces in production
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { errorHandler, AppError };