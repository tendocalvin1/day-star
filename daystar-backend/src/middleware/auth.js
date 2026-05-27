
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models');
const { AppError } = require('./errorHandler');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Support token via Authorization header or httpOnly cookie named 'access_token'
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace(/^Bearer\s+/i, '').trim();
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (!decoded || !decoded.userId) {
      return next(new AppError('Invalid token.', 401));
    }

    const user = await UserModel.findByIdSafe(decoded.userId);

    if (!user) return next(new AppError('User not found.', 401));
    if (!user.is_active) return next(new AppError('Account is deactivated.', 401));

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please log in again.', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token.', 401));
    }
    next(error);
  }
}

/**
 * requireManager middleware
 * Use AFTER requireAuth.
 * Restricts route to manager role only.
 */
function requireManager(req, res, next) {
  if (req.user.role !== 'manager') {
    return next(new AppError('Access denied. Manager role required.', 403));
  }
  next();
}

/**
 * requireBabysitter middleware
 * Use AFTER requireAuth.
 * Restricts route to babysitter role only.
 */
function requireBabysitter(req, res, next) {
  if (req.user.role !== 'babysitter') {
    return next(new AppError('Access denied. Babysitter role required.', 403));
  }
  next();
}

module.exports = { requireAuth, requireManager, requireBabysitter };