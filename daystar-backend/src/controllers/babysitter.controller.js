

const bcrypt = require('bcryptjs');
const { BabysitterModel, UserModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { validateBabysitterAge } = require('../services/ageUtils');
const { getPagination, paginatedResponse } = require('../utils/pagination');

/**
 * GET /api/babysitters
 * Manager only — returns all active babysitters with computed age
 */
async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const babysitters = await BabysitterModel.findAllActive({ limit, offset });
    const total = await BabysitterModel.countWhere({ is_active: true });
    return paginatedResponse(res, babysitters, total, page, limit);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/babysitters/:id
 * Manager only — returns babysitter with their linked user account
 */
async function getById(req, res, next) {
  try {
    // BabysitterModel.findByIdWithAccount() — includes user_account field
    const babysitter = await BabysitterModel.findByIdWithAccount(req.params.id);
    if (!babysitter) throw new AppError('Babysitter not found.', 404);

    return res.status(200).json({
      success: true,
      data: babysitter,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/babysitters
 * Manager only — registers a new babysitter
 * Optionally creates a login account if create_account=true
 */
async function create(req, res, next) {
  try {
    const {
      create_account,
      account_email,
      account_password,
      ...babysitterData
    } = req.validatedData;

    // Business rule from exam spec: babysitter must be 21-35 years old
    // Age is calculated from date_of_birth — never stored directly
    const ageCheck = validateBabysitterAge(babysitterData.date_of_birth);
    if (!ageCheck.valid) throw new AppError(ageCheck.message, 422);

    // Prevent duplicate National ID Number
    if (await BabysitterModel.ninExists(babysitterData.nin)) {
      throw new AppError('A babysitter with this National ID Number already exists.', 409);
    }

    // Build account data if manager wants to create a login for this babysitter
    let accountData = null;
    if (create_account && account_email && account_password) {
      if (await UserModel.emailExists(account_email)) {
        throw new AppError('An account with this email already exists.', 409);
      }
      accountData = {
        email: account_email,
        password_hash: await bcrypt.hash(account_password, 12),
      };
    }

    // BabysitterModel.createWithAccount() runs both inserts in a transaction
    const { babysitter, userAccount } = await BabysitterModel.createWithAccount(
      { ...babysitterData, created_by: req.user.id },
      accountData
    );

    return res.status(201).json({
      success: true,
      message: 'Babysitter registered successfully.',
      data: {
        ...babysitter,
        age: ageCheck.age,
        user_account: userAccount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/babysitters/:id
 * Manager only — updates babysitter details
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.validatedData;

    // Re-validate age if date_of_birth is being updated
    if (updates.date_of_birth) {
      const ageCheck = validateBabysitterAge(updates.date_of_birth);
      if (!ageCheck.valid) throw new AppError(ageCheck.message, 422);
    }

    const existing = await BabysitterModel.findById(id);
    if (!existing) throw new AppError('Babysitter not found.', 404);

    // BaseModel.updateById() — updates and returns the full updated record
    const updated = await BabysitterModel.updateById(id, updates);

    return res.status(200).json({
      success: true,
      message: 'Babysitter updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/babysitters/:id
 * Manager only — soft delete (sets is_active=false, preserves records)
 */
async function remove(req, res, next) {
  try {
    const existing = await BabysitterModel.findById(req.params.id);
    if (!existing) throw new AppError('Babysitter not found.', 404);

    // BaseModel.softDeleteById() — never hard deletes, preserves payment history
    await BabysitterModel.softDeleteById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Babysitter deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };