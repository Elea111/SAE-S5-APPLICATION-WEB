// ProfilProprietaire.jsx
import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import Apercu from './composants-onglets/Apercu';
import MesOutils from './composants-onglets/MesOutils';
import Avis from './composants-onglets/Avis';
import Parametre from './composants-onglets/Parametre';
import Bookings from '../../pages/bookings/Bookings';
import { FiHome, FiTool, FiStar, FiSettings, FiLogOut, FiEdit2, FiMail, FiCalendar } from 'react-icons/fi';
import './ProfilProprietaire.css';

const ProfilProprietaire = () => {
  const [userData, setUserData] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentActivity, setRecentActivity] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [revenueStats, setRevenueStats] = useState({
    totalRental: 0,
    totalCaution: 0,
    totalRevenue: 0,
    completedBookings: 0,
    activeBookings: 0
  });

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  // ✅ GÉNÉRER L'ACTIVITÉ RÉCENTE
  const generateRecentActivity = () => {
    const activities = [];
    if (listings.length > 0) {
      activities.push({
        id: 'recent-listing',
        title: 'Nouvel outil publié',
        description: listings[0]?.title || 'Un outil',
        time: 'Il y a quelques jours',
        icon: '📦',
        color: '#999e48'
      });
    }
    if (reviews.length > 0) {
      activities.push({
        id: 'recent-review',
        title: 'Nouvel avis reçu',
        description: `${reviews[0]?.users?.first_name || 'Un client'} a laissé un avis`,
        time: 'Récemment',
        icon: '⭐',
        color: '#FFC107'
      });
    }
    return activities;
  };

  // ✅ FONCTIONS HELPER
  const isOwnProfile = () => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    const currentUserId = auth.userId || auth.id;
    return userData?.id === currentUserId;
  };

  const toggleEdit = () => {
    setEditing(!editing);
    setMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    setMessage('');
    if (!userData) return;
    const userId = userData.id;
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          address: form.address,
          bio: form.bio
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setUserData(updated);
        setMessage('Profil mis à jour');
      } else {
        setUserData(prev => ({ ...prev, ...form }));
        setMessage('Profil mis à jour localement (mock)');
      }
    } catch (err) {
      setUserData(prev => ({ ...prev, ...form }));
      setMessage('Sauvegarde locale effectuée (mock)');
    } finally {
      setEditing(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !userData) return;

    if (!userData.id) {
      setMessage('Erreur : ID utilisateur manquant');
      return;
    }

    setAvatarUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      console.log(`📸 Upload avatar pour user: ${userData.id}`);

      const res = await fetch(`${API_BASE}/api/users/${userData.id}/avatar`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        
        setUserData(prev => ({
          ...prev,
          avatar_url: result.data.avatar_url
        }));

        const authRaw = localStorage.getItem('auth');
        if (authRaw) {
          const auth = JSON.parse(authRaw);
          auth.avatarUrl = result.data.avatar_url;
          localStorage.setItem('auth', JSON.stringify(auth));
        }

        setMessage('Avatar mis à jour ! 🎉');
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const error = await res.json();
        setMessage(`Erreur : ${error.error || 'Impossible d\'uploader l\'avatar'}`);
      }
    } catch (err) {
      setMessage(`Erreur réseau : ${err.message}`);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    const userId = userData?.id;
    
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      
      if (res.ok) {
        localStorage.removeItem('auth');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Erreur suppression compte:', err);
    }
  };

  const renderStars = (rating) => {
    const filled = Math.round(rating || 0);
    const empty = 5 - filled;
    return (
      <span>
        {'★'.repeat(filled)}
        {'☆'.repeat(empty)}
      </span>
    );
  };

  // ✅ FETCH DATA
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryUserId = params.get('userId');
    
    const authRaw = localStorage.getItem('auth');
    const auth = authRaw ? JSON.parse(authRaw) : {};
    
    let targetUserId;
    if (queryUserId) {
      targetUserId = queryUserId;
      console.log('📍 Affichage du profil d\'un autre utilisateur:', targetUserId);
    } else {
      targetUserId = auth.userId || auth.id;
      console.log('📍 Affichage du profil de l\'utilisateur actuel:', targetUserId);
    }
    
    if (!targetUserId) {
      console.warn('❌ Pas de userId');
      setUserData(null);
      return;
    }

    setUserData(null);
    setListings([]);
    setReviews([]);
    setEditing(false);

    const isOtherUser = queryUserId && queryUserId !== (auth.userId || auth.id);
    const userEndpoint = isOtherUser 
      ? `${API_BASE}/api/users/${targetUserId}/public`
      : `${API_BASE}/api/users/${targetUserId}`;

    // Fetch user
    fetch(userEndpoint, {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Not found')))
      .then(u => {
        setUserData(u);
        setForm({
          first_name: u.first_name || auth.first_name || '',
          last_name: u.last_name || auth.last_name || '',
          phone: u.phone || '',
          address: u.address || '',
          bio: u.bio || ''
        });
      })
      .catch((err) => {
        console.warn('Erreur fetch user, création fallback:', err);
        setUserData({
          id: targetUserId,
          email: auth.email,
          first_name: auth.first_name || 'Utilisateur',
          last_name: auth.last_name || '',
          is_pro: auth.isPro || false,
          avatar_url: null,
          created_at: new Date().toISOString(),
          rating: 0,
          review_count: 0,
          listings_count: 0,
          rental_count: 0
        });
        setForm({
          first_name: auth.first_name || '',
          last_name: auth.last_name || '',
          phone: auth.phone || '',
          address: auth.address || '',
          bio: ''
        });
      });

    // Fetch reviews
    fetch(`${API_BASE}/api/users/${targetUserId}/reviews`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(r => r.ok ? r.json() : [])
      .then(rs => setReviews(rs || []))
      .catch(() => setReviews([]));

    // Fetch listings
    fetch(`${API_BASE}/api/users/${targetUserId}/equipments`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(items => {
        const listingsArray = Array.isArray(items) ? items : [];
        setListings(listingsArray);
        setUserData(prev => ({
          ...prev,
          listings_count: listingsArray.length
        }));
      })
      .catch(err => {
        console.warn('Erreur fetch listings:', err);
        setListings([]);
      });

    // Fetch bookings (only for own profile)
    const checkOwnProfile = !queryUserId || queryUserId === (auth.userId || auth.id);
    if (checkOwnProfile) {
      fetch(`${API_BASE}/api/bookings/user/proprietaire`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      })
        .then(r => r.ok ? r.json() : [])
        .then(bookingsData => {
          const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
          setBookings(bookingsArray);

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
    }
  }, [API_BASE, window.location.search]);

  useEffect(() => {
    setRecentActivity(generateRecentActivity());
  }, [listings, reviews]);

  // ✅ RENDER PROFILE PAGE OR EMPTY STATE
  if (userData === null) {
    return (
      <div className="profil-proprietaire-page">
        <p style={{textAlign: 'center', marginTop: '40px', color: '#999'}}>
          Profil démo — connectez-vous pour gérer votre compte.
        </p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="profil-proprietaire-page">
        <div className="profile-main-content">
          {/* ✅ SIDEBAR */}
          <div className="profile-sidebar">
            <div className="avatar-section">
              <div className="avatar-container">
                <img
                  src={userData.avatar_url || '/favicon.ico'}
                  alt={userData.first_name}
                  className="profile-avatar"
                />
                {isOwnProfile() && (
                  <label className="avatar-upload-label">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange}
                      disabled={avatarUploading}
                    />
                    <div className="avatar-upload-overlay">
                      📸
                    </div>
                  </label>
                )}
              </div>

              <div className="user-basic-info">
                <h2 className="user-name">{userData.first_name} {userData.last_name}</h2>
                
                {userData.is_pro && (
                  <div className="user-badges">
                    <div className="profile-badge profile-badge-pro">⭐ Professionnel</div>
                  </div>
                )}

                <div className="stars-display">
                  <span className="star-filled">
                    {'★'.repeat(Math.round(userData.rating || 0))}
                  </span>
                  <span className="star-empty">
                    {'☆'.repeat(5 - Math.round(userData.rating || 0))}
                  </span>
                  <span className="rating-value">{(userData.rating || 0).toFixed(1)}</span>
                </div>

                <p className="member-since">
                  Membre depuis {new Date(userData.created_at).getFullYear()}
                </p>
              </div>

              <div className="sidebar-actions">
                {isOwnProfile() ? (
                  <>
                    <button className="sidebar-btn primary" onClick={() => window.location.href = '/publish'}>
                      <FiTool /> Publier un outil
                    </button>
                    <button className="sidebar-btn" onClick={() => window.location.href = '/search'}>
                      <FiHome /> Chercher un outil
                    </button>
                    <button className="sidebar-btn secondary" onClick={handleLogout}>
                      <FiLogOut /> Se déconnecter
                    </button>
                  </>
                ) : (
                  <>
                    <button className="sidebar-btn primary" onClick={() => window.location.href = `/messages?other=${userData.id}`}>
                      <FiMail /> Contacter
                    </button>
                    <button className="sidebar-btn secondary" onClick={() => window.location.href = '/search'}>
                      <FiHome /> Chercher un outil
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ✅ CONTENU PRINCIPAL AVEC ONGLETS */}
          <div className="profile-content">
            <div className="profile-tabs">
              <button 
                className={`profile-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FiHome /> Aperçu
              </button>
              <button 
                className={`profile-tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
                onClick={() => setActiveTab('tools')}
              >
                <FiTool /> Mes outils
              </button>
              {isOwnProfile() && (
                <button 
                  className={`profile-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookings')}
                >
                  <FiCalendar /> Mes réservations
                </button>
              )}
              <button 
                className={`profile-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <FiStar /> Avis ({reviews.length})
              </button>
              {isOwnProfile() && (
                <button 
                  className={`profile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <FiSettings /> Paramètres
                </button>
              )}
            </div>

            <div className="tab-content">
              {activeTab === 'overview' && (
                <Apercu
                  userData={userData}
                  form={form}
                  editing={editing}
                  message={message}
                  recentActivity={recentActivity}
                  toggleEdit={toggleEdit}
                  handleChange={handleChange}
                  saveProfile={saveProfile}
                  setEditing={setEditing}
                  setActiveTab={setActiveTab}
                  bookings={bookings}
                  revenueStats={revenueStats}
                />
              )}

              {activeTab === 'tools' && (
                <MesOutils
                  userData={userData}
                  listings={listings}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'bookings' && isOwnProfile() && (
                <Bookings isTab={true} />
              )}

              {activeTab === 'reviews' && (
                <Avis
                  reviews={reviews}
                  renderStars={renderStars}
                />
              )}

              {activeTab === 'settings' && isOwnProfile() && (
                <Parametre
                  handleLogout={handleLogout}
                  handleDeleteAccount={handleDeleteAccount}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilProprietaire;
