import { RegisterUser } from '../RegisterUser';

describe('RegisterUser usecase', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('uses injected repository when provided', async () => {
    const mockRepo = { create: jest.fn().mockResolvedValue({ id: 'u1' }) };
    const res = await RegisterUser('Max','Robinson','max@example.com','secret123', mockRepo);
    expect(mockRepo.create).toHaveBeenCalledWith({ firstName: 'Max', lastName: 'Robinson', email: 'max@example.com', password: 'secret123' });
    expect(res).toEqual({ id: 'u1' });
  });

  test('throws when missing names', async () => {
    await expect(RegisterUser('','', 'a@b.com', 'pass')).rejects.toThrow('Nom et prénom requis');
  });

  test('fallback to fetch when no repo', async () => {
    const fakeResponse = { ok: true, json: async () => ({ id: 'u2' }) };
    global.fetch = jest.fn().mockResolvedValue(fakeResponse);
    const res = await RegisterUser('A','B','a@b.com','secret');
    expect(global.fetch).toHaveBeenCalled();
    expect(res).toEqual({ id: 'u2' });
  });
});
