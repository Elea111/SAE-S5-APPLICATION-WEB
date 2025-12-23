import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Schedule from '../../pages/schedule/Schedule';

describe('Schedule component', () => {
  const equipment = { id: 'eq-1', title: 'Test Tool', dailyPrice: 10 };

  beforeEach(() => {
    // set query param
    delete window.location;
    window.location = { search: '?equipmentId=eq-1' };
    // auth in localStorage
    localStorage.setItem('auth', JSON.stringify({ userId: 'user-rtl-1' }));

    let call = 0;
    global.fetch = jest.fn().mockImplementation((url, opts) => {
      call++;
      if (url.includes('/api/equipments')) {
        return Promise.resolve({ ok: true, json: async () => equipment });
      }
      if (url.includes('/api/bookings')) {
        return Promise.resolve({ ok: true, json: async () => ({ id: 'b-1' }) });
      }
      if (url.includes('/api/payments')) {
        return Promise.resolve({ ok: true, json: async () => ({ id: 'p-1' }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  test('select dates and reserve -> booking + payment (mock)', async () => {
    render(<Schedule />);

    // wait equipment loaded
    await waitFor(() => expect(screen.getByText(/Programmer la location/i)).toBeInTheDocument());

    const startInput = screen.getByLabelText(/Début/i);
    const endInput = screen.getByLabelText(/Fin/i);

    // choose dates (ISO format YYYY-MM-DD)
    const today = new Date();
    const tomorrow = new Date(Date.now() + 24*3600*1000);
    const dd = (d) => d.toISOString().slice(0,10);

    fireEvent.change(startInput, { target: { value: dd(today) } });
    fireEvent.change(endInput, { target: { value: dd(tomorrow) } });

    fireEvent.click(screen.getByText('Réserver et payer (mock)'));

    await waitFor(() => {
      expect(screen.getByText(/Réservation et paiement simulés/)).toBeInTheDocument();
    });
  });
});
