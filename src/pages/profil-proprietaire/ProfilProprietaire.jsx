// ProfilProprietaire.jsx
import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './ProfilProprietaire.css';

const ProfilProprietaire = () => {
  const [userData, setUserData] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    // ✅ VÉRIFIER D'ABORD LE QUERY PARAM ?userId=...
    const params = new URLSearchParams(window.location.search);
    const queryUserId = params.get('userId');
    
    const authRaw = localStorage.getItem('auth');
    const auth = authRaw ? JSON.parse(authRaw) : {};
    
    // ✅ UTILISER SOIT LE QUERY PARAM (profil d'un autre), SOIT L'UTILISATEUR ACTUEL
    let targetUserId;
    if (queryUserId) {
      // Visite du profil d'un autre utilisateur
      targetUserId = queryUserId;
      console.log('📍 Affichage du profil d\'un autre utilisateur:', targetUserId);
    } else {
      // Profil de l'utilisateur actuel
      targetUserId = auth.userId || auth.id;
      console.log('📍 Affichage du profil de l\'utilisateur actuel:', targetUserId);
    }
    
    // ✅ SI PAS DE USER -> PAGE DEMO
    if (!targetUserId) {
      console.warn('❌ Pas de userId');
      setUserData(null);
      return;
    }

    console.log('🔄 Chargement des données pour:', targetUserId);

    // ✅ RÉINITIALISER LES STATES AVANT DE CHARGER DE NOUVELLES DONNÉES
    setUserData(null);
    setListings([]);
    setReviews([]);
    setEditing(false);

    // ✅ UTILISER /public SI C'EST UN AUTRE UTILISATEUR, SINON /api/users/:id
    const isOtherUser = queryUserId && queryUserId !== (auth.userId || auth.id);
    const userEndpoint = isOtherUser 
      ? `${API_BASE}/api/users/${targetUserId}/public`
      : `${API_BASE}/api/users/${targetUserId}`;
    
    console.log('📡 Endpoint utilisé:', userEndpoint, '(autre utilisateur:', isOtherUser, ')');

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
        // ✅ FALLBACK: créer profil minimal, SANS avatar de localStorage (force refresh depuis Supabase)
        console.warn('Erreur fetch user, création fallback:', err);
        setUserData({
          id: targetUserId,
          email: auth.email,
          first_name: auth.first_name || 'Utilisateur',
          last_name: auth.last_name || '',
          is_pro: auth.isPro || false,
          avatar_url: null, // ← Forcer à vide, sera rafraîchi au prochain chargement
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

    // ✅ FETCH LISTINGS DE L'UTILISATEUR
    fetch(`${API_BASE}/api/users/${targetUserId}/equipments`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(items => {
        console.log('📦 Listings chargés:', items);
        const listingsArray = Array.isArray(items) ? items : [];
        setListings(listingsArray);
        
        // ✅ METTRE À JOUR LE COMPTEUR DANS USERDATA
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
  }, [API_BASE, window.location.search]);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    window.location.href = '/';
  };

  const goToSearch = () => {
    // ✅ REDIRECT À /search
    window.location.href = '/search';
  };

  const goToPublish = () => {
    // ✅ REDIRECT À /publish
    window.location.href = '/publish';
  };

  const goToMessages = (other) => {
    // open messages page; frontend expects query param "other" for conversations
    window.location.href = `/messages?other=${other}`;
  };

  // ✅ VÉRIFIER SI C'EST LE PROPRE PROFIL DE L'UTILISATEUR
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
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setUserData(updated);
        setMessage('Profil mis à jour');
      } else {
        // fallback: update locally (mock)
        setUserData(prev => ({ ...prev, ...form }));
        setMessage('Profil mis à jour localement (mock)');
      }
    } catch (err) {
      // network / CORS / route missing
      setUserData(prev => ({ ...prev, ...form }));
      setMessage('Sauvegarde locale effectuée (mock)');
    } finally {
      setEditing(false);
    }
  };

  // ✅ UPLOAD AVATAR VERS SUPABASE
  const handleAvatarChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !userData) return;

    // ✅ VERIFIER QUE L'ID EXISTE
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
        
        // Mettre à jour l'UI
        setUserData(prev => ({
          ...prev,
          avatar_url: result.data.avatar_url
        }));

        // Sauvegarder en localStorage
        const authRaw = localStorage.getItem('auth');
        if (authRaw) {
          const auth = JSON.parse(authRaw);
          auth.avatarUrl = result.data.avatar_url;
          localStorage.setItem('auth', JSON.stringify(auth));
        }

        setMessage('Avatar mis à jour ! 🎉');
        
        // ✅ FORCER REFRESH de tous les éléments pour que la photo s'affiche partout
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

  // ✅ SI userData EST NULL -> PAGE DEMO (DECONNECTE)
  // ✅ SINON -> PAGE PROFIL COMPLETE
  if (userData === null) {
    return (
      <div className="profil-proprietaire-page">
        <div className="profile-empty">
          <p>Profil démo — connectez-vous pour gérer votre compte.</p>
          <div className="quick-actions">
            <button className="btn-primary" onClick={goToSearch}>Chercher un outil</button>
            <button className="btn-secondary" onClick={() => window.location.href = '/connexion'}>Se connecter</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="profil-proprietaire-page">
      <div className="profile-header-section">
        <div className="profile-left">
          <div className="profile-image-container">
            <img
              src={userData.avatar_url || '/favicon.ico'}
              alt={userData.first_name || userData.email}
              className="profile-image"
            />
          </div>

          {/* ✅ UPLOAD AVATAR INPUT - IMPORTANT: utiliser useRef pour accéder au input */}
          <div className="avatar-upload-container">
            <input 
              ref={(input) => { window.avatarInput = input; }}
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange}
              disabled={avatarUploading}
              style={{display:'none'}} 
              id="avatar-input"
            />
            <button 
              className="btn-outline" 
              type="button"
              disabled={avatarUploading}
              onClick={() => {
                const input = document.getElementById('avatar-input');
                if (input) input.click();
              }}
            >
              {avatarUploading ? 'Upload en cours...' : 'Changer la photo'}
            </button>
          </div>

          <div className="owner-actions">
            <button className="btn-primary full" onClick={goToSearch}>Chercher un outil</button>
            <button className="btn-outline full" onClick={goToPublish}>Proposer un outil</button>
            {!isOwnProfile() && (
              <button className="btn-secondary full" onClick={() => goToMessages(userData?.id)}>Messagerie</button>
            )}
            <button className="btn-logout full" onClick={handleLogout}>Se déconnecter</button>
          </div>
        </div>

        <div className="profile-right">
          <div className="profile-main-info">
            <div className="name-row">
              <h1 className="profile-name">{userData.first_name} {userData.last_name}</h1>
              <button className="profile-settings-btn" title="Paramètres" onClick={()=>window.location.href='/settings'}>⚙ Paramètres</button>
              <div className="member-meta">
                <span>Membre depuis {new Date(userData.created_at || Date.now()).getFullYear()}</span>
                <span className="dot">•</span>
                <strong className={`role-tag ${userData.is_pro ? 'role-pro' : 'role-part'}`}>
                    {userData.is_pro ? 'Professionnel' : 'Particulier'}
                </strong>
              </div>
            </div>

            <div className="rating-section">
              <div className="stars">{'★'.repeat(Math.round(userData.rating || 0))}{'☆'.repeat(5 - Math.round(userData.rating || 0))}</div>
              <span className="rating-text">{(userData.rating || 0).toFixed(1)} / 5 sur {userData.review_count || 0} avis</span>
            </div>

            <div className="profile-actions">
              <button className="btn-link" onClick={toggleEdit}>{editing ? 'Annuler' : 'Modifier mon profil'}</button>
              <button className="btn-link" onClick={() => window.location.href = '/bookings'}>Mes réservations</button>
              <button className="btn-link" onClick={() => window.location.href = '/my-listings'}>Mes annonces</button>
            </div>
          </div>

          <div className="profile-details">
            {editing ? (
              <div className="edit-form">
                <label>Prénom
                  <input name="first_name" value={form.first_name} onChange={handleChange} />
                </label>
                <label>Nom
                  <input name="last_name" value={form.last_name} onChange={handleChange} />
                </label>
                <label>Téléphone
                  <input name="phone" value={form.phone} onChange={handleChange} />
                </label>
                <label>Adresse
                  <input name="address" value={form.address} onChange={handleChange} />
                </label>
                <div className="edit-actions">
                  <button className="btn-primary" onClick={saveProfile}>Enregistrer</button>
                  <button className="btn-outline" onClick={() => setEditing(false)}>Annuler</button>
                </div>
                {message && <p className="info">{message}</p>}
              </div>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <h4>Contact</h4>
                  <p>{userData.phone || '—'}</p>
                  <p className="muted">{userData.email}</p>
                </div>
                <div className="info-item">
                  <h4>Adresse</h4>
                  <p>{userData.address || '—'}</p>
                </div>
                <div className="info-item">
                  <h4>Statistiques</h4>
                  <p>Outils proposés: {userData.listings_count || 0}</p>
                  <p>Locations réalisées: {userData.rental_count || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="section-divider" />

      <div className="tools-section">
        <div className="section-header">
          <h2 className="section-title">Outils proposés</h2>
          <div className="header-actions">
            <button className="btn-outline" onClick={() => window.location.href = '/publish'}>Publier un outil</button>
          </div>
        </div>

        <div className="tools-grid">
          {listings && listings.length > 0 ? (
            listings.map(tool => (
              <div key={tool.id} className="tool-card small">
                <img src={tool.image_url || tool.image || '/favicon.ico'} alt={tool.title} className="tool-thumb" />
                <div className="tool-body">
                  <h4>{tool.title}</h4>
                  <p className="muted">{tool.daily_price ? `${tool.daily_price} € / jour` : 'Prix non défini'}</p>
                  <div className="tool-actions">
                    <button className="btn-link" onClick={() => window.location.href = `/equipments/${tool.id}`}>Voir</button>
                    <button className="btn-link" onClick={() => window.location.href = `/edit-listing?item=${tool.id}`}>Éditer</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-tools">
              <p>Aucun outil publié pour le moment.</p>
              <button className="btn-primary" onClick={() => window.location.href = '/publish'}>Publier mon premier outil</button>
            </div>
          )}
        </div>

        <div className="reviews-section">
          <h3>Avis récents</h3>
          {reviews.length === 0 ? <p>Aucun avis pour le moment.</p> : (
            <ul className="reviews-list">
              {reviews.slice(0,5).map(r => (
                <li key={r.id}>
                  <strong>{r.rating}★</strong> — {r.title || r.content || '—'} <span className="muted">({new Date(r.created_at || r.date || Date.now()).toLocaleDateString()})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default ProfilProprietaire;