const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserModel, BabysitterModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const auditService = require('../services/auditService');

// auth.controller.js - Handles authentication-related operations such as login, fetching user info, and changing passwords.
/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.validatedData;

    const user = await UserModel.findByEmail(email);

    if (!user) {
      await auditService.log({
        userEmail: email,
        action: 'auth.login_failed',
        entityType: 'user',
        metadata: { reason: 'invalid_credentials' },
        req,
      });
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.is_active) {
      await auditService.log({
        actorId: user.id,
        userEmail: user.email,
        action: 'auth.login_failed',
        entityType: 'user',
        entityId: user.id,
        metadata: { reason: 'inactive_account' },
        req,
      });
      throw new AppError('Your account has been deactivated. Contact the manager.', 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await auditService.log({
        actorId: user.id,
        userEmail: user.email,
        action: 'auth.login_failed',
        entityType: 'user',
        entityId: user.id,
        metadata: { reason: 'invalid_credentials' },
        req,
      });
      throw new AppError('Invalid email or password.', 401);
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );

    // Set httpOnly cookie for browser clients while still returning token in body
    const isProd = process.env.NODE_ENV === 'production';
    // Default maxAge to 15 minutes in milliseconds
    const cookieMaxAge = (parseInt(process.env.JWT_ACCESS_EXPIRES_MS || '', 10) || 15 * 60 * 1000);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: cookieMaxAge,
    });

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

    await auditService.log({
      actorId: user.id,
      userEmail: user.email,
      action: 'auth.login_success',
      entityType: 'user',
      entityId: user.id,
      metadata: { role: user.role },
      req,
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
    const { current_password, new_password } = req.validatedData;

    const user = await UserModel.findById(req.user.id);
    if (!user) throw new AppError('User not found.', 401);
    if (!user.is_active) throw new AppError('Account is deactivated. Contact the manager.', 401);

    const match = await bcrypt.compare(current_password, user.password_hash);

    if (!match) throw new AppError('Current password is incorrect.', 401);

    const hash = await bcrypt.hash(new_password, 12);
    await UserModel.updateById(req.user.id, { password_hash: hash });

    logger.info('User changed password', { userId: req.user.id });

    await auditService.log({
      actorId: req.user.id,
      userEmail: req.user.email,
      action: 'auth.password_changed',
      entityType: 'user',
      entityId: req.user.id,
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, getMe, changePassword };

/**
 * POST /api/auth/logout
 * Clears the access_token cookie (httpOnly)
 */
async function logout(req, res, next) {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('access_token', { httpOnly: true, secure: isProd, sameSite: 'lax' });
    return res.status(200).json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, getMe, changePassword, logout };
