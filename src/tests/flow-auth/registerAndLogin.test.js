import request from 'supertest';
import app from '../../server/index.js';

describe('Auth flow (register + login) - mock server', () => {
  const userPayload = {
    firstName: 'Flow',
    lastName: 'Tester',
    email: 'flow.tester@example.com',
    password: 'password123',
    isPro: false
  };

  test('registers a new user', async () => {
    const res = await request(app).post('/api/register').send(userPayload);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toBe(userPayload.email);
  });

  test('logs in with created user', async () => {
    const res = await request(app).post('/api/login').send({
      email: userPayload.email,
      password: userPayload.password
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(userPayload.email);
  });
});
