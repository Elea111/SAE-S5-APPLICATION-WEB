import request from 'supertest';
import app from '../index.js';

describe('Integration flow (mock)', () => {
  let user, token, equipment;

  test('register user', async () => {
    const res = await request(app).post('/api/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      password: 'secret123',
      isPro: false
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    user = res.body;
  });

  test('login user', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'test.user@example.com',
      password: 'secret123'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('publish equipment', async () => {
    const res = await request(app).post('/api/equipments').send({
      ownerId: user.id,
      title: 'Test Perceuse',
      description: 'Une perceuse pour test',
      dailyPrice: 10
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    equipment = res.body;
  });

  test('get equipment detail', async () => {
    const res = await request(app).get(`/api/equipments/${equipment.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test Perceuse');
  });

  test('create booking and process payment', async () => {
    const bookingRes = await request(app).post('/api/bookings').send({
      equipmentId: equipment.id,
      userId: user.id,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 2*24*3600*1000).toISOString(),
      totalAmount: 20
    });
    expect(bookingRes.status).toBe(201);
    const booking = bookingRes.body;
    const payRes = await request(app).post('/api/payments').send({
      bookingId: booking.id,
      userId: user.id,
      amount: 20,
      currency: 'EUR'
    });
    expect(payRes.status).toBe(201);
    expect(payRes.body.id).toBeDefined();
  });

  test('send and list messages', async () => {
    const msgRes = await request(app).post('/api/messages').send({
      senderId: user.id,
      receiverId: user.id, // self conversation for simplicity
      content: 'Bonjour test'
    });
    expect(msgRes.status).toBe(201);
    const listRes = await request(app).get(`/api/messages`).query({ userA: user.id, userB: user.id });
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.find(m => m.content === 'Bonjour test')).toBeTruthy();
  });
});
