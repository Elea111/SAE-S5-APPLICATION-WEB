import React, { useState } from 'react';
import './Parametre.css';
import { 
  FiLogOut, FiArrowLeft, FiBell, FiLock, FiUser, FiShield, 
  FiMail, FiHelpCircle, FiGlobe, FiSave, FiKey, FiDownload, 
  FiPauseCircle, FiEye, FiEyeOff, FiMapPin, FiMessageSquare 
} from 'react-icons/fi';

const Parametre = ({ handleLogout, handleDeleteAccount }) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [message, setMessage] = useState('');
  
  // États pour les notifications
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    reminders: true,
    promotions: false,
    reviews: true,
    messages: true,
    push: true
  });
  
  // États pour la confidentialité
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    hideContact: false,
    shareStats: true,
    showLocation: true,
    whoCanContact: 'everyone' // everyone, verified, none
  });

  // États pour le changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // États pour la suppression de compte
  const [deleteReason, setDeleteReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // Fonction pour changer le mot de passe
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

    try {
      // Ici, vous pourriez appeler l'API pour changer le mot de passe
      console.log('Changement de mot de passe:', passwordForm);
      
      setMessage('✅ Mot de passe changé avec succès!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        setMessage('');
        setSelectedSection(null);
      }, 2000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  // Fonction pour télécharger les données
  const handleDownloadData = () => {
    // Simuler le téléchargement des données
    const data = {
      user: "Données utilisateur",
      tools: "Outils publiés",
      bookings: "Réservations",
      reviews: "Avis",
      createdAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mes-donnees-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setMessage('✅ Données téléchargées avec succès!');
    setTimeout(() => setMessage(''), 2000);
  };

  // Fonction pour désactiver le compte temporairement
  const handleDisableAccount = () => {
    if (!confirmDisable) {
      setConfirmDisable(true);
      return;
    }

    // Ici, vous pourriez appeler l'API pour désactiver le compte
    console.log('Compte désactivé temporairement');
    setMessage('✅ Compte désactivé pour 30 jours');
    
    setTimeout(() => {
      localStorage.removeItem('auth');
      window.location.href = '/connexion';
    }, 2000);
  };

  const sections = {
    security: {
      title: "Sécurité",
      icon: <FiKey />,
      content: (
        <div className="section-content">
          <h4>Sécurité du compte</h4>
          <p>Gérez la sécurité de votre compte et votre mot de passe.</p>
          <form onSubmit={handleChangePassword} className="password-form">
            <div className="form-group">
              <label>Mot de passe actuel</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Votre mot de passe actuel"
                required
              />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Minimum 8 caractères"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Retapez le nouveau mot de passe"
                required
              />
            </div>
            <div className="section-actions">
              <button type="submit" className="btn-save">
                <FiSave /> Changer le mot de passe
              </button>
            </div>
          </form>
          <div className="security-tip">
            <FiShield />
            <span>Utilisez un mot de passe fort avec majuscules, minuscules, chiffres et caractères spéciaux.</span>
          </div>
        </div>
      )
    },
    notifications: {
      title: "Notifications",
      icon: <FiBell />,
      content: (
        <div className="section-content">
          <h4>Gérer vos préférences de notification</h4>
          <p>Choisissez comment vous souhaitez être informé des activités sur votre compte.</p>
          <div className="settings-list">
            <div className="setting-item expanded">
              <label>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.email}
                  onChange={() => handleNotificationChange('email')}
                />
                <div className="setting-info">
                  <span className="setting-title">Notifications par email</span>
                  <span className="setting-desc">Recevez des emails pour les nouvelles réservations et messages</span>
                </div>
              </label>
            </div>
            <div className="setting-item expanded">
              <label>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.reminders}
                  onChange={() => handleNotificationChange('reminders')}
                />
                <div className="setting-info">
                  <span className="setting-title">Rappels de réservation</span>
                  <span className="setting-desc">Notifications avant le début et la fin d'une location</span>
                </div>
              </label>
            </div>
            <div className="setting-item expanded">
              <label>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.messages}
                  onChange={() => handleNotificationChange('messages')}
                />
                <div className="setting-info">
                  <span className="setting-title">Messages</span>
                  <span className="setting-desc">Recevoir des notifications pour les nouveaux messages</span>
                </div>
              </label>
            </div>
            <div className="setting-item expanded">
              <label>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.reviews}
                  onChange={() => handleNotificationChange('reviews')}
                />
                <div className="setting-info">
                  <span className="setting-title">Avis des locataires</span>
                  <span className="setting-desc">Être notifié lorsqu'un locataire laisse un avis</span>
                </div>
              </label>
            </div>
            <div className="setting-item expanded">
              <label>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.push}
                  onChange={() => handleNotificationChange('push')}
                />
                <div className="setting-info">
                  <span className="setting-title">Notifications push</span>
                  <span className="setting-desc">Recevoir des notifications sur votre appareil</span>
                </div>
              </label>
            </div>
          </div>
          <div className="section-actions">
            <button className="btn-save" onClick={() => {
              console.log('Notifications sauvegardées:', notificationSettings);
              setMessage('✅ Paramètres de notification enregistrés');
              setTimeout(() => setMessage(''), 2000);
            }}>
              <FiSave /> Enregistrer les paramètres
            </button>
          </div>
        </div>
      )
    },
    privacy: {
      title: "Confidentialité",
      icon: <FiLock />,
      content: (
        <div className="section-content">
          <h4>Contrôlez votre vie privée</h4>
          <p>Gérez qui peut voir vos informations et comment elles sont utilisées.</p>
          <div className="settings-list">
            <div className="setting-item expanded">
              <label>
                <input 
                  type="checkbox" 
                  checked={privacySettings.profileVisible}
                  onChange={() => handlePrivacyChange('profileVisible', !privacySettings.profileVisible)}
                />
                <div className="setting-info">
                  <span className="setting-title">Profil visible par tous</span>
                  <span className="setting-desc">Votre profil apparaît dans les résultats de recherche</span>
                </div>
              </label>
            </div>
            <div className="setting-item expanded">
              <label>
                <div className="setting-info">
                  <span className="setting-title">Qui peut me contacter</span>
                  <span className="setting-desc">Contrôlez qui peut vous envoyer des messages</span>
                </div>
                <select 
                  value={privacySettings.whoCanContact}
                  onChange={(e) => handlePrivacyChange('whoCanContact', e.target.value)}
                  className="privacy-select"
                >
                  <option value="everyone">👥 Tout le monde</option>
                  <option value="verified">✓ Utilisateurs vérifiés</option>
                  <option value="none">❌ Personne</option>
                </select>
              </label>
            </div>
            <div className="setting-item expanded">
              <label>
                <input 
                  type="checkbox" 
                  checked={privacySettings.showLocation}
                  onChange={() => handlePrivacyChange('showLocation', !privacySettings.showLocation)}
                />
                <div className="setting-info">
                  <span className="setting-title">
                    <FiMapPin /> Afficher ma localisation
                  </span>
                  <span className="setting-desc">Partager votre position avec les autres utilisateurs</span>
                </div>
              </label>
            </div>
            <div className="privacy-note">
              <FiShield />
              <span>Nous protégeons vos données conformément au RGPD. <a href="#">En savoir plus</a></span>
            </div>
          </div>
          <div className="section-actions">
            <button className="btn-save" onClick={() => {
              console.log('Confidentialité sauvegardée:', privacySettings);
              setMessage('✅ Paramètres de confidentialité enregistrés');
              setTimeout(() => setMessage(''), 2000);
            }}>
              <FiSave /> Enregistrer les paramètres
            </button>
          </div>
        </div>
      )
    },
    data: {
      title: "Mes données",
      icon: <FiDownload />,
      content: (
        <div className="section-content">
          <h4>Gestion de vos données (RGPD)</h4>
          <p>Contrôlez vos données personnelles conformément au RGPD.</p>
          
          <div className="data-options">
            <div className="data-option">
              <h5><FiDownload /> Télécharger mes données</h5>
              <p>Récupérez une copie de toutes vos données personnelles au format JSON.</p>
              <button className="btn-outline" onClick={handleDownloadData}>
                Télécharger mes données
              </button>
            </div>
          </div>
          
          <div className="account-warning">
            <div className="warning-section">
              <h5><FiPauseCircle /> Désactiver temporairement mon compte</h5>
              <p>Votre compte sera désactivé pour 30 jours. Vous pourrez le réactiver en vous reconnectant.</p>
              {!confirmDisable ? (
                <button className="btn-warning" onClick={() => setConfirmDisable(true)}>
                  Désactiver mon compte
                </button>
              ) : (
                <div className="confirmation-box">
                  <p>⚠️ <strong>Êtes-vous sûr?</strong> Votre compte sera désactivé pendant 30 jours.</p>
                  <div className="confirmation-actions">
                    <button className="btn-danger" onClick={handleDisableAccount}>
                      Confirmer la désactivation
                    </button>
                    <button className="btn-secondary" onClick={() => setConfirmDisable(false)}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    help: {
      title: "Aide & Support",
      icon: <FiHelpCircle />,
      content: (
        <div className="section-content">
          <h4>Nous sommes là pour vous aider</h4>
          <p>Trouvez des réponses à vos questions et contactez notre support.</p>
          <div className="help-options">
            <a href="#" className="help-option">
              <FiMail />
              <div>
                <h5>Centre d'aide</h5>
                <p>Consultez notre FAQ et nos guides</p>
              </div>
            </a>
            <a href="#" className="help-option">
              <FiMessageSquare />
              <div>
                <h5>Contactez-nous</h5>
                <p>Envoyez-nous un message</p>
              </div>
            </a>
            <a href="#" className="help-option">
              <FiHelpCircle />
              <div>
                <h5>Conditions d'utilisation</h5>
                <p>Lisez nos conditions générales</p>
              </div>
            </a>
          </div>
        </div>
      )
    },
    account: {
      title: "Compte",
      icon: <FiUser />,
      content: (
        <div className="section-content">
          <h4>Gestion de votre compte</h4>
          <p>Modifiez les paramètres liés à votre compte et votre sécurité.</p>
          <div className="account-actions">
            <div className="account-action-item danger">
              <h5>Zone dangereuse</h5>
              <p>Actions irréversibles concernant votre compte</p>
              
              {!confirmDelete ? (
                <>
                  <div className="danger-actions">
                    <button className="btn-outline" onClick={handleLogout}>
                      <FiLogOut /> Se déconnecter
                    </button>
                    <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
                      Supprimer mon compte
                    </button>
                  </div>
                </>
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
                    <button className="btn-danger" onClick={() => {
                      setConfirmDelete(false);
                      handleDeleteAccount();
                    }}>
                      ✓ OUI, SUPPRIMER MON COMPTE
                    </button>
                    <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>
                      ✗ Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  };

  const handleSectionClick = (sectionKey) => {
    setSelectedSection(sectionKey);
    setMessage('');
    // Réinitialiser les confirmations
    setConfirmDelete(false);
    setConfirmDisable(false);
  };

  const handleBack = () => {
    setSelectedSection(null);
    setMessage('');
    setConfirmDelete(false);
    setConfirmDisable(false);
  };

  return (
    <div className="settings-tab">
      <div className="settings-header">
        <h2>Paramètres</h2>
        {selectedSection && (
          <button className="back-btn" onClick={handleBack}>
            <FiArrowLeft /> Retour à tous les paramètres
          </button>
        )}
      </div>
      
      {message && (
        <div className={`settings-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      {selectedSection ? (
        <div className="section-detail-view">
          <div className="section-header">
            <div className="section-icon">
              {sections[selectedSection].icon}
            </div>
            <h3>{sections[selectedSection].title}</h3>
          </div>
          {sections[selectedSection].content}
        </div>
      ) : (
        <div className="settings-grid">
          {Object.entries(sections).map(([key, section]) => (
            <div 
              key={key} 
              className="settings-section-card"
              onClick={() => handleSectionClick(key)}
            >
              <div className="section-card-icon">
                {section.icon}
              </div>
              <div className="section-card-content">
                <h3>{section.title}</h3>
              </div>
              <div className="section-card-arrow">
                →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Parametre;