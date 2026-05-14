

const { ChildModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/children
 * Both roles — supports ?search=&session_type=&is_active=
 */
async function getAll(req, res, next) {
  try {
    // ChildModel.findAllWithAge() handles search, session_type, is_active filters
    // and computes age from date_of_birth for every child
    const children = await ChildModel.findAllWithAge(req.query);

    return res.status(200).json({
      success: true,
      count: children.length,
      data: children,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/children/:id
 * Both roles — returns child with last 7 attendance records
 */
async function getById(req, res, next) {
  try {
    // ChildModel.findByIdWithAttendance() — includes recent_attendance array
    const child = await ChildModel.findByIdWithAttendance(req.params.id);
    if (!child) throw new AppError('Child not found.', 404);

    return res.status(200).json({
      success: true,
      data: child,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/children/not-checked-in
 * Both roles — returns children not yet checked in for a given date
 * Used to populate the attendance check-in dropdown
 * Query: ?date=2025-04-15
 */
async function getNotCheckedIn(req, res, next) {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // ChildModel.findNotCheckedIn() — excludes children with attendance record today
    const children = await ChildModel.findNotCheckedIn(date);

    return res.status(200).json({
      success: true,
      count: children.length,
      data: children,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/children
 * Manager only — registers a new child
 */
async function create(req, res, next) {
  try {
    // BaseModel.create() — inserts and returns the full record
    const child = await ChildModel.create({
      ...req.validatedData,
      created_by: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Child registered successfully.',
      data: child,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/children/:id
 * Manager only — updates child details
 */
async function update(req, res, next) {
  try {
    const existing = await ChildModel.findById(req.params.id);
    if (!existing) throw new AppError('Child not found.', 404);

    // BaseModel.updateById() — updates and returns updated record
    const updated = await ChildModel.updateById(req.params.id, req.validatedData);

    return res.status(200).json({
      success: true,
      message: 'Child updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/children/:id
 * Manager only — soft delete only
 * Hard delete is never done — it would orphan attendance and income records
 */
async function remove(req, res, next) {
  try {
    const existing = await ChildModel.findById(req.params.id);
    if (!existing) throw new AppError('Child not found.', 404);

    // BaseModel.softDeleteById() — sets is_active=false, preserves all history
    await ChildModel.softDeleteById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Child record deactivated.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, getNotCheckedIn, create, update, remove };