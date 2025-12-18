import { LeaveReview } from '../LeaveReview';

describe('LeaveReview usecase', () => {
  afterEach(() => jest.restoreAllMocks());

  test('throws on incomplete review data', async () => {
    await expect(LeaveReview({})).rejects.toThrow("Données d'avis incomplètes");
  });

  test('validates rating range', async () => {
    await expect(LeaveReview({ authorId: 'a', targetId: 't', rating: 6 })).rejects.toThrow('Rating doit être un entier entre 1 et 5');
  });

  test('uses repository when provided', async () => {
    const review = { authorId: 'a1', targetId: 't1', rating: 5 };
    const mockRepo = { create: jest.fn().mockResolvedValue({ id: 'r1' }) };
    const res = await LeaveReview(review, mockRepo);
    expect(mockRepo.create).toHaveBeenCalledWith(review);
    expect(res).toEqual({ id: 'r1' });
  });

  test('fallback fetch path', async () => {
    const review = { authorId: 'a2', targetId: 't2', rating: 4 };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'r2' }) });
    const res = await LeaveReview(review);
    expect(global.fetch).toHaveBeenCalled();
    expect(res).toEqual({ id: 'r2' });
  });
});
