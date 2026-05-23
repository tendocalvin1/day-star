

const { IncidentModel, ChildModel, BabysitterModel, UserModel, NotificationModel } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const auditService = require('../services/auditService');

/**
 * GET /api/incidents
 * Manager sees all incidents
 * Babysitter sees only their own incidents
 * Query: ?is_resolved=false
 */
async function getAll(req, res, next) {
  try {
    const { is_resolved } = req.validatedQuery || req.query;

    const filters = {
      babysitter_id: req.user.role === 'babysitter' ? req.user.babysitter_id : undefined,
      is_resolved,
    };

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
 */
async function create(req, res, next) {
  try {
    if (!req.user.babysitter_id) {
      throw new AppError('Only babysitters can file incident reports.', 403);
    }

    const { child_id, description, severity } = req.validatedData;

    const child = await ChildModel.findOne({ id: child_id, is_active: true });
    if (!child) throw new AppError('Child not found.', 404);

    const incident = await IncidentModel.create({
      child_id,
      babysitter_id: req.user.babysitter_id,
      description,
      severity,
      is_resolved: false,
    });

    await auditService.log({
      actorId: req.user.id,
      userEmail: req.user.email,
      action: 'incident.created',
      entityType: 'incident',
      entityId: incident.id,
      newValues: incident,
      metadata: { childId: child_id, severity },
      req,
    });

    // Notify manager
    const [manager, babysitter] = await Promise.all([
      UserModel.findManager(),
      BabysitterModel.findById(req.user.babysitter_id),
    ]);

    if (manager && babysitter) {
      await NotificationModel.notify({
        type: 'incident_reported',
        title: `Incident reported: ${child.full_name}`,
        message: `${babysitter.first_name} ${babysitter.last_name} reported a ${severity} severity incident for ${child.full_name}.`,
        userId: manager.id,
        relatedId: incident.id,
        relatedType: 'incident',
      });
    }

    logger.warn('Incident reported', {
      incidentId: incident.id,
      childId: child_id,
      severity,
      babysitterId: req.user.babysitter_id,
    });

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
 * Manager only — marks an incident as resolved
 */
async function resolve(req, res, next) {
  try {
    const { id } = req.params;

    const incident = await IncidentModel.findById(id);
    if (!incident) throw new AppError('Incident not found.', 404);
    if (incident.is_resolved) throw new AppError('This incident has already been resolved.', 409);

    const updated = await IncidentModel.resolve(id, {
      resolution_notes: req.validatedData.resolution_notes,
      resolved_by: req.user.id,
    });

    await auditService.log({
      actorId: req.user.id,
      userEmail: req.user.email,
      action: 'incident.resolved',
      entityType: 'incident',
      entityId: updated.id,
      oldValues: incident,
      newValues: updated,
      req,
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
