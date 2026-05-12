const BaseModel = require('./BaseModel');

class NotificationModel extends BaseModel {
  constructor() {
    super('notifications');
  }

  /**
   * Get recent notifications for a user (newest first)
   */
  async findForUser(userId, limit = 20) {
    return this.db(this.table)
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  /**
   * Count unread notifications for a user (for the bell badge)
   */
  async countUnread(userId) {
    const result = await this.db(this.table)
      .where({ user_id: userId, is_read: false })
      .count('id as count')
      .first();
    return parseInt(result.count || 0, 10);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllRead(userId) {
    return this.db(this.table)
      .where({ user_id: userId, is_read: false })
      .update({ is_read: true });
  }

  /**
   * Create a notification — the main method for all other services to use
   */
  async notify({ type, title, message, userId, relatedId = null, relatedType = null }) {
    return this.create({
      type,
      title,
      message,
      user_id: userId,
      related_id: relatedId,
      related_type: relatedType,
      is_read: false,
    });
  }
}

module.exports = new NotificationModel();