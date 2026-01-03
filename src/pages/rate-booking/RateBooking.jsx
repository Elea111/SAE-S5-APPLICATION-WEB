import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './RateBooking.css';

const RateBooking = () => {
  const [booking, setBooking] = useState(null);
  const [item, setItem] = useState(null);
  const [reviewedUser, setReviewedUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    const bookingId = new URLSearchParams(window.location.search).get('bookingId');
    if (!bookingId) {
      setError('Réservation introuvable');
      setLoading(false);
      return;
    }

    const auth = localStorage.getItem('auth');
    if (!auth) {
      window.location.href = '/connexion';
      return;
    }

    const authData = JSON.parse(auth);

    // Charger les infos de la réservation
    fetch(`${API_BASE}/api/bookings/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${authData.token}`
      }
    })
      .then(r => {
        if (!r.ok) throw new Error('Erreur: ' + r.status);
        return r.json();
      })
      .then(bookingData => {
        setBooking(bookingData);

        // Charger l'item
        return fetch(`${API_BASE}/api/equipments/${bookingData.equipment_id}`);
      })
      .then(r => r.json())
      .then(itemData => {
        setItem(itemData);
      })
      .catch(err => {
        console.error('❌ Erreur chargement:', err);
        setError('Impossible de charger la réservation');
      })
      .finally(() => setLoading(false));
  }, []);

  // Charger infos utilisateur à évaluer (owner si on est borrower, vice-versa)
  useEffect(() => {
    if (!booking) return;

    const auth = JSON.parse(localStorage.getItem('auth'));
    const currentUserId = auth.userId || auth.id;
    
    // On évalue la personne d'en face
    const userToReview = booking.owner_id === currentUserId ? booking.borrower_id : booking.owner_id;

    fetch(`${API_BASE}/api/users/${userToReview}/public`)
      .then(r => r.json())
      .then(userData => setReviewedUser(userData))
      .catch(err => console.error('❌ Erreur utilisateur:', err));
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setError('Veuillez sélectionner une note');
      return;
    }

    if (content.trim().length < 5) {
      setError('Votre avis doit contenir au moins 5 caractères');
      return;
    }

    if (content.length > 500) {
      setError('Votre avis ne doit pas dépasser 500 caractères');
      return;
    }

    setSubmitting(true);
    setError(null);

    const auth = JSON.parse(localStorage.getItem('auth'));
    const currentUserId = auth.userId || auth.id;
    const userToReview = booking.owner_id === currentUserId ? booking.borrower_id : booking.owner_id;

    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          booking_id: booking.id,
          target_user_id: userToReview,
          rating: parseInt(rating),
          comment: content.trim()
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur envoi avis');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = `/profil?userId=${userToReview}`;
      }, 2000);
    } catch (err) {
      console.error('❌ Erreur avis:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="rate-booking-page">
          <div className="rate-booking-container">
            <p>⏳ Chargement...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!booking || !item) {
    return (
      <>
        <Header />
        <div className="rate-booking-page">
          <div className="rate-booking-container">
            <p>❌ {error || 'Réservation introuvable'}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Header />
        <div className="rate-booking-page">
          <div className="rate-booking-container">
            <div className="success-message">
              <h2>✅ Merci pour votre avis!</h2>
              <p>Redirection vers le profil...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="rate-booking-page">
        <div className="rate-booking-container">
          <div className="rate-booking-card">
            {/* En-tête */}
            <div className="rate-header">
              <h1>Évaluer votre location</h1>
              <p>Partagez votre expérience pour aider les autres utilisateurs</p>
            </div>

            {/* Infos location */}
            <div className="booking-summary">
              <div className="item-info">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="item-thumb" />
                )}
                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p className="dates">
                    📅 Du {new Date(booking.start_date).toLocaleDateString('fr-FR')} au{' '}
                    {new Date(booking.end_date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="price">💰 {booking.total_price}€ payés</p>
                </div>
              </div>

              {reviewedUser && (
                <div className="user-to-review">
                  <p className="label">Vous évaluez:</p>
                  <div className="user-card">
                    {reviewedUser.avatar_url && (
                      <img src={reviewedUser.avatar_url} alt="avatar" className="avatar" />
                    )}
                    <h4>
                      {reviewedUser.first_name} {reviewedUser.last_name}
                    </h4>
                  </div>
                </div>
              )}
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="rate-form">
              {/* Rating stars */}
              <div className="form-group">
                <label>Note (obligatoire)</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${star <= rating ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                      title={
                        star === 1
                          ? 'Mauvais'
                          : star === 2
                          ? 'Moyen'
                          : star === 3
                          ? 'Acceptable'
                          : star === 4
                          ? 'Bon'
                          : 'Excellent'
                      }
                    >
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="rating-label">
                    {rating === 1 && '😞 Mauvais'}
                    {rating === 2 && '😕 Moyen'}
                    {rating === 3 && '😐 Acceptable'}
                    {rating === 4 && '😊 Bon'}
                    {rating === 5 && '😍 Excellent'}
                  </p>
                )}
              </div>

              {/* Content textarea */}
              <div className="form-group">
                <label>
                  Votre avis (obligatoire - 5-500 caractères)
                  <span className="char-count">
                    {content.length}/500
                  </span>
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Partagez votre expérience... L'item était-il en bon état? Le propriétaire était-il sympa?..."
                  className="review-textarea"
                  rows={5}
                />
              </div>

              {/* Error message */}
              {error && <div className="error-message">❌ {error}</div>}

              {/* Buttons */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || !rating || content.length < 5}
                >
                  {submitting ? '⏳ Envoi...' : '✅ Envoyer mon avis'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => window.history.back()}
                  disabled={submitting}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RateBooking;
