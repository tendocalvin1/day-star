// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../app');
const redis = require('../../config/redis');

beforeEach(async () => {
  // Clear mock Redis before each test
  await redis.flushall();
});

describe('POST /api/auth/login', () => {
  test('returns token for valid credentials and sets HttpOnly refresh cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('manager');

    // Verify cookies
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const hasRefreshToken = cookies.some((c) => c.includes('refreshToken='));
    expect(hasRefreshToken).toBe(true);
    const isHttpOnly = cookies.some((c) => c.includes('HttpOnly'));
    expect(isHttpOnly).toBe(true);
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

describe('POST /api/auth/refresh', () => {
  test('successfully rotates refresh and access tokens', async () => {
    // 1. Login to get a valid refresh token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'password123' });

    const cookies = loginRes.headers['set-cookie'];
    const refreshTokenCookie = cookies.find((c) => c.startsWith('refreshToken='));
    const oldRefreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

    // Verify it is in Redis
    const userIdInRedis = await redis.get(`refresh_token:${oldRefreshToken}`);
    expect(userIdInRedis).not.toBeNull();

    // 2. Call /refresh with the cookie
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [refreshTokenCookie]);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.token).toBeDefined();

    // Check that new refresh token is set
    const refreshCookies = refreshRes.headers['set-cookie'];
    expect(refreshCookies).toBeDefined();
    const newRefreshTokenCookie = refreshCookies.find((c) => c.startsWith('refreshToken='));
    const newRefreshToken = newRefreshTokenCookie.split(';')[0].split('=')[1];

    expect(newRefreshToken).not.toBe(oldRefreshToken);

    // Verify old is deleted and new exists in Redis
    const oldInRedis = await redis.get(`refresh_token:${oldRefreshToken}`);
    expect(oldInRedis).toBeNull();
    const newInRedis = await redis.get(`refresh_token:${newRefreshToken}`);
    expect(parseInt(newInRedis, 10)).toBe(parseInt(userIdInRedis, 10));
  });

  test('rejects expired/revoked refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', ['refreshToken=invalidtoken123']);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/logout', () => {
  test('revokes refresh token and clears cookie', async () => {
    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'password123' });

    const cookies = loginRes.headers['set-cookie'];
    const refreshTokenCookie = cookies.find((c) => c.startsWith('refreshToken='));
    const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

    // Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [refreshTokenCookie]);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Check that cookie was cleared (refreshToken value is empty or deleted)
    const logoutCookies = logoutRes.headers['set-cookie'];
    expect(logoutCookies).toBeDefined();
    const hasClearedCookie = logoutCookies.some((c) => c.includes('refreshToken=;'));
    expect(hasClearedCookie).toBe(true);

    // Verify deleted from Redis
    const tokenInRedis = await redis.get(`refresh_token:${refreshToken}`);
    expect(tokenInRedis).toBeNull();
  });
});

describe('PUT /api/auth/change-password', () => {
  test('revokes all active refresh tokens for the user upon password change', async () => {
    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'password123' });

    const token = loginRes.body.token;
    const cookies = loginRes.headers['set-cookie'];
    const refreshTokenCookie = cookies.find((c) => c.startsWith('refreshToken='));
    const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

    // Verify token exists in Redis
    let tokenInRedis = await redis.get(`refresh_token:${refreshToken}`);
    expect(tokenInRedis).not.toBeNull();

    // Change password
    const changeRes = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_password: 'password123',
        new_password: 'newpassword123',
      });

    expect(changeRes.status).toBe(200);
    expect(changeRes.body.success).toBe(true);

    // Verify token is revoked in Redis
    tokenInRedis = await redis.get(`refresh_token:${refreshToken}`);
    expect(tokenInRedis).toBeNull();

    // Reset password back to password123
    const loginRes2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'newpassword123' });

    const token2 = loginRes2.body.token;
    const resetRes = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        current_password: 'newpassword123',
        new_password: 'password123',
      });
    expect(resetRes.status).toBe(200);
  });
});