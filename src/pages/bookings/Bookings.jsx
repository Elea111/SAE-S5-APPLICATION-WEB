import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './Bookings.css';

const Bookings = ({ isTab = false }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('borrower'); // 'borrower' ou 'owner'
  const [filterStatus, setFilterStatus] = useState('all');
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    const authRaw = localStorage.getItem('auth');
    if (!authRaw) {
      window.location.href = '/connexion';
      return;
    }

    const auth = JSON.parse(authRaw);
    const userId = auth.userId || auth.id;
    setMe(userId);

    // Charger les réservations utilisateur depuis API
    fetch(`${API_BASE}/api/bookings/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        console.log('📦 Bookings loaded:', data);
        const bookingsArray = Array.isArray(data) ? data : [];
        
        // Mapper les données pour assurer les bons noms de champs
        const mappedBookings = bookingsArray.map(b => {
          const borrowerName = b.users 
            ? `${b.users.first_name} ${b.users.last_name || ''}`.trim()
            : 'Emprunteur inconnu';
          
          return {
            id: b.id,
            title: b.items?.title || 'Équipement',
            status: b.status,
            start_date: b.start_date,
            end_date: b.end_date,
            total_price: b.total_amount || 0,
            borrower_id: b.borrower_id,
            owner_id: b.owner_id,
            borrower_name: borrowerName
          };
        });
        
        setBookings(mappedBookings);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur fetch bookings:', err);
        setError('Erreur lors du chargement des réservations');
        setLoading(false);
      });
  }, [API_BASE]);

  const handleStatusChange = async (bookingId, newStatus) => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Erreur update status');

      // Mettre à jour localement
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );

      alert('✅ Statut mis à jour');
    } catch (err) {
      console.error('❌ Erreur update:', err);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  const getStatusLabel = status => {
    const labels = {
      pending: '⏳ En attente',
      confirmed: '✅ Confirmée',
      handed_over: '🚚 Item remis',
      pickup_confirmed: '📥 Réception confirmée',
      returned: '📦 Item retourné',
      return_confirmed: '✅ Retour confirmé',
      cancelled: '❌ Annulée'
    };
    return labels[status] || status;
  };

  const getStatusColor = status => {
    const colors = {
      pending: '#ffa500',
      confirmed: '#4caf50',
      handed_over: '#2196f3',
      pickup_confirmed: '#9c27b0',
      returned: '#ff9800',
      return_confirmed: '#4caf50',
      cancelled: '#f44336'
    };
    return colors[status] || '#999';
  };

  const filteredBookings = bookings.filter(booking => {
    // Si l'utilisateur est borrower, il voit cette réservation dans l'onglet "emprunteur"
    // Si l'utilisateur n'est pas borrower, il est propriétaire (owner)
    const isUserBorrower = booking.borrower_id === me;
    
    // Filtrer par tab
    if (tab === 'borrower' && !isUserBorrower) return false;
    if (tab === 'owner' && isUserBorrower) return false;

    // Filtrer par statut
    if (filterStatus !== 'all' && booking.status !== filterStatus) return false;

    return true;
  });

  if (loading) {
    return (
      <>
        {!isTab && <Header />}
        <div className="bookings-page">
          <div className="bookings-container">
            <p>⏳ Chargement des réservations...</p>
          </div>
        </div>
        {!isTab && <Footer />}
      </>
    );
  }

  return (
    <>
      {!isTab && <Header />}
      <div className="bookings-page">
        <div className="bookings-container">
          <div className="bookings-header">
            <h1>📋 Mes réservations</h1>
            <p>Suivez vos locations et échanges d'outils</p>
          </div>

          {/* Tabs */}
          <div className="bookings-tabs">
            <button
              className={`tab ${tab === 'borrower' ? 'active' : ''}`}
              onClick={() => setTab('borrower')}
            >
              📥 Comme emprunteur
            </button>
            <button
              className={`tab ${tab === 'owner' ? 'active' : ''}`}
              onClick={() => setTab('owner')}
            >
              📤 Comme propriétaire
            </button>
          </div>

          {/* Filter by status */}
          <div className="filter-section">
            <label>Filtrer par statut:</label>
            <div className="filter-buttons">
              {[
                { value: 'all', label: 'Tous' },
                { value: 'pending', label: '⏳ En attente' },
                { value: 'confirmed', label: '✅ Confirmées' },
                { value: 'handed_over', label: '🚚 Remises' },
                { value: 'pickup_confirmed', label: '📥 Réception confirmée' },
                { value: 'returned', label: '📦 Retournées' },
                { value: 'return_confirmed', label: '✅ Retour confirmé' }
              ].map(option => (
                <button
                  key={option.value}
                  className={`filter-btn ${filterStatus === option.value ? 'active' : ''}`}
                  onClick={() => setFilterStatus(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && <div className="error-message">❌ {error}</div>}

          {/* Bookings list */}
          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <p>Aucune réservation pour le moment</p>
              <button
                className="btn-primary"
                onClick={() => (window.location.href = '/search')}
              >
                Chercher des outils à louer
              </button>
            </div>
          ) : (
            <div className="bookings-list">
              {filteredBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  {/* Header */}
                  <div className="booking-header-card">
                    <div className="booking-title">
                      <h3>{booking.title || 'Équipement'}</h3>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                    <div className="booking-dates">
                      📅 {new Date(booking.start_date).toLocaleDateString('fr-FR')} →{' '}
                      {new Date(booking.end_date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="booking-timeline">
                    <div
                      className={`timeline-item ${
                        ['pending', 'confirmed', 'handed_over', 'pickup_confirmed', 'returned', 'return_confirmed'].includes(
                          booking.status
                        )
                          ? 'completed'
                          : ''
                      }`}
                    >
                      <div className="timeline-marker">📋</div>
                      <div className="timeline-label">Créée</div>
                    </div>

                    <div
                      className={`timeline-item ${
                        ['confirmed', 'handed_over', 'pickup_confirmed', 'returned', 'return_confirmed'].includes(
                          booking.status
                        )
                          ? 'completed'
                          : ''
                      }`}
                    >
                      <div className="timeline-marker">✅</div>
                      <div className="timeline-label">Acceptée</div>
                    </div>

                    <div
                      className={`timeline-item ${
                        ['handed_over', 'pickup_confirmed', 'returned', 'return_confirmed'].includes(booking.status)
                          ? 'completed'
                          : ''
                      }`}
                    >
                      <div className="timeline-marker">🚚</div>
                      <div className="timeline-label">Remise item</div>
                    </div>

                    <div
                      className={`timeline-item ${
                        ['pickup_confirmed', 'returned', 'return_confirmed'].includes(booking.status)
                          ? 'completed'
                          : ''
                      }`}
                    >
                      <div className="timeline-marker">📥</div>
                      <div className="timeline-label">Réception confirmée</div>
                    </div>

                    <div
                      className={`timeline-item ${
                        ['returned', 'return_confirmed'].includes(booking.status) ? 'completed' : ''
                      }`}
                    >
                      <div className="timeline-marker">📦</div>
                      <div className="timeline-label">Retourné</div>
                    </div>

                    <div
                      className={`timeline-item ${
                        booking.status === 'return_confirmed' ? 'completed' : ''
                      }`}
                    >
                      <div className="timeline-marker">✅</div>
                      <div className="timeline-label">Retour confirmé</div>
                    </div>

                    <div className="timeline-item">
                      <div className="timeline-marker">⭐</div>
                      <div className="timeline-label">Avis</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="label">Montant total:</span>
                      <span className="value">💰 {booking.total_price}€</span>
                    </div>
                    {booking.borrower_name && (
                      <div className="detail-row">
                        <span className="label">
                          {tab === 'borrower' ? 'Propriétaire:' : 'Emprunteur:'}
                        </span>
                        <span className="value">{booking.borrower_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="booking-actions">
                    {/* Action: ACCEPTER/REFUSER la réservation (owner, status=pending) */}
                    {tab === 'owner' && booking.status === 'pending' && (
                      <div className="pending-actions">
                        <button
                          className="btn-action btn-accept"
                          onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        >
                          ✅ Accepter la réservation
                        </button>
                        <button
                          className="btn-action btn-reject"
                          onClick={() => handleStatusChange(booking.id, 'cancelled')}
                        >
                          ❌ Refuser
                        </button>
                      </div>
                    )}

                    {/* Action: Confirmer remise (owner, status=confirmed) */}
                    {tab === 'owner' && booking.status === 'confirmed' && (
                      <button
                        className="btn-action"
                        onClick={() =>
                          handleStatusChange(booking.id, 'handed_over')
                        }
                      >
                        🚚 Confirmer remise item
                      </button>
                    )}

                    {/* Action: Confirmer retour (owner, status=handed_over) */}
                    {tab === 'owner' && booking.status === 'handed_over' && (
                      <button
                        className="btn-action"
                        onClick={() =>
                          handleStatusChange(booking.id, 'return_confirmed')
                        }
                      >
                        ✅ Marquer comme retourné
                      </button>
                    )}

                    {/* Action: Confirmer réception item (borrower, status=handed_over) */}
                    {tab === 'borrower' && booking.status === 'handed_over' && (
                      <button
                        className="btn-action btn-accept"
                        onClick={() =>
                          handleStatusChange(booking.id, 'pickup_confirmed')
                        }
                      >
                        📥 Confirmer réception de l'item
                      </button>
                    )}

                    {/* Action: Retourner item (borrower, status=pickup_confirmed) */}
                    {tab === 'borrower' && booking.status === 'pickup_confirmed' && (
                      <button
                        className="btn-action"
                        onClick={() =>
                          handleStatusChange(booking.id, 'returned')
                        }
                      >
                        📦 Signaler retour de l'item
                      </button>
                    )}

                    {/* Action: Confirmer réception du retour (owner, status=returned) */}
                    {tab === 'owner' && booking.status === 'returned' && (
                      <button
                        className="btn-action btn-accept"
                        onClick={() =>
                          handleStatusChange(booking.id, 'return_confirmed')
                        }
                      >
                        ✅ Confirmer réception du retour
                      </button>
                    )}

                    {/* Action: Signaler retour item (borrower, status=handed_over) */}
                    {tab === 'borrower' && booking.status === 'handed_over' && (
                      <button
                        className="btn-action"
                        onClick={() =>
                          handleStatusChange(booking.id, 'returned')
                        }
                      >
                        📦 Signaler retour item
                      </button>
                    )}

                    {/* Action: Laisser avis (any user, status=returned or return_confirmed) */}
                    {(booking.status === 'returned' || booking.status === 'return_confirmed') && (
                      <button
                        className="btn-rate"
                        onClick={() =>
                          (window.location.href = `/rate-booking?bookingId=${booking.id}`)
                        }
                      >
                        ⭐ Laisser un avis
                      </button>
                    )}

                    {/* Action: Voir le profil */}
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const userId =
                          tab === 'borrower'
                            ? booking.owner_id
                            : booking.borrower_id;
                        window.location.href = `/profil?userId=${userId}`;
                      }}
                    >
                      👤 Voir le profil
                    </button>

                    {/* Action: Contacter */}
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const userId =
                          tab === 'borrower'
                            ? booking.owner_id
                            : booking.borrower_id;
                        window.location.href = `/messages?other=${userId}`;
                      }}
                    >
                      💬 Contacter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {!isTab && <Footer />}
    </>
  );
};

export default Bookings;
