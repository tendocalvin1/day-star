
const { AttendanceModel, ChildModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/attendance
 * Both roles — returns all attendance records for a date
 * Query: ?date=2025-04-15 (defaults to today)
 */
async function getByDate(req, res, next) {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // AttendanceModel.findByDate() — joins children and babysitters
    const records = await AttendanceModel.findByDate(date);

    // AttendanceModel.getDailySummary() — counts present, full_day, half_day etc.
    const summary = await AttendanceModel.getDailySummary(date);

    return res.status(200).json({
      success: true,
      data: records,
      summary: { date, ...summary },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/attendance/summary
 * Both roles — returns daily summary + per-babysitter breakdown
 * Query: ?date=2025-04-15
 */
async function getDailySummary(req, res, next) {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const summary = await AttendanceModel.getDailySummary(date);

    // AttendanceModel.getBabysitterBreakdown() — child count per babysitter
    const babysitterBreakdown = await AttendanceModel.getBabysitterBreakdown(date);

    return res.status(200).json({
      success: true,
      data: {
        date,
        ...summary,
        babysitter_breakdown: babysitterBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/attendance/check-in
 * Both roles — records a child's arrival for the day
 * Prevents duplicate check-in for the same child on the same date
 */
async function checkIn(req, res, next) {
  try {
    const { child_id, babysitter_id, date, session_type, check_in_time } = req.validatedData;

    // Verify child exists and is active
    const child = await ChildModel.findOne({ id: child_id, is_active: true });
    if (!child) throw new AppError('Child not found or is inactive.', 404);

    // AttendanceModel.isAlreadyCheckedIn() — prevents duplicate records
    const alreadyIn = await AttendanceModel.isAlreadyCheckedIn(child_id, date);
    if (alreadyIn) {
      throw new AppError(`${child.full_name} is already checked in for ${date}.`, 409);
    }

    const timeNow = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

    // BaseModel.create() — inserts and returns full record
    const record = await AttendanceModel.create({
      child_id,
      babysitter_id: babysitter_id || null,
      date,
      session_type,
      check_in_time: check_in_time || timeNow,
      status: 'present',
      recorded_by: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: `${child.full_name} checked in successfully.`,
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/attendance/:id/check-out
 * Both roles — records a child's departure time
 */
async function checkOut(req, res, next) {
  try {
    const { id } = req.params;

    // BaseModel.findById() — get the attendance record
    const attendance = await AttendanceModel.findById(id);
    if (!attendance) throw new AppError('Attendance record not found.', 404);

    if (attendance.check_out_time) {
      throw new AppError('This child has already been checked out.', 409);
    }

    const timeNow = new Date().toTimeString().split(' ')[0];
    const checkOutTime = req.validatedData?.check_out_time || timeNow;

    // BaseModel.updateById() — updates check_out_time
    const updated = await AttendanceModel.updateById(id, {
      check_out_time: checkOutTime,
    });

    return res.status(200).json({
      success: true,
      message: 'Check-out recorded successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getByDate, getDailySummary, checkIn, checkOut };