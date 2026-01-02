import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/header/Header.jsx';
import Footer from '../../components/layout/footer/Footer.jsx';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    // Récupérer les détails de la réservation depuis localStorage ou query params
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('booking_id');
    const sessionId = params.get('session_id');

    if (bookingId) {
      // Récupérer les détails depuis localStorage
      const saved = localStorage.getItem(`booking_${bookingId}`);
      if (saved) {
        setBookingDetails(JSON.parse(saved));
      }
    }

    // Nettoyer après un délai
    const timer = setTimeout(() => {
      localStorage.removeItem(`booking_${bookingId}`);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="payment-success-page">
      <Header />
      
      <main className="success-container">
        <div className="success-card">
          {/* ✅ ICÔNE DE SUCCÈS */}
          <div className="success-icon">✓</div>

          {/* ✅ TITRE */}
          <h1 className="success-title">Paiement réussi !</h1>
          <p className="success-subtitle">Votre réservation a été confirmée</p>

          {/* ✅ DÉTAILS */}
          {bookingDetails ? (
            <div className="booking-details">
              <h2>Détails de votre réservation</h2>
              
              <div className="detail-row">
                <span className="label">📦 Outil</span>
                <span className="value">{bookingDetails.equipmentTitle || 'Équipement'}</span>
              </div>

              <div className="detail-row">
                <span className="label">📅 Dates</span>
                <span className="value">
                  {new Date(bookingDetails.startDate).toLocaleDateString('fr-FR')} 
                  {' → '} 
                  {new Date(bookingDetails.endDate).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">💰 Montant</span>
                <span className="value">{bookingDetails.totalPrice}€</span>
              </div>

              <div className="detail-row">
                <span className="label">🏠 Propriétaire</span>
                <span className="value">{bookingDetails.ownerName || 'À déterminer'}</span>
              </div>

              <div className="detail-row">
                <span className="label">📍 Localisation</span>
                <span className="value">{bookingDetails.location || 'Non spécifiée'}</span>
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

          {/* ✅ SECTION SUIVANTES */}
          <div className="next-steps">
            <h3>Prochaines étapes</h3>
            <ol>
              <li>📧 Vérifiez votre email pour la confirmation</li>
              <li>💬 Contactez le propriétaire pour organiser la remise</li>
              <li>📸 Prenez des photos de l'équipement avant utilisation</li>
              <li>⭐ Laissez un avis après utilisation</li>
            </ol>
          </div>

          {/* ✅ SUPPORT */}
          <div className="support-info">
            <p>
              Des questions ? 
              <a href="/messages"> Contactez-nous</a> ou 
              <a href="/settings"> accédez à vos paramètres</a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
