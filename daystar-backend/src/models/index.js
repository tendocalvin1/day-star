/**
 * Models Index — Single entry point for all database models
 *
 * Every controller imports from here:
 *   const { ChildModel, AttendanceModel } = require('../models');
 *
 * If you ever rename a model file, you only update this one
 * file — not every controller that uses it.
 */

module.exports = {
  UserModel:              require('./user.model'),
  BabysitterModel:        require('./babysitter.model'),
  BabysitterPaymentModel: require('./babysitter.payment.model'),
  ChildModel:             require('./child.model'),
  AttendanceModel:        require('./attendance.model'),
  IncomeModel:            require('./income.model'),
  ExpenseModel:           require('./expense.model'),
  BudgetModel:            require('./budget.model'),
  IncidentModel:          require('./incident.model'),
  NotificationModel:      require('./notification.model'),
};