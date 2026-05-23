const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserModel, BabysitterModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.validatedData;

    const user = await UserModel.findByEmail(email);

    if (!user) throw new AppError('Invalid email or password.', 401);
    if (!user.is_active) throw new AppError('Your account has been deactivated. Contact the manager.', 401);

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) throw new AppError('Invalid email or password.', 401);

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    let profile = null;
    if (user.role === 'babysitter' && user.babysitter_id) {
      profile = await BabysitterModel.findById(user.babysitter_id);
    }

    logger.info('User logged in', {
      userId: user.id,
      email: user.email,
      role: user.role,
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        babysitter_id: user.babysitter_id,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    let profile = null;
    if (req.user.role === 'babysitter' && req.user.babysitter_id) {
      profile = await BabysitterModel.findById(req.user.babysitter_id);
    }

    return res.status(200).json({
      success: true,
      user: { ...req.user, profile },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/change-password
 */
async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      throw new AppError('current_password and new_password are required.', 400);
    }

    if (new_password.length < 8) {
      throw new AppError('New password must be at least 8 characters.', 400);
    }

    const user = await UserModel.findByEmail(req.user.email);
    const match = await bcrypt.compare(current_password, user.password_hash);

    if (!match) throw new AppError('Current password is incorrect.', 401);

    const hash = await bcrypt.hash(new_password, 12);
    await UserModel.updateById(req.user.id, { password_hash: hash });

    logger.info('User changed password', { userId: req.user.id });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, getMe, changePassword };