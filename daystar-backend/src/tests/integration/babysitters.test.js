

const request = require('supertest');
const app = require('../../app');

describe('Babysitters API', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'password123' });
    token = res.body.token;
  });

  // ── GET /api/babysitters ───────────────────────────────────────────────

  describe('GET /api/babysitters', () => {
    test('returns list of active babysitters', async () => {
      const res = await request(app)
        .get('/api/babysitters')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    test('each babysitter has computed age', async () => {
      const res = await request(app)
        .get('/api/babysitters')
        .set('Authorization', `Bearer ${token}`);

      const babysitter = res.body.data[0];
      expect(babysitter.age).toBeDefined();
      expect(typeof babysitter.age).toBe('number');
    });

    test('filters babysitters by skills, availability, experience, and location', async () => {
      const unique = Date.now().toString().slice(-8);
      const createRes = await request(app)
        .post('/api/babysitters')
        .set('Authorization', `Bearer ${token}`)
        .send({
          first_name: 'Searchable',
          last_name: 'Caregiver',
          phone: `070${unique.slice(0, 7)}`,
          nin: `SEARCH${unique}`,
          date_of_birth: '1998-05-14',
          skills: ['montessori', 'first aid'],
          availability: ['weekdays', 'full_day'],
          years_experience: 5,
          location: `Searchville ${unique}`,
          next_of_kin_name: 'Fixture Person',
          next_of_kin_phone: '0701234999',
        });

      expect(createRes.status).toBe(201);

      const res = await request(app)
        .get(`/api/babysitters?skills=montessori&availability=weekdays&min_experience=4&location=Searchville%20${unique}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0]).toMatchObject({
        first_name: 'Searchable',
        location: `Searchville ${unique}`,
        years_experience: 5,
      });
      expect(res.body.data[0].skills).toContain('montessori');
      expect(res.body.data[0].availability).toContain('weekdays');
    });

    test('rejects invalid search filters', async () => {
      const res = await request(app)
        .get('/api/babysitters?sort_by=password_hash')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    test('rejects request without token', async () => {
      const res = await request(app).get('/api/babysitters');
      expect(res.status).toBe(401);
    });

    test('rejects babysitter role accessing list', async () => {
      // Login as babysitter
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'grace@daystar.ug', password: 'password123' });

      const babysitterToken = loginRes.body.token;

      const res = await request(app)
        .get('/api/babysitters')
        .set('Authorization', `Bearer ${babysitterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ── GET /api/babysitters/:id ───────────────────────────────────────────

  describe('GET /api/babysitters/:id', () => {
    test('returns babysitter with user account', async () => {
      const res = await request(app)
        .get('/api/babysitters/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.first_name).toBeDefined();
      expect(res.body.data.age).toBeDefined();
    });

    test('returns 404 for non-existent babysitter', async () => {
      const res = await request(app)
        .get('/api/babysitters/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ── POST /api/babysitters ──────────────────────────────────────────────

  describe('POST /api/babysitters', () => {
    test('rejects babysitter younger than 21', async () => {
      const res = await request(app)
        .post('/api/babysitters')
        .set('Authorization', `Bearer ${token}`)
        .send({
          first_name: 'Young',
          last_name: 'Person',
          phone: '0700000099',
          nin: 'CM10000000099',
          date_of_birth: '2010-01-01', // 16 years old
          next_of_kin_name: 'Parent Name',
          next_of_kin_phone: '0700000098',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('21');
    });

    test('rejects babysitter older than 35', async () => {
      const res = await request(app)
        .post('/api/babysitters')
        .set('Authorization', `Bearer ${token}`)
        .send({
          first_name: 'Old',
          last_name: 'Person',
          phone: '0700000097',
          nin: 'CM10000000097',
          date_of_birth: '1980-01-01', // 46 years old
          next_of_kin_name: 'Relative Name',
          next_of_kin_phone: '0700000096',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('35');
    });

    test('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/babysitters')
        .set('Authorization', `Bearer ${token}`)
        .send({
          first_name: 'Incomplete',
          // missing last_name, phone, nin, date_of_birth
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    test('rejects duplicate NIN', async () => {
      const res = await request(app)
        .post('/api/babysitters')
        .set('Authorization', `Bearer ${token}`)
        .send({
          first_name: 'Duplicate',
          last_name: 'NIN',
          phone: '0700000095',
          nin: 'CM97100200001', // already exists in seed data
          date_of_birth: '1998-05-14',
          next_of_kin_name: 'Someone',
          next_of_kin_phone: '0700000094',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });
});
