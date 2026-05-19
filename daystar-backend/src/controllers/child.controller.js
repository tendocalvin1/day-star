

const { ChildModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { getPagination, paginatedResponse } = require('../utils/pagination');

async function getAll(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const children = await ChildModel.findAllWithAge({
      ...req.query,
      limit,
      offset,
    });

    const total = await ChildModel.countWhere({ is_active: true });

    return paginatedResponse(res, children, total, page, limit);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const child = await ChildModel.findByIdWithAttendance(req.params.id);
    if (!child) throw new AppError('Child not found.', 404);
    return res.status(200).json({ success: true, data: child });
  } catch (error) {
    next(error);
  }
}

async function getNotCheckedIn(req, res, next) {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const children = await ChildModel.findNotCheckedIn(date);
    return res.status(200).json({ success: true, count: children.length, data: children });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const child = await ChildModel.create({ ...req.validatedData, created_by: req.user.id });
    return res.status(201).json({ success: true, message: 'Child registered successfully.', data: child });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const existing = await ChildModel.findById(req.params.id);
    if (!existing) throw new AppError('Child not found.', 404);
    const updated = await ChildModel.updateById(req.params.id, req.validatedData);
    return res.status(200).json({ success: true, message: 'Child updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const existing = await ChildModel.findById(req.params.id);
    if (!existing) throw new AppError('Child not found.', 404);
    await ChildModel.softDeleteById(req.params.id);
    return res.status(200).json({ success: true, message: 'Child record deactivated.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, getNotCheckedIn, create, update, remove };