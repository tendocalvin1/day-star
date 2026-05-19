

const bcrypt = require('bcryptjs');

/**
 * Seed: Populate database with realistic test data
 * Run: npm run seed
 * 
 * Creates:
 * - 1 manager account
 * - 3 babysitter accounts (with linked profiles)
 * - 6 children
 * - Sample attendance, income, expenses
 */
exports.seed = async function (knex) {
  // ── Clean in reverse FK order ──────────────────────────────────────────
  await knex('notifications').del();
  await knex('incidents').del();
  await knex('budgets').del();
  await knex('expenses').del();
  await knex('income').del();
  await knex('babysitter_payments').del();
  await knex('attendance').del();
  await knex('children').del();
  await knex('users').del();
  await knex('babysitters').del();

  const passwordHash = await bcrypt.hash('password123', 12);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // ── Babysitter profiles ────────────────────────────────────────────────
  const [grace, peter, sarah] = await knex('babysitters')
    .insert([
      {
        first_name: 'Grace',
        last_name: 'Nakato',
        email: 'grace.nakato@email.com',
        phone: '0772123456',
        nin: 'CM97100200001',
        date_of_birth: '1998-05-14', // Age: 26 ✓
        next_of_kin_name: 'Sarah Nakato',
        next_of_kin_phone: '0701234567',
        is_active: true,
      },
      {
        first_name: 'Peter',
        last_name: 'Ssemakula',
        email: 'peter.ssemakula@email.com',
        phone: '0782345678',
        nin: 'CM95080300002',
        date_of_birth: '1995-08-22', // Age: 29 ✓
        next_of_kin_name: 'Moses Ssemakula',
        next_of_kin_phone: '0712345678',
        is_active: true,
      },
      {
        first_name: 'Sarah',
        last_name: 'Auma',
        email: 'sarah.auma@email.com',
        phone: '0752456789',
        nin: 'CF00030400003',
        date_of_birth: '2000-03-10', // Age: 25 ✓
        next_of_kin_name: 'Joan Auma',
        next_of_kin_phone: '0723456789',
        is_active: true,
      },
    ])
    .returning('id');

  // Knex returning() gives [{id:X}] on PG, or [X] on SQLite
  const graceId = grace.id || grace;
  const peterId = peter.id || peter;
  const sarahId = sarah.id || sarah;

  // ── User accounts ──────────────────────────────────────────────────────
  const [managerUser, graceUser, peterUser, sarahUser] = await knex('users')
    .insert([
      {
        email: 'manager@daystar.ug',
        password_hash: passwordHash,
        role: 'manager',
        babysitter_id: null,
        is_active: true,
      },
      {
        email: 'grace@daystar.ug',
        password_hash: passwordHash,
        role: 'babysitter',
        babysitter_id: graceId,
        is_active: true,
      },
      {
        email: 'peter@daystar.ug',
        password_hash: passwordHash,
        role: 'babysitter',
        babysitter_id: peterId,
        is_active: true,
      },
      {
        email: 'sarah@daystar.ug',
        password_hash: passwordHash,
        role: 'babysitter',
        babysitter_id: sarahId,
        is_active: true,
      },
    ])
    .returning('id');

  const managerId = managerUser.id || managerUser;

  // ── Children ───────────────────────────────────────────────────────────
  const childIds = await knex('children')
    .insert([
      {
        full_name: 'Aisha Kamara',
        date_of_birth: '2021-03-15',
        parent_name: 'Fatima Kamara',
        parent_phone: '0701111111',
        parent_email: 'fatima@email.com',
        session_type: 'full_day',
        special_needs: null,
        created_by: managerId,
      },
      {
        full_name: 'Brian Omondi',
        date_of_birth: '2022-07-20',
        parent_name: 'John Omondi',
        parent_phone: '0702222222',
        parent_email: null,
        session_type: 'half_day',
        special_needs: 'Peanut allergy - no peanut products',
        created_by: managerId,
      },
      {
        full_name: 'Clara Namukasa',
        date_of_birth: '2020-11-08',
        parent_name: 'Rebecca Namukasa',
        parent_phone: '0703333333',
        parent_email: 'rebecca@email.com',
        session_type: 'full_day',
        special_needs: null,
        created_by: managerId,
      },
      {
        full_name: 'David Muwonge',
        date_of_birth: '2023-01-30',
        parent_name: 'Joseph Muwonge',
        parent_phone: '0704444444',
        parent_email: null,
        session_type: 'full_day',
        special_needs: 'Asthmatic - has inhaler in bag',
        created_by: managerId,
      },
      {
        full_name: 'Emma Nalubega',
        date_of_birth: '2021-09-12',
        parent_name: 'Miriam Nalubega',
        parent_phone: '0705555555',
        parent_email: 'miriam@email.com',
        session_type: 'half_day',
        special_needs: null,
        created_by: managerId,
      },
      {
        full_name: 'Frank Byarugaba',
        date_of_birth: '2022-04-05',
        parent_name: 'Patrick Byarugaba',
        parent_phone: '0706666666',
        parent_email: null,
        session_type: 'full_day',
        special_needs: null,
        created_by: managerId,
      },
    ])
    .returning('id');

  const ids = childIds.map((r) => (r.id || r));
  const [c1, c2, c3, c4, c5, c6] = ids;

  // ── Attendance - today ─────────────────────────────────────────────────
  await knex('attendance').insert([
    { child_id: c1, babysitter_id: graceId, date: today, session_type: 'full_day', check_in_time: '07:30:00', status: 'present', recorded_by: managerId },
    { child_id: c2, babysitter_id: graceId, date: today, session_type: 'half_day', check_in_time: '07:45:00', status: 'present', recorded_by: managerId },
    { child_id: c3, babysitter_id: peterId, date: today, session_type: 'full_day', check_in_time: '08:00:00', status: 'present', recorded_by: managerId },
    { child_id: c4, babysitter_id: peterId, date: today, session_type: 'full_day', check_in_time: '08:15:00', status: 'present', recorded_by: managerId },
    { child_id: c5, babysitter_id: sarahId, date: today, session_type: 'half_day', check_in_time: '08:30:00', status: 'present', recorded_by: managerId },
    { child_id: c6, babysitter_id: sarahId, date: today, session_type: 'full_day', check_in_time: '07:50:00', status: 'present', recorded_by: managerId },
  ]);

  // ── Income - today ─────────────────────────────────────────────────────
  // full_day = UGX 25,000/child, half_day = UGX 15,000/child (parent rates)
  await knex('income').insert([
    { child_id: c1, amount_ugx: 25000, session_type: 'full_day', payment_date: today, payment_method: 'cash', created_by: managerId },
    { child_id: c2, amount_ugx: 15000, session_type: 'half_day', payment_date: today, payment_method: 'mobile_money', created_by: managerId },
    { child_id: c3, amount_ugx: 25000, session_type: 'full_day', payment_date: today, payment_method: 'cash', created_by: managerId },
    { child_id: c5, amount_ugx: 15000, session_type: 'half_day', payment_date: today, payment_method: 'cash', created_by: managerId },
    // Yesterday income
    { child_id: c4, amount_ugx: 25000, session_type: 'full_day', payment_date: yesterday, payment_method: 'cash', created_by: managerId },
    { child_id: c6, amount_ugx: 25000, session_type: 'full_day', payment_date: yesterday, payment_method: 'mobile_money', created_by: managerId },
  ]);

  // ── Expenses ───────────────────────────────────────────────────────────
  await knex('expenses').insert([
    { category: 'utilities', description: 'UMEME electricity bill - May', amount_ugx: 85000, expense_date: yesterday, created_by: managerId },
    { category: 'toys_materials', description: 'Educational building blocks x3 sets', amount_ugx: 45000, expense_date: yesterday, created_by: managerId },
    { category: 'maintenance', description: 'Toilet repair - plumber', amount_ugx: 30000, expense_date: today, created_by: managerId },
  ]);

  // ── Budgets ────────────────────────────────────────────────────────────
  const monthStart = `${today.substring(0, 7)}-01`;
  const monthEnd = `${today.substring(0, 7)}-30`;
  await knex('budgets').insert([
    { category: 'babysitter_salary', period: 'monthly', amount_ugx: 500000, start_date: monthStart, end_date: monthEnd, created_by: managerId },
    { category: 'utilities', period: 'monthly', amount_ugx: 150000, start_date: monthStart, end_date: monthEnd, created_by: managerId },
    { category: 'toys_materials', period: 'monthly', amount_ugx: 100000, start_date: monthStart, end_date: monthEnd, created_by: managerId },
    { category: 'maintenance', period: 'monthly', amount_ugx: 80000, start_date: monthStart, end_date: monthEnd, created_by: managerId },
  ]);

  console.log('✅ Seed complete');
  console.log('   Accounts:');
  console.log('   manager@daystar.ug  | password123 | role: manager');
  console.log('   grace@daystar.ug    | password123 | role: babysitter');
  console.log('   peter@daystar.ug    | password123 | role: babysitter');
  console.log('   sarah@daystar.ug    | password123 | role: babysitter');
};