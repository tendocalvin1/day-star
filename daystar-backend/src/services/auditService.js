

const db = require('../config/database');

async function log({
  userId,
  actorId,
  userEmail,
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
  metadata,
  req,
}) {
  try {
    await db('audit_logs').insert({
      user_id: userId || actorId || null,
      user_email: userEmail,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      ip_address: req?.ip,
      user_agent: req?.headers?.['user-agent'],
    });
  } catch (err) {
    // Never let audit logging crash the main request
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { log };
