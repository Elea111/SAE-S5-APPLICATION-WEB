import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './Bookings.css';

const Bookings = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    // Récupérer bookingId depuis query params
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('booking');

    if (!bookingId) {
      setError('ID réservation manquant');
      setLoading(false);
      return;
    }

    // Charger les détails de la réservation
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    
    fetch(`${API_BASE}/api/bookings/${bookingId}`, {
      headers: auth.token ? { 'Authorization': `Bearer ${auth.token}` } : {}
    })
      .then(r => {
        if (!r.ok) throw new Error('Réservation non trouvée');
        return r.json();
      })
      .then(data => {
        console.log('✅ Réservation chargée:', data);
        setBooking(data);
      })
      .catch(err => {
        console.error('❌ Erreur:', err);
        setError('Réservation introuvable');
      })
      .finally(() => setLoading(false));
  }, [API_BASE]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="bookings-page">
          <div className="bookings-container">
            <p>⏳ Chargement...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="bookings-page">
          <div className="bookings-container">
            <p className="error">❌ {error}</p>
            <button onClick={() => window.location.href = '/'}>← Retour à l'accueil</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bookings-page">
        <div className="bookings-container">
          {/* ✅ ICÔNE DE SUCCÈS */}
          <div className="success-icon">✓</div>

          {/* ✅ TITRE */}
          <h1 className="success-title">Paiement réussi !</h1>
          <p className="success-subtitle">Votre réservation a été confirmée</p>

          {/* ✅ DÉTAILS DE LA RÉSERVATION */}
          {booking ? (
            <div className="booking-details">
              <h2>Détails de votre réservation</h2>
              
              <div className="detail-row">
                <span className="label">📅 Dates</span>
                <span className="value">
                  {new Date(booking.start_date).toLocaleDateString('fr-FR')} 
                  {' → '} 
                  {new Date(booking.end_date).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">💰 Montant total</span>
                <span className="value">{booking.total_price || booking.totalPrice}€</span>
              </div>

              <div className="detail-row">
                <span className="label">📊 Statut</span>
                <span className={`value status-${booking.status || 'pending'}`}>
                  {booking.status === 'confirmed' ? '✅ Confirmée' : 
                   booking.status === 'pending' ? '⏳ En attente' : 
                   booking.status || 'En cours'}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">📅 Créée le</span>
                <span className="value">
                  {new Date(booking.created_at).toLocaleDateString('fr-FR')} à {new Date(booking.created_at).toLocaleTimeString('fr-FR')}
                </span>
              </div>

              {/* ✅ PROCHAINES ÉTAPES */}
              <div className="next-steps">
                <h3>Prochaines étapes</h3>
                <ol className="steps-list">
                  <li>
                    <span className="step-number">1</span>
                    <div className="step-content">
                      <strong>Confirmez la prise en charge</strong>
                      <p>Vous verrez bientôt les coordonnées du propriétaire pour organiser la récupération</p>
                    </div>
                  </li>
                  <li>
                    <span className="step-number">2</span>
                    <div className="step-content">
                      <strong>Rendez-vous pour récupérer l'outil</strong>
                      <p>Contactez le propriétaire via la messagerie pour convenir d'un rendez-vous</p>
                    </div>
                  </li>
                  <li>
                    <span className="step-number">3</span>
                    <div className="step-content">
                      <strong>Utilisez l'outil</strong>
                      <p>Profitez de votre location pendant la période convenue</p>
                    </div>
                  </li>
                  <li>
                    <span className="step-number">4</span>
                    <div className="step-content">
                      <strong>Rendez l'outil</strong>
                      <p>Retournez l'outil dans le même état à la date prévue</p>
                    </div>
                  </li>
                  <li>
                    <span className="step-number">5</span>
                    <div className="step-content">
                      <strong>Notez votre expérience</strong>
                      <p>Laissez un avis sur le propriétaire et l'outil</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="generic-message">
              <p>Merci pour votre achat ! Un email de confirmation a été envoyé à votre adresse.</p>
            </div>
          )}

          {/* ✅ ACTIONS */}
          <div className="success-actions">
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/'}
            >
              Retour à l'accueil
            </button>
            
            <button 
              className="btn-outline"
              onClick={() => window.location.href = '/profil'}
            >
              Voir mes réservations
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Bookings;
