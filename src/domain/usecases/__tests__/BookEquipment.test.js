import { BookEquipment } from '../BookEquipment';

describe('BookEquipment usecase', () => {
  afterEach(() => jest.restoreAllMocks());

  test('throws on incomplete booking data', async () => {
    await expect(BookEquipment({})).rejects.toThrow('Données de réservation incomplètes');
  });

  test('uses repository when provided', async () => {
    const booking = { equipmentId: 'eq1', userId: 'u1', startDate: '2025-01-01', endDate: '2025-01-03' };
    const mockRepo = { create: jest.fn().mockResolvedValue({ id: 'b1' }) };
    const res = await BookEquipment(booking, mockRepo);
    expect(mockRepo.create).toHaveBeenCalledWith(booking);
    expect(res).toEqual({ id: 'b1' });
  });

  test('fallback fetch path', async () => {
    const booking = { equipmentId: 'eq2', userId: 'u2', startDate: '2025-02-01', endDate: '2025-02-04' };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'b2' }) });
    const res = await BookEquipment(booking);
    expect(global.fetch).toHaveBeenCalled();
    expect(res).toEqual({ id: 'b2' });
  });
});
