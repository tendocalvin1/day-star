const request = require('supertest');
const app = require('../../app');

describe('Incidents API', () => {
  let managerToken;
  let babysitterToken;

  beforeAll(async () => {
    const managerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@daystar.ug', password: 'password123' });

    managerToken = managerRes.body.token;

    const unique = Date.now().toString().slice(-8);
    const createBabysitterRes = await request(app)
      .post('/api/babysitters')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        first_name: 'Incident',
        last_name: 'Fixture',
        phone: `072${unique.slice(0, 7)}`,
        nin: `INC${unique}`,
        date_of_birth: '1998-05-14',
        skills: ['first aid'],
        availability: ['weekdays'],
        years_experience: 4,
        location: 'Kampala',
        next_of_kin_name: 'Fixture Kin',
        next_of_kin_phone: '0701234666',
        create_account: true,
        account_email: `incident.${unique}@daystar.test`,
        account_password: 'password123',
      });

    expect(createBabysitterRes.status).toBe(201);

    const babysitterRes = await request(app)
      .post('/api/auth/login')
      .send({ email: `incident.${unique}@daystar.test`, password: 'password123' });

    expect(babysitterRes.status).toBe(200);
    babysitterToken = babysitterRes.body.token;
  });

  test('rejects invalid incident query filters', async () => {
    const res = await request(app)
      .get('/api/incidents?is_resolved=maybe')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('lets babysitter create and manager resolve an incident', async () => {
    const createRes = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${babysitterToken}`)
      .send({
        child_id: 1,
        description: 'Child scraped a knee during outdoor play and received first aid.',
        severity: 'low',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);

    const resolveRes = await request(app)
      .put(`/api/incidents/${createRes.body.data.id}/resolve`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ resolution_notes: 'Parent notified and child monitored for the rest of the day.' });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.success).toBe(true);
    expect(resolveRes.body.data.is_resolved).toBe(true);
  });

  test('rejects invalid incident id before querying database', async () => {
    const res = await request(app)
      .put('/api/incidents/not-a-number/resolve')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ resolution_notes: 'This should not reach the controller.' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});
