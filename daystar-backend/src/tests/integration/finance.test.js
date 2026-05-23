const request = require('supertest');
const app = require('../../app');

describe('Finance API', () => {
  let managerToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'password123' });

    managerToken = res.body.token;
  });

  test('rejects invalid expense query filters', async () => {
    const res = await request(app)
      .get('/api/expenses?category=payroll')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('generates babysitter payments from attendance records', async () => {
    const unique = Date.now().toString().slice(-8);
    const day = String((parseInt(unique.slice(-2), 10) % 28) + 1).padStart(2, '0');
    const paymentDate = `2026-01-${day}`;

    const babysitterRes = await request(app)
      .post('/api/babysitters')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        first_name: 'Payment',
        last_name: 'Fixture',
        phone: `071${unique.slice(0, 7)}`,
        nin: `PAY${unique}`,
        date_of_birth: '1998-05-14',
        skills: ['first aid'],
        availability: ['weekdays'],
        years_experience: 4,
        location: 'Kampala',
        next_of_kin_name: 'Fixture Kin',
        next_of_kin_phone: '0701234555',
      });

    expect(babysitterRes.status).toBe(201);

    const childRes = await request(app)
      .post('/api/children')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        full_name: `Payment Child ${unique}`,
        date_of_birth: '2021-03-15',
        parent_name: 'Payment Parent',
        parent_phone: '0705555000',
        parent_email: null,
        session_type: 'full_day',
        special_needs: null,
      });

    expect(childRes.status).toBe(201);

    const attendanceRes = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        child_id: childRes.body.data.id,
        babysitter_id: babysitterRes.body.data.id,
        date: paymentDate,
        session_type: 'full_day',
      });

    expect(attendanceRes.status).toBe(201);

    const res = await request(app)
      .post('/api/babysitter-payments/generate')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ date: paymentDate });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('rejects invalid payment generation date', async () => {
    const res = await request(app)
      .post('/api/babysitter-payments/generate')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ date: '23-05-2026' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('rejects invalid payment clear id before querying database', async () => {
    const res = await request(app)
      .put('/api/babysitter-payments/not-a-number/clear')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});
