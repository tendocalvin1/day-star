

const request = require('supertest');
const app = require('../../app');

describe('Attendance API', () => {
  let token;
  const today = new Date().toISOString().split('T')[0];

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'password123' });
    token = res.body.token;
  });

  // ── GET /api/attendance ────────────────────────────────────────────────

  describe('GET /api/attendance', () => {
    test('returns attendance records for today', async () => {
      const res = await request(app)
        .get(`/api/attendance?date=${today}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.summary).toBeDefined();
    });

    test('summary includes correct fields', async () => {
      const res = await request(app)
        .get(`/api/attendance?date=${today}`)
        .set('Authorization', `Bearer ${token}`);

      const { summary } = res.body;
      expect(summary.date).toBeDefined();
      expect(summary.total_children).toBeDefined();
      expect(summary.present).toBeDefined();
      expect(summary.full_day).toBeDefined();
      expect(summary.half_day).toBeDefined();
      expect(summary.checked_out).toBeDefined();
      expect(summary.still_in).toBeDefined();
    });

    test('rejects invalid date format', async () => {
      const res = await request(app)
        .get('/api/attendance?date=22-05-2026')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    test('rejects request without token', async () => {
      const res = await request(app).get('/api/attendance');
      expect(res.status).toBe(401);
    });
  });

  // ── GET /api/attendance/summary ────────────────────────────────────────

  describe('GET /api/attendance/summary', () => {
    test('returns daily summary with babysitter breakdown', async () => {
      const res = await request(app)
        .get(`/api/attendance/summary?date=${today}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.babysitter_breakdown).toBeDefined();
      expect(Array.isArray(res.body.data.babysitter_breakdown)).toBe(true);
    });
  });

  // ── POST /api/attendance/check-in ─────────────────────────────────────

  describe('POST /api/attendance/check-in', () => {
    test('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // missing child_id, date, session_type
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    test('rejects invalid session type', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${token}`)
        .send({
          child_id: 1,
          date: today,
          session_type: 'invalid_type',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    test('rejects duplicate check-in for same child same day', async () => {
  const testDate = '2025-01-15'; // fixed past date not in seed data

  // First check-in should succeed
  await request(app)
    .post('/api/attendance/check-in')
    .set('Authorization', `Bearer ${token}`)
    .send({
      child_id: 2,
      date: testDate,
      session_type: 'full_day',
    });

  // Second check-in same child same day should fail
  const res = await request(app)
    .post('/api/attendance/check-in')
    .set('Authorization', `Bearer ${token}`)
    .send({
      child_id: 2,
      date: testDate,
      session_type: 'full_day',
    });

  expect(res.status).toBe(409);
  expect(res.body.success).toBe(false);
});

    test('rejects check-in for non-existent child', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${token}`)
        .send({
          child_id: 99999,
          date: today,
          session_type: 'full_day',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});