import { LoginUser } from '../LoginUser';

describe('LoginUser usecase', () => {
  afterEach(() => jest.restoreAllMocks());

  test('uses injected repository when provided', async () => {
    const mockRepo = { findByCredentials: jest.fn().mockResolvedValue({ token: 't1' }) };
    const res = await LoginUser('me@x.com', 'pwd123', mockRepo);
    expect(mockRepo.findByCredentials).toHaveBeenCalledWith('me@x.com', 'pwd123');
    expect(res).toEqual({ token: 't1' });
  });

  test('throws on missing credentials', async () => {
    await expect(LoginUser('', '')).rejects.toThrow('Email et mot de passe requis');
  });

  test('fallback to fetch when no repo', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'abc' }) });
    const res = await LoginUser('u@x', 'pwd');
    expect(global.fetch).toHaveBeenCalled();
    expect(res).toEqual({ token: 'abc' });
  });
});
