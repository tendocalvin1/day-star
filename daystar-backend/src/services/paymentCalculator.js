

/**
 * Payment Calculator Service
 * 
 * Business logic for babysitter compensation.
 * Rates per exam spec:
 *   - Half day: UGX 2,000 per child
 *   - Full day: UGX 5,000 per child
 * 
 * This is a SERVICE, not a controller or route.
 * It has no knowledge of HTTP - just pure data in, data out.
 */

const RATES = {
  half_day: 2000,
  full_day: 5000,
};

/**
 * Calculate payment for one babysitter on one day
 * @param {number} halfDayChildren - number of half-day children
 * @param {number} fullDayChildren - number of full-day children
 * @returns {{ amount_ugx: number, breakdown: object }}
 */
function calculatePayment(halfDayChildren, fullDayChildren) {
  const halfDayAmount = halfDayChildren * RATES.half_day;
  const fullDayAmount = fullDayChildren * RATES.full_day;
  const totalAmount = halfDayAmount + fullDayAmount;

  return {
    amount_ugx: totalAmount,
    breakdown: {
      half_day: { children: halfDayChildren, rate: RATES.half_day, amount: halfDayAmount },
      full_day: { children: fullDayChildren, rate: RATES.full_day, amount: fullDayAmount },
    },
  };
}

/**
 * Generate daily payment records for all babysitters
 * Called by manager. Reads attendance for a date, groups by babysitter,
 * calculates payment for each, upserts into babysitter_payments.
 *
 * @param {string} date - ISO date string e.g. "2025-04-15"
 * @param {import('knex')} db
 * @param {number} managerId
 * @returns {Promise<Array>} - array of payment records created/updated
 */
async function generateDailyPayments(date, db, managerId) {
  // 1. Get all attendance for this date with session type
  const attendance = await db('attendance')
    .select(
      'attendance.babysitter_id',
      'attendance.session_type',
      db.raw('COUNT(*) as child_count')
    )
    .where('attendance.date', date)
    .where('attendance.status', 'present')
    .whereNotNull('attendance.babysitter_id')
    .groupBy('attendance.babysitter_id', 'attendance.session_type');

  if (attendance.length === 0) {
    return [];
  }

  // 2. Pivot: { babysitterId -> { half_day: N, full_day: N } }
  const byBabysitter = {};
  for (const row of attendance) {
    const bid = row.babysitter_id;
    if (!byBabysitter[bid]) {
      byBabysitter[bid] = { half_day: 0, full_day: 0 };
    }
    byBabysitter[bid][row.session_type] += parseInt(row.child_count, 10);
  }

  // 3. Generate payment record for each babysitter
  const results = [];
  for (const [babysitterId, counts] of Object.entries(byBabysitter)) {
    const { amount_ugx } = calculatePayment(counts.half_day, counts.full_day);
    const totalChildren = counts.half_day + counts.full_day;

    // Upsert — safe to call multiple times for same date
    const existing = await db('babysitter_payments')
      .where({ babysitter_id: babysitterId, date })
      .first();

    if (existing) {
      await db('babysitter_payments')
        .where({ babysitter_id: babysitterId, date })
        .update({
          half_day_children: counts.half_day,
          full_day_children: counts.full_day,
          total_children: totalChildren,
          amount_ugx,
          updated_at: db.fn.now(),
        });
      results.push({ ...existing, amount_ugx, total_children: totalChildren, updated: true });
    } else {
      const [record] = await db('babysitter_payments')
        .insert({
          babysitter_id: parseInt(babysitterId, 10),
          date,
          half_day_children: counts.half_day,
          full_day_children: counts.full_day,
          total_children: totalChildren,
          amount_ugx,
          is_cleared: false,
          created_by: managerId,
        })
        .returning('*');
      results.push({ ...record, updated: false });
    }
  }

  return results;
}

/**
 * Check if a budget is exceeded after adding a new expense
 * @param {string} category
 * @param {number} amount_ugx
 * @param {string} date
 * @param {import('knex')} db
 * @returns {Promise<{ exceeded: boolean, budget: object|null, spent: number }>}
 */
async function checkBudgetThreshold(category, amount_ugx, date, db) {
  // Find active budget for this category covering this date
  const budget = await db('budgets')
    .where('category', category)
    .where('start_date', '<=', date)
    .where('end_date', '>=', date)
    .first();

  if (!budget) {
    return { exceeded: false, budget: null, spent: 0 };
  }

  // Sum all expenses in this category within the budget period
  const result = await db('expenses')
    .where('category', category)
    .where('expense_date', '>=', budget.start_date)
    .where('expense_date', '<=', budget.end_date)
    .sum('amount_ugx as total')
    .first();

  const currentSpend = parseInt(result.total || 0, 10);
  const newTotal = currentSpend + amount_ugx;

  return {
    exceeded: newTotal > budget.amount_ugx,
    nearLimit: newTotal > budget.amount_ugx * 0.8 && newTotal <= budget.amount_ugx,
    budget,
    spent: currentSpend,
    newTotal,
  };
}

module.exports = { calculatePayment, generateDailyPayments, checkBudgetThreshold, RATES };