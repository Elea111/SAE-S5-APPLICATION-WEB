import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Inscription from '../../pages/inscription/Inscription';

describe('Inscription component', () => {
  beforeEach(() => {
    // ensure location writable
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  test('submits form, stores auth and redirects', async () => {
    // mock RegisterUser / fetch fallback
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'user-rtl-1' }),
    });

    render(<Inscription />);

    fireEvent.change(screen.getByPlaceholderText('Max'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Robinson'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('m@example.com'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

    // submit
    fireEvent.click(screen.getByText('Créer un compte'));

    await waitFor(() => {
      const authRaw = localStorage.getItem('auth');
      expect(authRaw).toBeTruthy();
      const auth = JSON.parse(authRaw);
      expect(auth.userId).toBe('user-rtl-1');
      expect(window.location.href).toBe('/profil');
    });
  });
});
