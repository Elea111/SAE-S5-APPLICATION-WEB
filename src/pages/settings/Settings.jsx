import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    messages: true,
    bookings: true,
    newsletter: false,
    push: true
  });

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (!auth) {
      window.location.href = '/connexion';
      return;
    }

    const authData = JSON.parse(auth);
    const userId = authData.userId || authData.id;

    // Charger les données utilisateur
    fetch(`${API_BASE}/api/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${authData.token}` }
    })
      .then(r => r.json())
      .then(user => {
        setUserData(user);
        // Charger les préférences de notifications (localement pour l'instant)
        const saved = localStorage.getItem(`notifications_${userId}`);
        if (saved) setNotificationSettings(JSON.parse(saved));
      })
      .catch(err => console.error('Erreur chargement données:', err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ CHANGER MOT DE PASSE
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('❌ Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage('❌ Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    const auth = JSON.parse(localStorage.getItem('auth'));
    
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors du changement de mot de passe');
      }

      setMessage('✅ Mot de passe changé avec succès!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  // ✅ SAUVEGARDER NOTIFICATIONS
  const handleNotificationChange = (key) => {
    const updated = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(updated);
    
    const auth = JSON.parse(localStorage.getItem('auth'));
    const userId = auth.userId || auth.id;
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
    setMessage('✅ Préférences sauvegardées');
    setTimeout(() => setMessage(''), 3000);
  };

  // ✅ TÉLÉCHARGER MES DONNÉES
  const handleDownloadData = async () => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    
    try {
      const res = await fetch(`${API_BASE}/api/users/${userData.id}/export-data`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });

      if (!res.ok) throw new Error('Erreur téléchargement');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mes-donnees-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setMessage('✅ Données téléchargées!');
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  // ✅ DÉSACTIVER TEMPORAIREMENT LE COMPTE
  const handleDisableAccount = async () => {
    if (!confirmDisable) {
      setConfirmDisable(true);
      return;
    }

    const auth = JSON.parse(localStorage.getItem('auth'));
    
    try {
      const res = await fetch(`${API_BASE}/api/users/${userData.id}/disable`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        }
      });

      if (!res.ok) throw new Error('Erreur désactivation');

      setMessage('✅ Compte désactivé pour 30 jours');
      setTimeout(() => {
        localStorage.removeItem('auth');
        window.location.href = '/connexion';
      }, 2000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
      setConfirmDisable(false);
    }
  };

  // ✅ SUPPRIMER DÉFINITIVEMENT LE COMPTE
  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    if (!deleteReason) {
      setMessage('❌ Veuillez indiquer une raison');
      return;
    }

    const auth = JSON.parse(localStorage.getItem('auth'));
    
    try {
      const res = await fetch(`${API_BASE}/api/users/${userData.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ reason: deleteReason })
      });

      if (!res.ok) throw new Error('Erreur suppression');

      setMessage('✅ Compte supprimé définitivement');
      setTimeout(() => {
        localStorage.removeItem('auth');
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="settings-page">
          <p>⏳ Chargement...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="settings-page">
        <div className="settings-container">
          <h1 className="settings-title">⚙ Paramètres du compte</h1>

          {/* TABS NAVIGATION */}
          <div className="settings-tabs">
            <button
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Sécurité
            </button>
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profil
            </button>
            <button
              className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 Notifications
            </button>
            <button
              className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              🔐 Confidentialité
            </button>
            <button
              className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              📊 RGPD & Données
            </button>
            <button
              className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              ℹ️ À propos
            </button>
          </div>

          {/* MESSAGE */}
          {message && <div className={`settings-message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

          {/* CONTENT */}
          <div className="settings-content">

            {/* ===== SÉCURITÉ ===== */}
            {activeTab === 'security' && (
              <section className="settings-section">
                <h2>🔒 Sécurité & Accès</h2>

                <div className="settings-card">
                  <h3>Changer mon mot de passe</h3>
                  <form onSubmit={handleChangePassword}>
                    <label>Mot de passe actuel
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        placeholder="Entrez votre mot de passe actuel"
                        required
                      />
                    </label>
                    <label>Nouveau mot de passe
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        placeholder="Min. 8 caractères"
                        required
                      />
                    </label>
                    <label>Confirmer le mot de passe
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        placeholder="Confirmez le nouveau mot de passe"
                        required
                      />
                    </label>
                    <button type="submit" className="btn-primary">Changer le mot de passe</button>
                  </form>
                </div>

                <div className="settings-card info">
                  <p>💡 <strong>Conseil de sécurité:</strong> Utilisez un mot de passe fort avec majuscules, minuscules, chiffres et caractères spéciaux.</p>
                </div>
              </section>
            )}

            {/* ===== PROFIL ===== */}
            {activeTab === 'profile' && (
              <section className="settings-section">
                <h2>👤 Mes informations personnelles</h2>
                <p className="settings-hint">Pour modifier vos informations, allez sur votre profil</p>
                
                <div className="settings-card">
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{userData?.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Nom complet:</span>
                    <span className="value">{userData?.first_name} {userData?.last_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Téléphone:</span>
                    <span className="value">{userData?.phone || '—'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Adresse:</span>
                    <span className="value">{userData?.address || '—'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Type de compte:</span>
                    <span className="value">{userData?.is_pro ? '🏢 Professionnel' : '👤 Particulier'}</span>
                  </div>
                  <button className="btn-secondary" onClick={() => window.location.href = '/profil'}>
                    Modifier mon profil
                  </button>
                </div>
              </section>
            )}

            {/* ===== NOTIFICATIONS ===== */}
            {activeTab === 'notifications' && (
              <section className="settings-section">
                <h2>🔔 Notifications</h2>

                <div className="settings-card">
                  <div className="notification-option">
                    <div className="notification-info">
                      <h4>Messages</h4>
                      <p>Recevoir des notifications pour les nouveaux messages</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={notificationSettings.messages}
                        onChange={() => handleNotificationChange('messages')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="notification-option">
                    <div className="notification-info">
                      <h4>Réservations</h4>
                      <p>Notifications pour les nouvelles réservations et mises à jour</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={notificationSettings.bookings}
                        onChange={() => handleNotificationChange('bookings')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="notification-option">
                    <div className="notification-info">
                      <h4>Newsletter</h4>
                      <p>Recevoir nos actualités et offres spéciales</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={notificationSettings.newsletter}
                        onChange={() => handleNotificationChange('newsletter')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="notification-option">
                    <div className="notification-info">
                      <h4>Notifications push</h4>
                      <p>Recevoir des notifications sur votre appareil</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={notificationSettings.push}
                        onChange={() => handleNotificationChange('push')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </section>
            )}

            {/* ===== CONFIDENTIALITÉ ===== */}
            {activeTab === 'privacy' && (
              <section className="settings-section">
                <h2>🔐 Confidentialité</h2>

                <div className="settings-card">
                  <div className="privacy-option">
                    <div className="privacy-info">
                      <h4>Visibilité du profil</h4>
                      <p>Votre profil est actuellement <strong>public</strong></p>
                    </div>
                    <select className="privacy-select">
                      <option value="public">🌐 Public</option>
                      <option value="private">🔒 Privé</option>
                    </select>
                  </div>

                  <div className="privacy-option">
                    <div className="privacy-info">
                      <h4>Qui peut me contacter</h4>
                      <p>Les autres utilisateurs peuvent vous envoyer des messages</p>
                    </div>
                    <select className="privacy-select">
                      <option value="everyone">👥 Tout le monde</option>
                      <option value="verified">✓ Utilisateurs vérifiés</option>
                      <option value="none">❌ Personne</option>
                    </select>
                  </div>

                  <div className="privacy-option">
                    <div className="privacy-info">
                      <h4>Afficher ma localisation</h4>
                      <p>Partager votre position avec les autres utilisateurs</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </section>
            )}

            {/* ===== RGPD & DONNÉES ===== */}
            {activeTab === 'data' && (
              <section className="settings-section">
                <h2>📊 Mes données (RGPD)</h2>

                <div className="settings-card rgpd-section">
                  <h3>📥 Télécharger mes données</h3>
                  <p>Récupérez une copie de toutes vos données personnelles au format JSON.</p>
                  <button className="btn-outline" onClick={handleDownloadData}>
                    ⬇️ Télécharger mes données
                  </button>
                </div>

                <div className="settings-card rgpd-section">
                  <h3>⏸️ Désactiver temporairement mon compte</h3>
                  <p>Votre compte sera désactivé pour 30 jours. Vous pourrez le réactiver en vous reconnectant.</p>
                  {!confirmDisable ? (
                    <button className="btn-warning" onClick={handleDisableAccount}>
                      ⏸️ Désactiver mon compte
                    </button>
                  ) : (
                    <div className="confirmation-box">
                      <p>⚠️ <strong>Êtes-vous sûr?</strong> Votre compte sera désactivé pendant 30 jours.</p>
                      <div className="confirmation-actions">
                        <button className="btn-danger" onClick={handleDisableAccount}>
                          ✓ Confirmer la désactivation
                        </button>
                        <button className="btn-secondary" onClick={() => setConfirmDisable(false)}>
                          ✗ Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="settings-card rgpd-section danger">
                  <h3>🗑️ Supprimer définitivement mon compte</h3>
                  <p>⚠️ <strong>ATTENTION:</strong> Cette action est irréversible. Toutes vos données seront supprimées.</p>
                  {!confirmDelete ? (
                    <button className="btn-danger" onClick={handleDeleteAccount}>
                      🗑️ Supprimer mon compte
                    </button>
                  ) : (
                    <div className="confirmation-box">
                      <p>⚠️ <strong>DERNIÈRE CONFIRMATION:</strong> Vous êtes sur le point de supprimer définitivement votre compte.</p>
                      <textarea
                        placeholder="Dites-nous pourquoi vous supprimez votre compte (optionnel)..."
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        className="delete-reason"
                      />
                      <div className="confirmation-actions">
                        <button className="btn-danger" onClick={handleDeleteAccount}>
                          ✓ OUI, SUPPRIMER MON COMPTE
                        </button>
                        <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>
                          ✗ Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ===== À PROPOS ===== */}
            {activeTab === 'about' && (
              <section className="settings-section">
                <h2>ℹ️ À propos</h2>

                <div className="settings-card">
                  <h3>📖 Informations légales</h3>
                  <ul className="legal-links">
                    <li>
                      <a href="/legal/terms">
                        📋 Conditions d'utilisation
                      </a>
                    </li>
                    <li>
                      <a href="/legal/privacy">
                        🔐 Politique de confidentialité
                      </a>
                    </li>
                    <li>
                      <a href="/legal/rgpd">
                        ⚖️ Informations RGPD
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="settings-card">
                  <h3>💬 Support & Contact</h3>
                  <p>Besoin d'aide? Contactez-nous:</p>
                  <div className="contact-info">
                    <p>📧 Email: <a href="mailto:support@outilpartage.fr">support@outilpartage.fr</a></p>
                    <p>📱 Tél: <a href="tel:+33123456789">+33 1 23 45 67 89</a></p>
                    <p>💬 Chat support: Disponible en semaine 9h-18h</p>
                  </div>
                </div>

                <div className="settings-card">
                  <h3>ℹ️ Version de l'application</h3>
                  <p>v1.0.0 - MVP 2026</p>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Settings;
