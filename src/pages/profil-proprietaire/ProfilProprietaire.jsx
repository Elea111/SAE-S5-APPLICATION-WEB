// ProfilProprietaire.jsx
import React, { useEffect, useState } from 'react';
import './ProfilProprietaire.css';

const ProfilProprietaire = () => {
  const [userData, setUserData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    const authRaw = localStorage.getItem('auth');
    if (!authRaw) return;
    const auth = JSON.parse(authRaw);
    const userId = auth.userId;
    if (!userId) return;

    // fetch user
    fetch(`${API_BASE}/api/users/${userId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(u => {
        setUserData(u);
        setForm({
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          phone: u.phone || '',
          address: u.address || '',
        });
      })
      .catch(() => {
        // fallback: try load from localStorage if previously saved
        const localUser = auth.user || null;
        if (localUser) {
          setUserData(localUser);
          setForm({
            first_name: localUser.first_name || '',
            last_name: localUser.last_name || '',
            phone: localUser.phone || '',
            address: localUser.address || '',
          });
        }
      });

    // fetch reviews
    fetch(`${API_BASE}/api/users/${userId}/reviews`)
      .then(r => r.ok ? r.json() : [])
      .then(rs => setReviews(rs || []))
      .catch(() => setReviews([]));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    window.location.href = '/';
  };

  const goToSearch = () => window.location.href = '/';
  const goToPublish = () => window.location.href = '/publish';
  const goToMessages = () => {
    // open messages page; frontend expects query param "other" for conversations
    const other = userData?.id || '';
    window.location.href = `/messages?other=${other}`;
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

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !userData) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      // immediate preview
      setUserData(prev => ({ ...prev, avatar_url: dataUrl }));
      // save to backend (mock) via PATCH
      setAvatarUploading(true);
      try {
        const res = await fetch(`${API_BASE}/api/users/${userData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar_url: dataUrl })
        });
        if (res.ok) {
          const updated = await res.json();
          setUserData(updated);
          // persist simple auth avatar for header
          const authRaw = localStorage.getItem('auth');
          if (authRaw) {
            const auth = JSON.parse(authRaw);
            auth.avatarUrl = updated.avatar_url;
            localStorage.setItem('auth', JSON.stringify(auth));
          }
        } else {
          // fallback: keep dataUrl locally
          setMessage('Avatar mis à jour localement (mock)');
        }
      } catch (err) {
        setMessage('Erreur upload avatar (mock): sauvegarde locale');
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!userData) {
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

          {/* Avatar upload input */}
          <label className="avatar-upload-label">
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}} />
            <button className="btn-outline" type="button">{avatarUploading ? 'Upload...' : 'Changer la photo'}</button>
          </label>

          <div className="owner-actions">
            <button className="btn-primary full" onClick={goToSearch}>Chercher un outil</button>
            <button className="btn-outline full" onClick={goToPublish}>Proposer un outil</button>
            <button className="btn-secondary full" onClick={goToMessages}>Messagerie</button>
            <button className="btn-logout full" onClick={handleLogout}>Se déconnecter</button>
          </div>
        </div>

        <div className="profile-right">
          <div className="profile-main-info">
            <div className="name-row">
              <h1 className="profile-name">{userData.first_name} {userData.last_name}</h1>
              <div className="member-meta">
                <span>Membre depuis {new Date(userData.created_at || Date.now()).getFullYear()}</span>
                <span className="dot">•</span>
                {/* Role badge: green for pro, grey for particulier */}
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
          {/* If API provided listings, render them; otherwise show CTA */}
          {userData.listings && userData.listings.length > 0 ? (
            userData.listings.map(tool => (
              <div key={tool.id} className="tool-card small">
                <img src={tool.image || '/favicon.ico'} alt={tool.title} className="tool-thumb" />
                <div className="tool-body">
                  <h4>{tool.title}</h4>
                  <p className="muted">{tool.dailyPrice ? `${tool.dailyPrice} € / jour` : 'Prix non défini'}</p>
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
  );
};

export default ProfilProprietaire;