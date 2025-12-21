import { PublishEquipment } from '../PublishEquipment';

describe('PublishEquipment usecase', () => {
  afterEach(() => jest.restoreAllMocks());

  test('uses repository when provided', async () => {
    const equipment = { ownerId: 'o1', title: 'Perceuse' };
    const mockRepo = { create: jest.fn().mockResolvedValue({ id: 'e1' }) };
    const res = await PublishEquipment(equipment, mockRepo);
    expect(mockRepo.create).toHaveBeenCalledWith(equipment);
    expect(res).toEqual({ id: 'e1' });
  });

  test('throws on invalid data', async () => {
    await expect(PublishEquipment(null)).rejects.toThrow("Données d'équipement invalides");
  });

  test('fallback fetch path', async () => {
    const equipment = { ownerId: 'o2', title: 'Scie' };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'e2' }) });
    const res = await PublishEquipment(equipment);
    expect(global.fetch).toHaveBeenCalled();
    expect(res).toEqual({ id: 'e2' });
  });
});
