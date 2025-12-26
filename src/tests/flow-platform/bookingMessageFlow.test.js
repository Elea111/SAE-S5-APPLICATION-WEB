import request from 'supertest';
import app from '../../server/index.js';

describe('Platform flow (equipment → booking → payment → messages) - mock', () => {
  let user;
  let equipment;
  let booking;
  let payment;

  const userPayload = {
    firstName: 'Flow',
    lastName: 'Platform',
    email: 'flow.platform@example.com',
    password: 'password123',
    isPro: true
  };

  test('create user and publish equipment', async () => {
    const reg = await request(app).post('/api/register').send(userPayload);
    expect(reg.status).toBe(201);
    user = reg.body;

    const eqRes = await request(app).post('/api/equipments').send({
      ownerId: user.id,
      title: 'Flow Drill',
      description: 'Test drill',
      dailyPrice: 15
    });
    expect(eqRes.status).toBe(201);
    equipment = eqRes.body;
  });

  test('get equipment details', async () => {
    const res = await request(app).get(`/api/equipments/${equipment.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Flow Drill');
  });

  test('create booking and process payment (mock stripe)', async () => {
    const bookingRes = await request(app).post('/api/bookings').send({
      equipmentId: equipment.id,
      userId: user.id,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      totalAmount: 30
    });
    expect(bookingRes.status).toBe(201);
    booking = bookingRes.body;

    const payRes = await request(app).post('/api/payments').send({
      bookingId: booking.id,
      userId: user.id,
      amount: 30,
      currency: 'EUR'
    });
    expect(payRes.status).toBe(201);
    payment = payRes.body;
    expect(payment.id).toBeDefined();
  });

  test('send and list messages between users', async () => {
    const msg = await request(app).post('/api/messages').send({
      senderId: user.id,
      receiverId: user.id,
      content: 'Test message flow'
    });
    expect(msg.status).toBe(201);
    const list = await request(app).get('/api/messages').query({ userA: user.id, userB: user.id });
    expect(list.status).toBe(200);
    const found = list.body.find(m => m.content === 'Test message flow');
    expect(found).toBeTruthy();
  });
});
