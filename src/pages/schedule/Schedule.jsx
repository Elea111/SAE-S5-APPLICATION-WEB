import React, { useEffect, useState } from 'react';
import './Schedule.css';

const parseQuery = () => {
  const q = new URLSearchParams(window.location.search);
  return { equipmentId: q.get('equipmentId') };
};

const Schedule = () => {
  const { equipmentId } = parseQuery();
  const [equipment, setEquipment] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!equipmentId) return;
    fetch(`/api/equipments/${equipmentId}`)
      .then(r => r.json())
      .then(setEquipment)
      .catch(() => setEquipment(null));
  }, [equipmentId]);

  useEffect(() => {
    if (!startDate || !endDate || !equipment) { setTotal(0); return; }
    const s = new Date(startDate);
    const e = new Date(endDate);
    const days = Math.ceil((e - s) / (1000*60*60*24));
    if (days <= 0) { setTotal(0); return; }
    const price = Number(equipment.dailyPrice || equipment.daily_price || equipment.dailyPrice?.amount || equipment.daily_price?.amount || 0);
    setTotal(days * price);
  }, [startDate, endDate, equipment]);

  const handleReserve = async () => {
    setMessage('');
    const authRaw = localStorage.getItem('auth');
    if (!authRaw) { setMessage('Connectez-vous pour réserver (mock).'); return; }
    const auth = JSON.parse(authRaw);
    if (!auth.userId) { setMessage('Identifiant utilisateur manquant.'); return; }
    // create booking
    try {
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId,
          userId: auth.userId,
          startDate,
          endDate,
          totalAmount: total
        })
      });
      const booking = await bookingRes.json();
      // process payment (mock)
      const payRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          userId: auth.userId,
          amount: total,
          currency: 'EUR'
        })
      });
      const payment = await payRes.json();
      setMessage(`Réservation et paiement simulés (payment id: ${payment.id})`);
    } catch (e) {
      setMessage('Erreur lors de la réservation (mock)');
    }
  };

  if (!equipmentId) return <div className="schedule-page"><p>Équipement non spécifié.</p></div>;
  if (!equipment) return <div className="schedule-page"><p>Chargement équipement...</p></div>;

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        <h2>Programmer la location : {equipment.title || equipment.name}</h2>
        <div className="date-row">
          <label>Début
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </label>
          <label>Fin
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </label>
        </div>
        <div className="summary">
          <p>Prix total estimé: <strong>{total} €</strong></p>
        </div>
        <button className="btn-primary" onClick={handleReserve}>Réserver et payer (mock)</button>
        {message && <p className="info">{message}</p>}
      </div>
    </div>
  );
};

export default Schedule;
