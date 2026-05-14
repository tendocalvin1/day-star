
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserModel, BabysitterModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.validatedData;

    // UserModel.findByEmail returns password_hash — only used here
    const user = await UserModel.findByEmail(email);

    // Same error for wrong email OR wrong password — never reveal which
    if (!user) throw new AppError('Invalid email or password.', 401);
    if (!user.is_active) throw new AppError('Your account has been deactivated. Contact the manager.', 401);

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) throw new AppError('Invalid email or password.', 401);

    // Sign JWT with userId and role
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Attach babysitter profile if user is a babysitter
    let profile = null;
    if (user.role === 'babysitter' && user.babysitter_id) {
      profile = await BabysitterModel.findById(user.babysitter_id);
    }

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
 * Returns the currently authenticated user
 * requireAuth middleware runs first and attaches req.user
 */
async function getMe(req, res, next) {
  try {
    // req.user is attached by requireAuth middleware using UserModel.findByIdSafe
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

module.exports = { login, getMe };