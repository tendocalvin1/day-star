

/**
 * Notification Service
 * Creates in-app notifications. SMS is a future integration stub.
 * All notifications are stored in DB and surfaced in the frontend.
 */

/**
 * Create a notification for a user
 * @param {import('knex')} db
 * @param {{ type, title, message, userId, relatedId?, relatedType? }} params
 */
async function createNotification(db, { type, title, message, userId, relatedId = null, relatedType = null }) {
  await db('notifications').insert({
    type,
    title,
    message,
    user_id: userId,
    related_id: relatedId,
    related_type: relatedType,
    is_read: false,
  });
}

/**
 * Notify manager of a new incident
 */
async function notifyIncidentReported(db, { managerUserId, childName, babysitterName, severity, incidentId }) {
  await createNotification(db, {
    type: 'incident_reported',
    title: `Incident reported: ${childName}`,
    message: `${babysitterName} reported a ${severity} severity incident for ${childName}.`,
    userId: managerUserId,
    relatedId: incidentId,
    relatedType: 'incident',
  });
}

/**
 * Notify manager when budget is exceeded
 */
async function notifyBudgetExceeded(db, { managerUserId, category, budgetAmount, spentAmount }) {
  const categoryLabel = category.replace(/_/g, ' ');
  await createNotification(db, {
    type: 'budget_exceeded',
    title: `Budget exceeded: ${categoryLabel}`,
    message: `${categoryLabel} budget of UGX ${budgetAmount.toLocaleString()} has been exceeded. Current spend: UGX ${spentAmount.toLocaleString()}.`,
    userId: managerUserId,
    relatedType: 'budget',
  });
}

/**
 * TODO: Future SMS integration via Africa's Talking
 * async function sendSMS(phone, message) {
 *   const AT = require('africastalking')({ apiKey: process.env.AT_API_KEY, username: process.env.AT_USERNAME });
 *   await AT.SMS.send({ to: [phone], message, from: 'DayStar' });
 * }
 */

module.exports = { createNotification, notifyIncidentReported, notifyBudgetExceeded };