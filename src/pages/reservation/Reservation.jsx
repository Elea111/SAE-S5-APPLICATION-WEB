import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './Reservation.css';

const Reservation = () => {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    // Récupérer equipmentId depuis l'URL
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
    setError('');
  };

  // Calculer nombre de jours et prix
  const startDate = formData.start_date ? new Date(formData.start_date) : null;
  const endDate = formData.end_date ? new Date(formData.end_date) : null;
  const days = startDate && endDate 
    ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) 
    : 0;
  const totalPrice = days > 0 ? days * (equipment?.daily_price || 0) : 0;
  const totalWithCaution = totalPrice + (equipment?.caution_deposit || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Vérifier auth
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.token) {
      window.location.href = '/connexion';
      return;
    }

    // ✅ VÉRIFIER QUE CE N'EST PAS SON PROPRE ITEM
    if (equipment && equipment.user_id === (auth.userId || auth.id)) {
      setError('❌ Vous ne pouvez pas réserver votre propre équipement');
      return;
    }

    // Valider les dates
    if (!formData.start_date || !formData.end_date) {
      setError('Veuillez sélectionner les deux dates');
      return;
    }

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);

    if (end <= start) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysCount < 1) {
      setError('La location doit être d\'au moins 1 jour');
      return;
    }

    // Soumettre la réservation
    setSubmitting(true);
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          item_id: equipment.id,
          start_date: start.toISOString(),
          end_date: end.toISOString()
        })
      });

      const data = await res.json();

      if (res.ok) {
        console.log('✅ Réservation créée:', data);
        // Redirection vers paiement
        window.location.href = `/paiement?bookingId=${data.id}`;
      } else {
        setError(data.message || 'Erreur lors de la réservation');
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Erreur de connexion');
    } finally {
      setSubmitting(false);
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

  if (error && !equipment) {
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

  return (
    <>
      <Header />
      <div className="reservation-page">
        <div className="reservation-content">
        {/* Gauche : Détails équipement */}
        <div className="reservation-left">
          <img 
            src={equipment.image_url || equipment.image || '/default-tool.jpg'} 
            alt={equipment.title}
            className="reservation-image"
            onError={(e) => { e.target.src = '/default-tool.jpg'; }}
          />
          
          <h1 className="reservation-title">{equipment.title}</h1>
          
          <div className="provider-info">
            <span className="location">📍 {equipment.location}</span>
            <span className="rating">⭐ {equipment.rating || 'N/A'}</span>
            <span className="condition">🔧 État: {equipment.condition}</span>
          </div>

          {equipment.description && (
            <div className="description-section">
              <h3>Description</h3>
              <p>{equipment.description}</p>
            </div>
          )}
        </div>

        {/* Droite : Formulaire réservation */}
        <div className="reservation-card">
          <h2>Réservation</h2>
          <p className="price-label">
            <span className="prixinit">{equipment.daily_price}€</span> / jour
          </p>

          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="dates-selection">
              <h3>Sélectionnez vos dates</h3>
              
              <div className="dates">
                <label>Date de début *</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="dates">
                <label>Date de fin *</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Résumé prix */}
            {days > 0 && (
              <div className="pricing-section">
                <div className="price-line">
                  <span>{days} jour(s) × {equipment.daily_price}€</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
                {equipment.caution_deposit && (
                  <div className="price-line">
                    <span>Caution</span>
                    <span>{equipment.caution_deposit.toFixed(2)}€</span>
                  </div>
                )}
                <div className="price-line total">
                  <span>Total</span>
                  <span>{totalWithCaution.toFixed(2)}€</span>
                </div>
              </div>
            )}

            {/* Erreur */}
            {error && <p className="error">{error}</p>}

            {/* Boutons */}
            <button 
              type="submit" 
              className="reserve-btn"
              disabled={submitting || !equipment.is_available || (equipment && equipment.user_id === (JSON.parse(localStorage.getItem('auth') || '{}').userId || JSON.parse(localStorage.getItem('auth') || '{}').id))}
            >
              {submitting ? '⏳ Traitement...' : '✓ Réserver et payer'}
            </button>
            <button 
              type="button" 
              className="btn-outline"
              onClick={() => window.location.href = '/search'}
              disabled={submitting}
            >
              ← Retour
            </button>
          </form>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Reservation;