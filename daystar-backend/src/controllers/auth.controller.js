const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { UserModel, BabysitterModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const redis = require('../config/redis');

// Helper to parse string durations like '7d', '15m' to milliseconds
function parseDuration(val, defaultMs) {
  if (!val) return defaultMs;
  const match = val.match(/^(\d+)([smhd])$/);
  if (!match) return defaultMs;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return num * 1000;
    case 'm': return num * 60 * 1000;
    case 'h': return num * 60 * 60 * 1000;
    case 'd': return num * 24 * 60 * 60 * 1000;
    default: return defaultMs;
  }
}

// Token generation helpers
function generateAccessToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
}

function generateRefreshToken(userId, role) {
  return jwt.sign(
    { userId, role, jti: crypto.randomUUID() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.validatedData;

    const user = await UserModel.findByEmail(email);

    if (!user) throw new AppError('Invalid email or password.', 401);
    if (!user.is_active) throw new AppError('Your account has been deactivated. Contact the manager.', 401);

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) throw new AppError('Invalid email or password.', 401);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    // Parse duration for Redis TTL and Cookie MaxAge
    const refreshExpiryMs = parseDuration(process.env.JWT_REFRESH_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000);
    const redisTTL = Math.floor(refreshExpiryMs / 1000);

    // Save refresh token in Redis
    await redis.set(`refresh_token:${refreshToken}`, user.id, 'EX', redisTTL);

    // Attach babysitter profile if user is a babysitter
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

    // Set refresh token in secure HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshExpiryMs,
    });

    // Send access token and user info in response body
    return res.status(200).json({
      success: true,
      token: accessToken,
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
 * POST /api/auth/refresh
 * Rotates the refresh token and issues a new access token
 */
async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      throw new AppError('Access denied. No refresh token provided.', 401);
    }

    // Verify JWT integrity
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
    }

    // Verify token exists in Redis (has not been revoked)
    const storedUserId = await redis.get(`refresh_token:${refreshToken}`);
    if (!storedUserId) {
      throw new AppError('Refresh token revoked or invalid. Please log in again.', 401);
    }

    // Verify user exists and is active
    const user = await UserModel.findByIdSafe(decoded.userId);
    if (!user) throw new AppError('User not found.', 401);
    if (!user.is_active) throw new AppError('Your account has been deactivated.', 401);

    // Rotate: Revoke old token
    await redis.del(`refresh_token:${refreshToken}`);

    // Generate new pair
    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id, user.role);

    const refreshExpiryMs = parseDuration(process.env.JWT_REFRESH_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000);
    const redisTTL = Math.floor(refreshExpiryMs / 1000);

    // Save new refresh token in Redis
    await redis.set(`refresh_token:${newRefreshToken}`, user.id, 'EX', redisTTL);

    logger.info('Rotated JWT refresh token', { userId: user.id });

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshExpiryMs,
    });

    return res.status(200).json({
      success: true,
      token: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 * Revokes refresh token in Redis and clears cookie
 */
async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      // Delete token from Redis
      await redis.del(`refresh_token:${refreshToken}`);
    }

    // Clear client-side cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    logger.info('User logged out successfully', {
      userId: req.user?.id,
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user
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
 * Authenticated users can change their own password
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

    // Revoke all refresh tokens for this user upon password change (security best practice)
    const keys = await redis.keys('refresh_token:*');
    for (const key of keys) {
      const storedVal = await redis.get(key);
      if (parseInt(storedVal, 10) === req.user.id) {
        await redis.del(key);
      }
    }

    logger.info('User changed password and revoked old sessions', { userId: req.user.id });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, refresh, logout, getMe, changePassword };
