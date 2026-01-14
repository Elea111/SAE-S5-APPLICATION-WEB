import React, { useState, useEffect } from 'react';
import './Apercu.css';
import { 
  FiEdit2, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiTool, 
  FiUpload,
  FiActivity,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiCheckCircle,
  FiPackage
} from 'react-icons/fi';


const Apercu = ({
  userData,
  form,
  editing,
  message,
  recentActivity,
  toggleEdit,
  handleChange,
  saveProfile,
  setEditing,
  setActiveTab
}) => {
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  const [bookings, setBookings] = useState([]);
  const [revenueStats, setRevenueStats] = useState({
    totalRental: 0,
    totalCaution: 0,
    totalRevenue: 0,
    completedBookings: 0,
    activeBookings: 0
  });

  // Détermine si on visualise le propre profil de l'utilisateur
  const isOwnProfile = () => {
    try {
      const authRaw = localStorage.getItem('auth');
      if (!authRaw) return false;
      const auth = JSON.parse(authRaw);
      const authId = auth.userId || auth.id || auth._id;
      if (!authId) return false;
      if (userData && (userData.id === authId || String(userData.id) === String(authId))) return true;
      return false;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (!userData) return;
    if (!isOwnProfile()) return;

    const authRaw = localStorage.getItem('auth');
    const auth = authRaw ? JSON.parse(authRaw) : {};

    fetch(`${API_BASE}/api/bookings/user/proprietaire`, {
      headers: {
        'Authorization': auth.token ? `Bearer ${auth.token}` : ''
      }
    })
      .then(r => r.ok ? r.json() : [])
      .then(bookingsData => {
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
        setBookings(bookingsArray);

        // Calculer les statistiques
        let totalRental = 0;
        let totalCaution = 0;
        let completedCount = 0;
        let activeCount = 0;

        bookingsArray.forEach(booking => {
          const rentalAmount = parseFloat(booking.rental_amount) || 0;
          const cautionAmount = parseFloat(booking.caution_amount) || 0;

          totalRental += rentalAmount;
          totalCaution += cautionAmount;

          const now = new Date();
          const endDate = new Date(booking.end_date);

          if (endDate < now) {
            completedCount++;
          } else {
            activeCount++;
          }
        });

        setRevenueStats({
          totalRental,
          totalCaution,
          totalRevenue: totalRental + totalCaution,
          completedBookings: completedCount,
          activeBookings: activeCount
        });
      })
      .catch(err => {
        console.warn('Erreur fetch bookings:', err);
        setBookings([]);
      });

  }, [userData]);

  return (
    <div className="overview-tab">
      {editing ? (
        <div className="edit-profile-form">
          <h2>Modifier le profil</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Prénom</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Votre prénom"
              />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Votre nom"
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Votre numéro"
              />
            </div>
            <div className="form-group full-width">
              <label>Adresse</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Votre adresse"
              />
            </div>
            <div className="form-group full-width">
              <label>Bio / Description</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Parlez de vous et de votre activité..."
                rows="4"
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={saveProfile}>
              Enregistrer
            </button>
            <button className="btn-cancel" onClick={() => setEditing(false)}>
              Annuler
            </button>
          </div>
          {message && <div className="form-message">{message}</div>}
        </div>
      ) : (
        <>
          <div className="recent-activity">
            <div className="activity-header">
              <h3><FiActivity /> Activité récente</h3>
              <button className="btn-view-all" onClick={() => setActiveTab('tools')}>
                Voir tout →
              </button>
            </div>
            <div className="activity-list">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="activity-item">
                    <div 
                      className="activity-icon" 
                      style={{ 
                        background: activity.color,
                        color: 'white'
                      }}
                    >
                      {activity.icon}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">
                        {activity.title}
                      </div>
                      <div className="activity-description">
                        {activity.description}
                      </div>
                      <div className="activity-time">
                        <FiClock size={12} /> {activity.time}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-content-section">
                  <div className="no-content-icon">
                    <FiActivity />
                  </div>
                  <p>Aucune activité récente</p>
                </div>
              )}
            </div>

            {/* Tableau de bord - Revenus intégré à l'activité récente */}
            {isOwnProfile() && (revenueStats.totalRevenue > 0 || bookings.length > 0) && (
              <div className="revenue-dashboard">
                <div className="dashboard-header">
                  <h3><FiTrendingUp /> Tableau de bord - Revenus</h3>
                  <p className="dashboard-subtitle">Statistiques de vos locations</p>
                </div>

                <div className="revenue-cards">
                  <div className="revenue-card">
                    <div className="revenue-icon total"><FiDollarSign /></div>
                    <div className="revenue-content">
                      <h4>Revenus totaux</h4>
                      <p className="revenue-amount">{revenueStats.totalRevenue.toFixed(2)} €</p>
                      <small>Loyers + cautions</small>
                    </div>
                  </div>

                  <div className="revenue-card">
                    <div className="revenue-icon rental"><FiPackage /></div>
                    <div className="revenue-content">
                      <h4>Loyers reçus</h4>
                      <p className="revenue-amount">{revenueStats.totalRental.toFixed(2)} €</p>
                      <small>{revenueStats.completedBookings} locations complétées</small>
                    </div>
                  </div>

                  <div className="revenue-card">
                    <div className="revenue-icon deposit"><FiCheckCircle /></div>
                    <div className="revenue-content">
                      <h4>Cautions</h4>
                      <p className="revenue-amount">{revenueStats.totalCaution.toFixed(2)} €</p>
                      <small>{revenueStats.activeBookings} locations en cours</small>
                    </div>
                  </div>

                  <div className="revenue-card">
                    <div className="revenue-icon bookings"><FiTool /></div>
                    <div className="revenue-content">
                      <h4>Locations</h4>
                      <p className="revenue-amount">{bookings.length}</p>
                      <small>{revenueStats.completedBookings} complétées, {revenueStats.activeBookings} actives</small>
                    </div>
                  </div>
                </div>

                {bookings.length > 0 && (
                  <div className="bookings-summary">
                    <div className="summary-item">
                      <span className="summary-label">Taux d'occupation :</span>
                      <span className="summary-value">{((revenueStats.activeBookings / (bookings.length || 1)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Valeur moyenne par location :</span>
                      <span className="summary-value">{(revenueStats.totalRental / (revenueStats.completedBookings || 1)).toFixed(2)} €</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="profile-header-section">
            <div className="profile-header">
              <div>
                <h2>À propos</h2>
                <p className="profile-bio">
                  {form.bio || "Aucune description pour le moment. Rédigez une bio pour présenter votre activité."}
                </p>
              </div>
              {isOwnProfile() && (
                <button className="btn-edit" onClick={toggleEdit}>
                  <FiEdit2 /> Modifier le profil
                </button>
              )}
            </div>

            <div className="contact-info">
              <h3>Coordonnées</h3>
              <div className="contact-grid">
                <div className="contact-item">
                  <FiMail className="contact-icon" />
                  <div>
                    <span className="contact-label">Email</span>
                    <span className="contact-value">{userData.email}</span>
                  </div>
                </div>
                <div className="contact-item">
                  <FiPhone className="contact-icon" />
                  <div>
                    <span className="contact-label">Téléphone</span>
                    <span className="contact-value">{userData.phone || 'Non renseigné'}</span>
                  </div>
                </div>
                <div className="contact-item">
                  <FiMapPin className="contact-icon" />
                  <div>
                    <span className="contact-label">Adresse</span>
                    <span className="contact-value">{userData.address || 'Non renseignée'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default Apercu;
