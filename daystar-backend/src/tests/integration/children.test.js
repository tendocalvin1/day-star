

const request = require('supertest');
const app = require('../../app');

describe('Children API', () => {
  let token;

  // Get manager token before all tests
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'password123' });
    token = res.body.token;
  });

  // ── GET /api/children ──────────────────────────────────────────────────

  describe('GET /api/children', () => {
    test('returns list of children with computed ages', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    test('returns pagination metadata', async () => {
      const res = await request(app)
        .get('/api/children?page=1&limit=3')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(3);
      expect(res.body.data.length).toBeLessThanOrEqual(3);
    });

    test('each child has computed age', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Authorization', `Bearer ${token}`);

      const child = res.body.data[0];
      expect(child.age).toBeDefined();
      expect(child.age.years).toBeDefined();
      expect(child.age.months).toBeDefined();
      expect(child.age.display).toBeDefined();
    });

    test('filters by session type', async () => {
      const res = await request(app)
        .get('/api/children?session_type=full_day')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((child) => {
        expect(child.session_type).toBe('full_day');
      });
    });

    test('rejects request without token', async () => {
      const res = await request(app).get('/api/children');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('rejects invalid date format in query', async () => {
      const res = await request(app)
        .get('/api/children?date=not-a-date')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(422);
    });
  });

  // ── GET /api/children/:id ──────────────────────────────────────────────

  describe('GET /api/children/:id', () => {
    test('returns child with attendance history', async () => {
      const res = await request(app)
        .get('/api/children/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.recent_attendance).toBeDefined();
      expect(Array.isArray(res.body.data.recent_attendance)).toBe(true);
    });

    test('returns 404 for non-existent child', async () => {
      const res = await request(app)
        .get('/api/children/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ── POST /api/children ─────────────────────────────────────────────────

  describe('POST /api/children', () => {
    test('registers a new child successfully', async () => {
      const res = await request(app)
        .post('/api/children')
        .set('Authorization', `Bearer ${token}`)
        .send({
          full_name: 'Test Child Tendo',
          date_of_birth: '2022-01-15',
          parent_name: 'Test Parent',
          parent_phone: '0700000001',
          session_type: 'full_day',
          special_needs: null,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.full_name).toBe('Test Child Tendo');
    });

    test('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/children')
        .set('Authorization', `Bearer ${token}`)
        .send({
          full_name: 'Incomplete Child',
          // missing date_of_birth, parent_name, parent_phone, session_type
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    test('rejects invalid session type', async () => {
      const res = await request(app)
        .post('/api/children')
        .set('Authorization', `Bearer ${token}`)
        .send({
          full_name: 'Test Child',
          date_of_birth: '2022-01-15',
          parent_name: 'Test Parent',
          parent_phone: '0700000002',
          session_type: 'invalid_session',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    test('rejects invalid phone number format', async () => {
      const res = await request(app)
        .post('/api/children')
        .set('Authorization', `Bearer ${token}`)
        .send({
          full_name: 'Test Child',
          date_of_birth: '2022-01-15',
          parent_name: 'Test Parent',
          parent_phone: '12345',
          session_type: 'full_day',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  // ── GET /api/children/not-checked-in ──────────────────────────────────

  describe('GET /api/children/not-checked-in', () => {
    test('returns children not yet checked in today', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/children/not-checked-in?date=${today}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});