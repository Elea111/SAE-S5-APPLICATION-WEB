import React, { useEffect, useState } from 'react';
import './Reservation.css';

const Reservation = () => {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: ''
  });

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    // Récupérer l'ID de l'équipement depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const equipmentId = params.get('equipmentId');

    if (!equipmentId) {
      setError('ID équipement manquant');
      setLoading(false);
      return;
    }

    // Charger les détails de l'équipement
    fetch(`${API_BASE}/api/equipments/${equipmentId}`)
      .then(r => {
        if (!r.ok) throw new Error('Équipement non trouvé');
        return r.json();
      })
      .then(data => {
        console.log('✅ Équipement chargé:', data);
        setEquipment(data);
      })
      .catch(err => {
        console.error('❌ Erreur:', err);
        setError('Équipement introuvable');
      })
      .finally(() => setLoading(false));
  }, [API_BASE]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.token) {
      window.location.href = '/connexion';
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      setError('Veuillez sélectionner les dates');
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          item_id: equipment.id,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString()
        })
      });

      const data = await res.json();

      if (res.ok) {
        console.log('✅ Réservation créée:', data);
        // Rediriger vers la page de paiement
        window.location.href = `/paiement?bookingId=${data.id}`;
      } else {
        setError(data.message || 'Erreur lors de la réservation');
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Erreur de connexion');
    }
  };

  if (loading) {
    return (
      <div className="reservation-page">
        <div className="reservation-container">
          <p>⏳ Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reservation-page">
        <div className="reservation-container">
          <p className="error">❌ {error}</p>
          <button onClick={() => window.location.href = '/search'}>← Retour</button>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="reservation-page">
        <div className="reservation-container">
          <p>Équipement non trouvé</p>
        </div>
      </div>
    );
  }

  // Calculer le nombre de jours et le montant
  const startDate = formData.start_date ? new Date(formData.start_date) : null;
  const endDate = formData.end_date ? new Date(formData.end_date) : null;
  const days = startDate && endDate ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = days * (equipment.daily_price || 0);

  return (
    <div className="reservation-page">
      <div className="reservation-container">
        <h1>📅 Réserver cet équipement</h1>

        <div className="reservation-content">
          {/* Détails équipement */}
          <div className="equipment-summary">
            <img 
              src={equipment.image || '/default-tool.jpg'} 
              alt={equipment.title}
              className="summary-image"
            />
            <div className="summary-info">
              <h2>{equipment.title}</h2>
              <p className="summary-price">
                <strong>{equipment.daily_price}€</strong> / jour
              </p>
              <p className="summary-location">📍 {equipment.location}</p>
            </div>
          </div>

          <hr />

          {/* Formulaire réservation */}
          <form onSubmit={handleSubmit} className="reservation-form">
            <h3>Sélectionnez vos dates</h3>

            <div className="form-group">
              <label>Date de début *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Date de fin *</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Résumé prix */}
            {days > 0 && (
              <div className="price-summary">
                <div className="price-line">
                  <span>{days} jour(s) × {equipment.daily_price}€</span>
                  <span>{totalPrice}€</span>
                </div>
                {equipment.caution_deposit && (
                  <div className="price-line">
                    <span>Caution</span>
                    <span>{equipment.caution_deposit}€</span>
                  </div>
                )}
                <div className="price-line total">
                  <span>Total</span>
                  <span>{totalPrice + (equipment.caution_deposit || 0)}€</span>
                </div>
              </div>
            )}

            {error && <p className="error">{error}</p>}

            <button type="submit" className="btn-primary">
              ✓ Réserver et payer
            </button>
            <button 
              type="button" 
              className="btn-outline"
              onClick={() => window.location.href = '/search'}
            >
              ← Retour
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reservation;