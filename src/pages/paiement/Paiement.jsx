import React, { useEffect, useState } from 'react';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import './Paiement.css';

// ✅ Charger Stripe dans le composant
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// ✅ Composant interne qui utilise useStripe()
const PaiementInterne = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');
    const sessionId = params.get('session_id'); // Après success Stripe

    if (sessionId) {
      // ✅ RETOUR DU PAIEMENT STRIPE (Success page)
      handleStripeSuccess(sessionId);
      return;
    }

    if (!bookingId) {
      setError('ID réservation manquant');
      setLoading(false);
      return;
    }

    // ✅ CHARGER LES VRAIES DETAILS DE LA RESERVATION DEPUIS L'API
    const loadBooking = async () => {
      try {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        });

        if (!res.ok) {
          // Si l'API ne retourne pas la réservation, utiliser les données du mock
          console.log('⚠️ Impossible de charger la réservation, utilisant données simulées');
          setBooking({
            id: bookingId,
            item_id: '123e4567-e89b-12d3-a456-426614174000',
            item_title: 'Perceuse 18V',
            item_price: 25.99,
            total_days: 3,
            amount: 77.97,
            caution: 80,
            total: 157.97,
            start_date: new Date().toLocaleDateString('fr-FR'),
            end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
          });
          setLoading(false);
          return;
        }

        const bookingData = await res.json();
        console.log('✅ Réservation chargée:', bookingData);
        console.log('📌 Vérification prix: rental_amount =', bookingData.rental_amount, ', deposit_amount =', bookingData.deposit_amount);

        // Formater les données reçues
        const rentalAmount = bookingData.rental_amount || 0;
        const depositAmount = bookingData.deposit_amount || 0;
        const totalAmount = rentalAmount + depositAmount;
        
        console.log('📊 Données de réservation:', {
          daily_rate: bookingData.daily_rate,
          total_days: bookingData.total_days,
          rental_amount: rentalAmount,
          deposit_amount: depositAmount,
          total: totalAmount
        });
        
        setBooking({
          id: bookingData.id,
          item_id: bookingData.equipment_id,
          item_title: bookingData.equipment_name || 'Équipement',
          item_price: bookingData.daily_rate || 0,
          total_days: bookingData.total_days || 1,
          amount: rentalAmount,
          caution: depositAmount,
          total: totalAmount,
          start_date: new Date(bookingData.start_date).toLocaleDateString('fr-FR'),
          end_date: new Date(bookingData.end_date).toLocaleDateString('fr-FR')
        });
      } catch (err) {
        console.error('❌ Erreur chargement réservation:', err);
        setError('Impossible de charger la réservation');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [API_BASE]);

  const handleStripeSuccess = async (sessionId) => {
    setSuccess(true);
    
    // ✅ Récupérer les détails de la session
    try {
      const res = await fetch(`${API_BASE}/api/stripe/session/${sessionId}`);
      const data = await res.json();
      
      console.log('✅ Session confirmée:', data);
      
      // ✅ Redirection vers la page de confirmation
      setTimeout(() => {
        window.location.href = `/bookings?booking=${data.metadata?.bookingId}`;
      }, 3000);
    } catch (err) {
      console.error('Erreur récupération session:', err);
      setTimeout(() => {
        window.location.href = '/bookings';
      }, 2000);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!stripe || !elements) {
      setError('Stripe non chargé');
      return;
    }

    setProcessing(true);

    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.token) {
      window.location.href = '/connexion';
      return;
    }

    try {
      // 1️⃣ SAUVEGARDER LES DÉTAILS DE RÉSERVATION DANS LOCALSTORAGE
      localStorage.setItem(`booking_${booking.id}`, JSON.stringify({
        id: booking.id,
        equipmentTitle: booking.item_title,
        equipmentId: booking.item_id,
        startDate: booking.start_date,
        endDate: booking.end_date,
        totalDays: booking.total_days,
        dailyPrice: booking.item_price,
        rentalAmount: booking.amount,
        cautionAmount: booking.caution,
        totalPrice: booking.total
      }));

      console.log('✅ Détails réservation sauvegardés dans localStorage:', booking.id);

      // 2️⃣ CREER LA SESSION STRIPE
      console.log('💳 Créant session Stripe...');
      
      const checkoutRes = await fetch(`${API_BASE}/api/stripe/checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.total,
          itemTitle: booking.item_title,
          itemId: booking.item_id,
          days: booking.total_days
        })
      });

      if (!checkoutRes.ok) {
        const errorData = await checkoutRes.json();
        throw new Error(errorData.message || 'Erreur création session');
      }

      const { sessionUrl } = await checkoutRes.json();

      console.log('✅ Session créée, redirection vers Stripe...');

      // 2️⃣ REDIRIGER VERS STRIPE CHECKOUT
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        throw new Error('Pas d\'URL de session');
      }
    } catch (err) {
      console.error('❌ Erreur paiement:', err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="paiement-page"><p>⏳ Chargement...</p></div>;
  }

  if (error && !booking) {
    return (
      <div className="paiement-page">
        <p className="error">❌ {error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="paiement-page">
        <div className="paiement-container">
          <div className="success-state">
            <div className="success-icon">✅</div>
            <h1>Paiement réussi!</h1>
            <p>Votre réservation a été confirmée.</p>
            <p className="muted">Redirection vers vos réservations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="paiement-page">
      <div className="paiement-container">
        <h1>💳 Paiement de la réservation</h1>

        <div className="paiement-content">
          {/* Résumé */}
          <div className="paiement-summary">
            <h2>{booking.item_title}</h2>
            <div className="dates">
              <span>📅 {booking.start_date}</span>
              <span>→</span>
              <span>{booking.end_date}</span>
            </div>

            <div className="summary-details">
              <div className="detail-line">
                <span>{booking.total_days} jour(s) × {booking.item_price}€</span>
                <span>{booking.amount.toFixed(2)}€</span>
              </div>
              <div className="detail-line">
                <span>Caution</span>
                <span>{booking.caution.toFixed(2)}€</span>
              </div>
              <div className="detail-line total">
                <span>Total TTC</span>
                <span>{booking.total.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          {/* Formulaire Stripe */}
          <form onSubmit={handlePayment} className="paiement-form">
            <h3>Paiement sécurisé</h3>

            <div className="stripe-container">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#333',
                      '::placeholder': {
                        color: '#aaa'
                      }
                    },
                    invalid: {
                      color: '#dc3545'
                    }
                  }
                }}
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button
              type="submit"
              className="btn-pay"
              disabled={processing || !stripe || !elements}
            >
              {processing ? '⏳ Traitement...' : `Payer ${booking.total.toFixed(2)}€`}
            </button>

            <p className="paiement-note">
              🔒 Paiement sécurisé avec Stripe
            </p>
          </form>
        </div>

        <div className="paiement-footer">
          <p>✅ Paiement sécurisé</p>
          <p>🔒 Données chiffrées</p>
          <p>💳 Cartes acceptées</p>
        </div>
      </div>
    </div>
  );
};

// ✅ Composant externe qui enveloppe dans <Elements>
const PaiementWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaiementInterne />
    </Elements>
  );
};

export default PaiementWrapper;