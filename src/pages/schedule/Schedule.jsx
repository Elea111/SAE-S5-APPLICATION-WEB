import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
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
  const [loading, setLoading] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    if (!equipmentId) return;
    fetch(`${API_BASE}/api/equipments/${equipmentId}`)
      .then(r => r.json())
      .then(setEquipment)
      .catch(() => {
        setMessage('❌ Impossible de charger l\'équipement');
        setEquipment(null);
      });
  }, [equipmentId, API_BASE]);

  useEffect(() => {
    if (!startDate || !endDate || !equipment) { setTotal(0); return; }
    const s = new Date(startDate);
    const e = new Date(endDate);
    const days = Math.ceil((e - s) / (1000*60*60*24));
    if (days <= 0) { setTotal(0); return; }
    const price = Number(equipment.daily_price || equipment.dailyPrice || 0);
    setTotal(days * price);
  }, [startDate, endDate, equipment]);

  const handleReserve = async () => {
    setMessage('');
    setLoading(true);
    
    const authRaw = localStorage.getItem('auth');
    if (!authRaw) { 
      setMessage('❌ Connectez-vous pour réserver.');
      setLoading(false);
      return; 
    }
    
    const auth = JSON.parse(authRaw);
    if (!auth.token) { 
      setMessage('❌ Token d\'authentification manquant.');
      setLoading(false);
      return; 
    }
    
    // Valider les dates
    if (!startDate || !endDate) {
      setMessage('❌ Veuillez sélectionner les dates.');
      setLoading(false);
      return;
    }

    try {
      // Créer la réservation
      console.log('📅 Création de la réservation...');
      const bookingRes = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          item_id: equipmentId,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString()
        })
      });
      
      if (!bookingRes.ok) {
        const errorData = await bookingRes.json();
        throw new Error(errorData.message || 'Erreur création réservation');
      }
      
      const booking = await bookingRes.json();
      console.log('✅ Réservation créée:', booking);
      
      // Rediriger vers la page de paiement
      window.location.href = `/paiement?bookingId=${booking.id}`;
    } catch (e) {
      console.error('❌ Erreur:', e);
      setMessage(`❌ ${e.message || 'Erreur lors de la réservation'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!equipmentId) return <div className="schedule-page"><p>Équipement non spécifié.</p></div>;
  if (!equipment) return <div className="schedule-page"><p>Chargement équipement...</p></div>;

  return (
    <>
      <Header />
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
        <button 
          className="btn-primary" 
          onClick={handleReserve}
          disabled={loading || !startDate || !endDate}
        >
          {loading ? '⏳ Réservation en cours...' : '📅 Réserver et payer'}
        </button>
        {message && <p className={`info ${message.includes('❌') ? 'error' : 'success'}`}>{message}</p>}
      </div>
    </div>
      <Footer />
    </>
  );
};

export default Schedule;
