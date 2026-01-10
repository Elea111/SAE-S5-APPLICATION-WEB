import React, { useState } from 'react';
import './Parametre.css';
import { FiLogOut, FiArrowLeft, FiBell, FiLock, FiUser, FiShield, FiMail, FiHelpCircle, FiGlobe, FiSave } from 'react-icons/fi';

const Parametre = ({ handleLogout, handleDeleteAccount }) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [message, setMessage] = useState('');
  
  // États pour les notifications
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    reminders: true,
    promotions: false,
    reviews: true
  });
  
  // États pour la confidentialité
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    hideContact: false,
    shareStats: true
  });
  
  // États pour les préférences
  const [preferences, setPreferences] = useState({
    language: 'fr',
    currency: 'EUR',
    timezone: 'europe/paris'
  });

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePrivacyChange = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePreferenceChange = (setting, value) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveNotificationSettings = () => {
    // Ici, vous pourriez envoyer les paramètres à votre API
    console.log('Sauvegarde des paramètres de notification:', notificationSettings);
    setMessage('Paramètres de notification enregistrés avec succès !');
    setTimeout(() => {
      setMessage('');
      setSelectedSection(null);
    }, 2000);
  };

  const savePrivacySettings = () => {
    // Ici, vous pourriez envoyer les paramètres à votre API
    console.log('Sauvegarde des paramètres de confidentialité:', privacySettings);
    setMessage('Paramètres de confidentialité enregistrés avec succès !');
    setTimeout(() => {
      setMessage('');
      setSelectedSection(null);
    }, 2000);
  };

  const savePreferences = () => {
    // Ici, vous pourriez envoyer les paramètres à votre API
    console.log('Sauvegarde des préférences:', preferences);
    setMessage('Préférences enregistrées avec succès !');
    setTimeout(() => {
      setMessage('');
      setSelectedSection(null);
    }, 2000);
  };

  const sections = {
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
                  checked={notificationSettings.promotions}
                  onChange={() => handleNotificationChange('promotions')}
                />
                <div className="setting-info">
                  <span className="setting-title">Promotions et offres</span>
                  <span className="setting-desc">Recevoir des offres spéciales et des nouvelles fonctionnalités</span>
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
          </div>
          <div className="section-actions">
            <button className="btn-save" onClick={saveNotificationSettings}>
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
                  onChange={() => handlePrivacyChange('profileVisible')}
                />
                <div className="setting-info">
                  <span className="setting-title">Profil visible par tous</span>
                  <span className="setting-desc">Votre profil apparaît dans les résultats de recherche</span>
                </div>
              </label>
            </div>
            <div className="setting-item expanded">
              <label>
                <input 
                  type="checkbox" 
                  checked={privacySettings.hideContact}
                  onChange={() => handlePrivacyChange('hideContact')}
                />
                <div className="setting-info">
                  <span className="setting-title">Cacher mes coordonnées</span>
                  <span className="setting-desc">Votre numéro de téléphone ne sera pas visible publiquement</span>
                </div>
              </label>
            </div>
            <div className="setting-item expanded">
              <label>
                <input 
                  type="checkbox" 
                  checked={privacySettings.shareStats}
                  onChange={() => handlePrivacyChange('shareStats')}
                />
                <div className="setting-info">
                  <span className="setting-title">Partager les statistiques d'utilisation</span>
                  <span className="setting-desc">Aidez-nous à améliorer notre service (données anonymisées)</span>
                </div>
              </label>
            </div>
            <div className="privacy-note">
              <FiShield />
              <span>Nous protégeons vos données conformément au RGPD. <a href="#">En savoir plus</a></span>
            </div>
          </div>
          <div className="section-actions">
            <button className="btn-save" onClick={savePrivacySettings}>
              <FiSave /> Enregistrer les paramètres
            </button>
          </div>
        </div>
      )
    },
    preferences: {
      title: "Préférences",
      icon: <FiGlobe />,
      content: (
        <div className="section-content">
          <h4>Personnalisez votre expérience</h4>
          <p>Adaptez la plateforme à vos besoins et préférences.</p>
          <div className="settings-list">
            <div className="setting-item expanded">
              <label>
                <div className="setting-info">
                  <span className="setting-title">Langue</span>
                  <select 
                    className="language-select"
                    value={preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </label>
            </div>
            <div className="setting-item expanded">
              <label>
                <div className="setting-info">
                  <span className="setting-title">Devise</span>
                  <select 
                    className="currency-select"
                    value={preferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar US ($)</option>
                    <option value="GBP">Livre sterling (£)</option>
                  </select>
                </div>
              </label>
            </div>
            <div className="setting-item expanded">
              <label>
                <div className="setting-info">
                  <span className="setting-title">Fuseau horaire</span>
                  <select 
                    className="timezone-select"
                    value={preferences.timezone}
                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  >
                    <option value="europe/paris">Europe/Paris (UTC+1)</option>
                    <option value="utc">UTC</option>
                    <option value="america/new_york">America/New York (UTC-5)</option>
                  </select>
                </div>
              </label>
            </div>
          </div>
          <div className="section-actions">
            <button className="btn-save" onClick={savePreferences}>
              <FiSave /> Enregistrer les préférences
            </button>
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
              <div className="danger-actions">
                <button className="btn-outline" onClick={handleLogout}>
                  <FiLogOut /> Se déconnecter
                </button>
                <button className="btn-danger" onClick={handleDeleteAccount}>
                  Supprimer mon compte
                </button>
              </div>
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
              <FiMail />
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
    }
  };

  const handleSectionClick = (sectionKey) => {
    setSelectedSection(sectionKey);
    setMessage('');
  };

  const handleBack = () => {
    setSelectedSection(null);
    setMessage('');
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
        <div className="settings-message success">
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