const request = require('supertest');
const app = require('../../app');

async function login(email, password = 'password123') {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  expect(res.status).toBe(200);
  return {
    token: res.body.token,
    user: res.body.user,
  };
}

describe('RBAC matrix', () => {
  let manager;
  let babysitter;

  beforeAll(async () => {
    manager = await login('manager@daystar.ug');

    const unique = Date.now().toString().slice(-8);
    const createRes = await request(app)
      .post('/api/babysitters')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({
        first_name: 'Rbac',
        last_name: 'Fixture',
        phone: `076${unique.slice(0, 7)}`,
        nin: `RBAC${unique}`,
        date_of_birth: '1998-05-14',
        skills: ['first aid'],
        availability: ['weekdays'],
        years_experience: 4,
        location: 'Kampala',
        next_of_kin_name: 'RBAC Kin',
        next_of_kin_phone: '0701234777',
        create_account: true,
        account_email: `rbac.${unique}@daystar.test`,
        account_password: 'password123',
      });

    expect(createRes.status).toBe(201);
    babysitter = await login(`rbac.${unique}@daystar.test`);
  });

  test.each([
    ['GET', '/api/dashboard/today'],
    ['GET', '/api/babysitters'],
    ['GET', '/api/income'],
    ['GET', '/api/incidents'],
    ['GET', '/api/attendance'],
  ])('rejects unauthenticated %s %s', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test.each([
    ['GET', '/api/dashboard/today'],
    ['GET', '/api/babysitters'],
    ['GET', '/api/income'],
    ['GET', '/api/expenses'],
    ['GET', '/api/budgets'],
    ['GET', '/api/babysitter-payments'],
  ])('allows manager access to manager-only %s %s', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path)
      .set('Authorization', `Bearer ${manager.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test.each([
    ['GET', '/api/dashboard/today'],
    ['GET', '/api/babysitters'],
    ['GET', '/api/income'],
    ['GET', '/api/expenses'],
    ['GET', '/api/budgets'],
    ['GET', '/api/babysitter-payments'],
  ])('forbids babysitter access to manager-only %s %s', async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path)
      .set('Authorization', `Bearer ${babysitter.token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('forbids babysitter from creating babysitter profiles', async () => {
    const unique = Date.now().toString().slice(-8);
    const res = await request(app)
      .post('/api/babysitters')
      .set('Authorization', `Bearer ${babysitter.token}`)
      .send({
        first_name: 'Forbidden',
        last_name: 'Create',
        phone: `077${unique.slice(0, 7)}`,
        nin: `FORBID${unique}`,
        date_of_birth: '1998-05-14',
        next_of_kin_name: 'Forbidden Kin',
        next_of_kin_phone: '0701234000',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test.each([
    ['GET', '/api/attendance'],
    ['GET', '/api/attendance/summary'],
    ['GET', '/api/notifications'],
  ])('allows both roles to access shared operational route %s %s', async (method, path) => {
    const managerRes = await request(app)[method.toLowerCase()](path)
      .set('Authorization', `Bearer ${manager.token}`);

    const babysitterRes = await request(app)[method.toLowerCase()](path)
      .set('Authorization', `Bearer ${babysitter.token}`);

    expect(managerRes.status).toBe(200);
    expect(managerRes.body.success).toBe(true);
    expect(babysitterRes.status).toBe(200);
    expect(babysitterRes.body.success).toBe(true);
  });

  test('enforces incident role boundaries', async () => {
    const managerCreateRes = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${manager.token}`)
      .send({
        child_id: 1,
        description: 'Manager should not file a babysitter incident report.',
        severity: 'low',
      });

    expect(managerCreateRes.status).toBe(403);

    const createRes = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${babysitter.token}`)
      .send({
        child_id: 1,
        description: 'Child scraped a knee during supervised outdoor play.',
        severity: 'low',
      });

    expect(createRes.status).toBe(201);

    const babysitterResolveRes = await request(app)
      .put(`/api/incidents/${createRes.body.data.id}/resolve`)
      .set('Authorization', `Bearer ${babysitter.token}`)
      .send({ resolution_notes: 'This should be manager-only.' });

    expect(babysitterResolveRes.status).toBe(403);

    const babysitterListRes = await request(app)
      .get('/api/incidents')
      .set('Authorization', `Bearer ${babysitter.token}`);

    expect(babysitterListRes.status).toBe(200);
    expect(babysitterListRes.body.data.length).toBeGreaterThan(0);
    expect(
      babysitterListRes.body.data.every((incident) => incident.babysitter_id === babysitter.user.babysitter_id)
    ).toBe(true);
  });
});
