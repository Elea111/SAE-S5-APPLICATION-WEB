import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Connexion from '../../pages/connexion/Connexion';

describe('Connexion component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  test('logs in and stores token and redirects', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'token-rtl-1', user: { id: 'user-rtl-1', email: 'a@b.com' } }),
    });

    render(<Connexion />);

    fireEvent.change(screen.getByPlaceholderText('m@example.com'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });

    fireEvent.click(screen.getByText('Se connecter'));

    await waitFor(() => {
      const authRaw = localStorage.getItem('auth');
      expect(authRaw).toBeTruthy();
      const auth = JSON.parse(authRaw);
      expect(auth.token).toBe('token-rtl-1');
      expect(window.location.href).toBe('/profil');
    });
  });
});
