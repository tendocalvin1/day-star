const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = require('../../app');
const db = require('../../config/database');
const { requireAuth, requireBabysitter } = require('../../middleware/auth');
const { errorHandler } = require('../../middleware/errorHandler');

const INACTIVE_USER_EMAIL = `inactive.${Date.now()}@daystar.test`;

async function login(email, password = 'password123') {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  expect(res.status).toBe(200);
  return res.body.token;
}

describe('Auth middleware verification', () => {
  let managerToken;
  let babysitterToken;
  let inactiveToken;
  let inactiveUserId;

  beforeAll(async () => {
    managerToken = await login('manager@daystar.ug');
    babysitterToken = await login('grace@daystar.ug');

    const rows = await db('users')
      .insert({
        email: INACTIVE_USER_EMAIL,
        password_hash: 'testhash',
        role: 'babysitter',
        babysitter_id: null,
        is_active: false,
      })
      .returning('id');

    inactiveUserId = rows[0]?.id || rows[0];
    inactiveToken = jwt.sign({ userId: inactiveUserId }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  afterAll(async () => {
    await db('users').where('email', INACTIVE_USER_EMAIL).del();
  });

  test('missing token flows through global error handler', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: 'Access denied. No token provided.',
    });
  });

  test('invalid token flows through global error handler', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: 'Invalid token.',
    });
  });

  test('expired token flows through global error handler', async () => {
    const expiredToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, {
      expiresIn: '-1s',
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: 'Token expired. Please log in again.',
    });
  });

  test('missing user flows through global error handler', async () => {
    const token = jwt.sign({ userId: 999999999 }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: 'User not found.',
    });
  });

  test('inactive user flows through global error handler', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${inactiveToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: 'Account is deactivated.',
    });
  });

  test('rejects tokens with unsupported algorithm in header (algorithm confusion attack)', async () => {
    // This test confirms middleware strictly enforces HS256 only.
    // We create a valid HS256 token, then manipulate its header to claim RS256.
    // The middleware will reject it because jwt.verify with algorithms: ['HS256']
    // will fail when the token header claims a different algorithm.
    const payload = { userId: 1 };
    const validToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Split token and modify header to claim RS256
    const [header, payload_b64, signature] = validToken.split('.');
    const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString());
    decodedHeader.alg = 'RS256';
    const fakeHeader = Buffer.from(JSON.stringify(decodedHeader)).toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const manipulatedToken = `${fakeHeader}.${payload_b64}.${signature}`;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${manipulatedToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: 'Invalid token.',
    });
  });

  test('rejects tokens with alg=none (signature bypass attack)', async () => {
    // Create a token with alg: 'none' to simulate signature bypass
    const noneAlgToken = jwt.sign({ userId: 1 }, '', {
      algorithm: 'none',
      expiresIn: '1h',
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${noneAlgToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: 'Invalid token.',
    });
  });

  test('requireManager route denies babysitter users with 403', async () => {
    const res = await request(app)
      .get('/api/babysitters')
      .set('Authorization', `Bearer ${babysitterToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      success: false,
      message: 'Access denied. Manager role required.',
    });
  });

  describe('requireBabysitter route-level behavior', () => {
    let testApp;

    beforeAll(() => {
      testApp = express();
      testApp.get('/test-babysitter', requireAuth, requireBabysitter, (req, res) => {
        res.json({ success: true, email: req.user.email });
      });
      testApp.use(errorHandler);
    });

    test('denies a manager on babysitter-only route with 403', async () => {
      const res = await request(testApp)
        .get('/test-babysitter')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        success: false,
        message: 'Access denied. Babysitter role required.',
      });
    });

    test('allows a babysitter on babysitter-only route', async () => {
      const res = await request(testApp)
        .get('/test-babysitter')
        .set('Authorization', `Bearer ${babysitterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.email).toBe('grace@daystar.ug');
    });
  });
});
