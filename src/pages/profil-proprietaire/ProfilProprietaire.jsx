import React, { useEffect, useState } from 'react';
import './ProfilProprietaire.css';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import Apercu from './composants-onglets/Apercu';
import MesOutils from './composants-onglets/MesOutils';
import Avis from './composants-onglets/Avis';
import Parametre from './composants-onglets/Parametre';
import { 
  FiSettings, 
  FiEdit2, 
  FiLogOut, 
  FiMessageSquare, 
  FiTool, 
  FiCalendar, 
  FiMapPin, 
  FiMail, 
  FiPhone, 
  FiStar, 
  FiUpload,
  FiCheckCircle,
  FiShield
} from 'react-icons/fi';
 
const ProfilProprietaire = () => {
  const [userData, setUserData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState([]);

  // ✅ REVENUE DASHBOARD STATE
  const [bookings, setBookings] = useState([]);
  const [revenueStats, setRevenueStats] = useState({
    totalRental: 0,
    totalCaution: 0,
    totalRevenue: 0,
    completedBookings: 0,
    activeBookings: 0
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  const generateRecentActivity = (userData, reviews) => {
    const activities = [];
    
    // Seulement les activités basées sur les données réelles
    if (userData?.listings) {
      userData.listings.slice(0, 2).forEach((tool) => {
        activities.push({
          id: `tool-${tool.id}`,
          type: 'tool',
          icon: <FiTool />,
          title: `Outils "${tool.title?.substring(0, 20)}${tool.title?.length > 20 ? '...' : ''}" ${tool.status === 'rented' ? 'loué' : 'publié'}`,
          description: tool.status === 'rented' 
            ? 'Votre outil a été réservé cette semaine' 
            : 'Votre outil est disponible pour location',
          time: new Date(tool.updated_at || tool.created_at).toLocaleDateString('fr-FR'),
          color: tool.status === 'rented' ? '#00b894' : '#999e48'
        });
      });
    }

    reviews.slice(0, 2).forEach((review) => {
      activities.push({
        id: `review-${review.id}`,
        type: 'review',
        icon: <FiStar />,
        title: `Nouvel avis de ${review.reviewer_name || 'Anonyme'}`,
        description: review.content?.substring(0, 50) || '',
        time: new Date(review.created_at).toLocaleDateString('fr-FR'),
        color: '#fdcb6e'
      });
    });

    return activities;
  };

  useEffect(() => {
    // Support visite d'un autre profil via ?userId=...
    const params = new URLSearchParams(window.location.search);
    const queryUserId = params.get('userId');

    const authRaw = localStorage.getItem('auth');
    const auth = authRaw ? JSON.parse(authRaw) : {};

    // choisir la cible : le param query ou l'utilisateur authentifié
    let targetUserId;
    if (queryUserId) {
      targetUserId = queryUserId;
      console.log('📍 Affichage du profil d\'un autre utilisateur:', targetUserId);
    } else {
      targetUserId = auth.userId || auth.id || auth._id;
      console.log('📍 Affichage du profil de l\'utilisateur actuel:', targetUserId);
    }

    if (!targetUserId) {
      console.warn('❌ Pas de userId');
      setUserData(null);
      setLoading(false);
      return;
    }

    // reset avant chargement
    setUserData(null);
    setListings([]);
    setReviews([]);
    setEditing(false);

    const isOtherUser = queryUserId && queryUserId !== (auth.userId || auth.id);
    const userEndpoint = isOtherUser ? `${API_BASE}/api/users/${targetUserId}/public` : `${API_BASE}/api/users/${targetUserId}`;

    // fetch user
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
          address: auth.address || ''
        });
      })
      .finally(() => {
        setLoading(false);
      });

    // fetch reviews
    fetch(`${API_BASE}/api/users/${targetUserId}/reviews`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
      .then(r => r.ok ? r.json() : [])
      .then(rs => setReviews(rs || []))
      .catch(() => setReviews([]));

    // fetch listings
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
        setUserData(prev => ({
          ...prev,
          listings_count: 0
        }));
      });

    // fetch bookings pour le dashboard si propre profil
    const isOwnProfile = !queryUserId || queryUserId === (auth.userId || auth.id);
    if (isOwnProfile) {
      fetch(`${API_BASE}/api/bookings/user/proprietaire`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      })
        .then(r => r.ok ? r.json() : [])
        .then(bookingsData => {
          const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
          setBookings(bookingsArray);

          // calcul statistiques
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
            if (endDate < now) completedCount++; else activeCount++;
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
    if (userData && reviews.length > 0) {
      setRecentActivity(generateRecentActivity(userData, reviews));
    }
  }, [userData, reviews]);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    window.location.href = '/';
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = () => {
    localStorage.removeItem('auth');
    window.location.href = '/';
  };

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false);
  };

  const goToSearch = () => {
    window.location.href = '/search';
  };

  const goToPublish = () => {
    window.location.href = '/publish';
  };

  const goToMessages = (other) => {
    window.location.href = `/messages?other=${other}`;
  };

  // Vérifier si c'est le propre profil (comparaison sûre en string)
  const isOwnProfile = () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const currentUserId = auth.userId || auth.id || auth._id;
      if (!currentUserId || !userData?.id) return false;
      return String(userData.id) === String(currentUserId);
    } catch (e) {
      return false;
    }
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
    const authRaw = localStorage.getItem('auth');
    const auth = authRaw ? JSON.parse(authRaw) : {};
    const token = auth.token;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_BASE}/api/users/${userId}`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        address: form.address,
      })
    });
    
    if (res.ok) {
      const updated = await res.json();
      // Mettre à jour userData avec TOUTES les nouvelles données
      const updatedUserData = {
        ...userData,
        ...updated,
        first_name: form.first_name, // S'assurer que le prénom est bien mis à jour
        last_name: form.last_name,   // S'assurer que le nom est bien mis à jour
      };
      
      setUserData(updatedUserData);
      setMessage('Profil mis à jour');
      setTimeout(() => setMessage(''), 3000);
      
      // Mettre à jour le localStorage AVEC les nouvelles valeurs
      const updatedAuth = {
        ...auth,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        address: form.address,
        avatar_url: updated.avatar_url || auth.avatar_url,
      };
      localStorage.setItem('auth', JSON.stringify(updatedAuth));
      
    } else {
      // Si l'API échoue, mettre à jour localement quand même
      const updatedUserData = {
        ...userData,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        address: form.address,
      };
      setUserData(updatedUserData);
      setMessage('Profil mis à jour localement');
    }
  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err);
    // Mettre à jour localement en cas d'erreur réseau
    const updatedUserData = {
      ...userData,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      address: form.address,
    };
    setUserData(updatedUserData);
    setMessage('Sauvegarde locale effectuée');
  } finally {
    setEditing(false);
  }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !userData) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setUserData(prev => ({ ...prev, avatar_url: dataUrl }));
      setAvatarUploading(true);
      try {
        const authRaw = localStorage.getItem('auth');
        const auth = authRaw ? JSON.parse(authRaw) : {};
        const token = auth.token;
        
        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(`${API_BASE}/api/users/${userData.id}`, {
          method: 'PATCH',
          headers: headers,
          body: JSON.stringify({ avatar_url: dataUrl })
        });
        
        if (res.ok) {
          const updated = await res.json();
          setUserData(updated);
          const authRaw = localStorage.getItem('auth');
          if (authRaw) {
            const auth = JSON.parse(authRaw);
            auth.avatarUrl = updated.avatar_url;
            localStorage.setItem('auth', JSON.stringify(auth));
          }
        } else {
          setMessage('Avatar mis à jour localement');
        }
      } catch (err) {
        setMessage('Erreur upload avatar: sauvegarde locale');
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderStars = (rating) => {
    if (!rating || rating === 0) {
      return (
        <div className="stars-display">
          <span className="no-rating">Aucune note</span>
        </div>
      );
    }
    
    return (
      <div className="stars-display">
        {[...Array(5)].map((_, i) => (
          <FiStar 
            key={i} 
            className={i < Math.floor(rating) ? "star-filled" : "star-empty"} 
          />
        ))}
        <span className="rating-value">{rating?.toFixed(1)}</span>
      </div>
    );
  };

  const calculateStats = () => {
    if (!userData) return null;
    
    return {
      tools: userData.listings?.length || 0,
      rentals: userData.rental_count || 0,
      rating: userData.rating || 0,
      reviews: reviews.length,
      responseRate: userData.response_rate || 0,
      satisfaction: userData.satisfaction_rate || 0,
      profitability: userData.profitability_rate || 0
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="profil-proprietaire-page">
        <div className="profile-loading">
          <p>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="profil-proprietaire-page">
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Supprimer votre compte</h3>
            <p>Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={confirmDeleteAccount}>
                Oui, supprimer
              </button>
              <button className="btn-cancel" onClick={cancelDeleteAccount}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-main-content">
        <div className="profile-sidebar">
          <div className="avatar-section">
            <div className="avatar-container">
              <img
                src={userData.avatar_url || '/favicon.ico'}
                alt={`${userData.first_name} ${userData.last_name}`}
                className="profile-avatar"
              />
              <label className="avatar-upload-label">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  disabled={avatarUploading}
                  style={{display:'none'}}
                />
                <div className="avatar-upload-overlay">
                  {avatarUploading ? '...' : <FiUpload />}
                </div>
              </label>
            </div>
            
            <div className="user-basic-info">
              <h1 className="user-name">{userData.first_name} {userData.last_name}</h1>
                <div className="user-badges">
                  <span className={`profile-badge ${userData.is_pro ? 'profile-badge-pro' : 'profile-badge-standard'}`}>
                    {userData.is_pro ? 'PROFESSIONNEL' : 'PARTICULIER'}
                  </span>
                </div>
              {renderStars(userData.rating)}
              <p className="member-since">
                Membre depuis {new Date(userData.created_at).getFullYear()}
              </p>
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="sidebar-btn primary" onClick={() => window.location.href = '/search'}>
              <FiTool /> Chercher un outil
            </button>
            <button className="sidebar-btn secondary" onClick={() => window.location.href = '/publish'}>
              <FiTool /> Publier un outil
            </button>
            {!isOwnProfile() && (
              <button className="sidebar-btn" onClick={() => goToMessages(userData?.id)}>
                <FiMessageSquare /> Messagerie
              </button>
            )}
            <button className="sidebar-btn logout" onClick={handleLogout}>
              <FiLogOut /> Déconnexion
            </button>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-tabs">
            <button 
              className={`profile-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Aperçu
            </button>
            <button 
              className={`profile-tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
              onClick={() => setActiveTab('tools')}
            >
              Mes outils
            </button>
            <button 
              className={`profile-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Avis ({reviews.length})
            </button>
            <button 
              className={`profile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Paramètres
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <Apercu 
                userData={userData}
                form={form}
                editing={editing}
                message={message}
                recentActivity={recentActivity}
                stats={stats}
                reviews={reviews}
                toggleEdit={toggleEdit}
                handleChange={handleChange}
                saveProfile={saveProfile}
                setEditing={setEditing}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'tools' && (
              <MesOutils 
                userData={userData}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'reviews' && (
              <Avis 
                reviews={reviews}
                renderStars={renderStars}
              />
            )}

            {activeTab === 'settings' && (
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