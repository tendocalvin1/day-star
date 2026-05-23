const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');

describe('POST /api/auth/login', () => {
  test('returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('manager');

    const decoded = jwt.decode(res.body.token);
    expect(decoded.exp - decoded.iat).toBeLessThanOrEqual(15 * 60);
  });

  test('rejects invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('rejects missing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'password123' });
    token = res.body.token;
  });

  test('returns current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('manager@daystar.ug');
  });

  test('rejects request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/auth/change-password', () => {
  let managerToken;
  let accountEmail;
  const originalPassword = 'password123';
  const newPassword = 'newpassword123';

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'password123' });

    managerToken = loginRes.body.token;

    const unique = Date.now().toString().slice(-8);
    accountEmail = `auth.${unique}@daystar.test`;

    const createRes = await request(app)
      .post('/api/babysitters')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        first_name: 'Auth',
        last_name: 'Fixture',
        phone: `074${unique.slice(0, 7)}`,
        nin: `AUTH${unique}`,
        date_of_birth: '1998-05-14',
        skills: ['first aid'],
        availability: ['weekdays'],
        years_experience: 4,
        location: 'Kampala',
        next_of_kin_name: 'Auth Kin',
        next_of_kin_phone: '0701234888',
        create_account: true,
        account_email: accountEmail,
        account_password: originalPassword,
      });

    expect(createRes.status).toBe(201);
  });

  test('rejects invalid password change payload with Zod validation', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: accountEmail, password: originalPassword });

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .send({ current_password: originalPassword, new_password: originalPassword });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('changes password and requires the new password on next login', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: accountEmail, password: originalPassword });

    const changeRes = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .send({ current_password: originalPassword, new_password: newPassword });

    expect(changeRes.status).toBe(200);
    expect(changeRes.body.success).toBe(true);

    const oldPasswordRes = await request(app)
      .post('/api/auth/login')
      .send({ email: accountEmail, password: originalPassword });

    expect(oldPasswordRes.status).toBe(401);

    const newPasswordRes = await request(app)
      .post('/api/auth/login')
      .send({ email: accountEmail, password: newPassword });

    expect(newPasswordRes.status).toBe(200);
    expect(newPasswordRes.body.success).toBe(true);
  });
});
