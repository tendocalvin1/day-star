
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findByIdSafe(decoded.userId);

    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
    if (!user.is_active) return res.status(401).json({ success: false, message: 'Account is deactivated.' });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token.' });
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
    return res.status(403).json({
      success: false,
      message: 'Access denied. Manager role required.',
    });
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
    return res.status(403).json({
      success: false,
      message: 'Access denied. Babysitter role required.',
    });
  }
  next();
}

module.exports = { requireAuth, requireManager, requireBabysitter };