

const { IncidentModel, ChildModel, BabysitterModel, UserModel, NotificationModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/incidents
 * Manager sees all incidents
 * Babysitter sees only their own incidents
 * Query: ?is_resolved=false
 */
async function getAll(req, res, next) {
  try {
    const { is_resolved } = req.query;

    const filters = {
      // Babysitter can only see their own reports
      babysitter_id: req.user.role === 'babysitter' ? req.user.babysitter_id : undefined,
      // Convert string to boolean if provided
      is_resolved: is_resolved !== undefined ? is_resolved === 'true' : undefined,
    };

    // IncidentModel.findWithDetails() — joins children and babysitter names
    const records = await IncidentModel.findWithDetails(filters);

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/incidents
 * Babysitter only — files an incident report for a child
 * Automatically notifies the manager via in-app notification
 */
async function create(req, res, next) {
  try {
    // Only babysitters with a linked profile can file incidents
    if (!req.user.babysitter_id) {
      throw new AppError('Only babysitters can file incident reports.', 403);
    }

    const { child_id, description, severity } = req.validatedData;

    // Verify child exists and is active
    const child = await ChildModel.findOne({ id: child_id, is_active: true });
    if (!child) throw new AppError('Child not found.', 404);

    // BaseModel.create() — save the incident
    const incident = await IncidentModel.create({
      child_id,
      babysitter_id: req.user.babysitter_id,
      description,
      severity,
      is_resolved: false,
    });

    // Notify the manager — run both lookups in parallel
    const [manager, babysitter] = await Promise.all([
      UserModel.findManager(),
      BabysitterModel.findById(req.user.babysitter_id),
    ]);

    if (manager && babysitter) {
      // NotificationModel.notify() — stores in-app notification
      await NotificationModel.notify({
        type: 'incident_reported',
        title: `Incident reported: ${child.full_name}`,
        message: `${babysitter.first_name} ${babysitter.last_name} reported a ${severity} severity incident for ${child.full_name}.`,
        userId: manager.id,
        relatedId: incident.id,
        relatedType: 'incident',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Incident reported. Manager has been notified.',
      data: incident,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/incidents/:id/resolve
 * Manager only — marks an incident as resolved with notes
 */
async function resolve(req, res, next) {
  try {
    const { id } = req.params;

    // BaseModel.findById() — verify incident exists
    const incident = await IncidentModel.findById(id);
    if (!incident) throw new AppError('Incident not found.', 404);

    if (incident.is_resolved) {
      throw new AppError('This incident has already been resolved.', 409);
    }

    // IncidentModel.resolve() — sets is_resolved, resolution_notes, resolved_by, resolved_at
    const updated = await IncidentModel.resolve(id, {
      resolution_notes: req.validatedData.resolution_notes,
      resolved_by: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: 'Incident marked as resolved.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, create, resolve };