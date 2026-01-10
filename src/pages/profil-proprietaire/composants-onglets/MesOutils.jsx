import React from 'react';
import './MesOutils.css';
import { 
  FiTool, 
  FiPlus, 
  FiEye, 
  FiEdit2, 
  FiCalendar,
  FiMapPin,
  FiTag,
  FiSearch,
} from 'react-icons/fi';

const MesOutils = ({ userData, setActiveTab }) => {
  // Calcul des statistiques
  const stats = {
    total: userData.listings?.length || 0,
    disponible: userData.listings?.filter(tool => tool.status === 'available').length || 0,
    loue: userData.listings?.filter(tool => tool.status === 'rented').length || 0,
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return '#059618ff';
      case 'rented': return '#e17055';
      case 'maintenance': return '#fdcb6e';
      default: return '#999e48';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'available': return 'Disponible';
      case 'rented': return 'Loué';
      case 'maintenance': return 'Maintenance';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="mes-outils-tab">
      {/* En-tête avec statistiques */}
      <div className="outils-header">
        <div className="header-content">
          <div className="header-title">
            <h1><FiTool /> Mes outils</h1>
            <p>Gérez tous vos outils disponibles à la location</p>
          </div>
          <button 
            className="btn-publish-primary"
            onClick={() => window.location.href = '/publish'}
          >
            <FiPlus /> Publier un nouvel outil
          </button>
        </div>

        {/* Statistiques */}
        <div className="outils-stats">
          <div className="stat-card">
            <div className="stat-icon total">
              <FiTool />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Outils total</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon available">
              <FiTool />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.disponible}</span>
              <span className="stat-label">Disponibles</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rented">
              <FiCalendar />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.loue}</span>
              <span className="stat-label">En location</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="outils-toolbar">
        <div className="search-bar">
          <FiSearch />
          <input type="text" placeholder="Rechercher un outil..." />
        </div>
      </div>

      {/* Liste/Grille d'outils */}
      <div className="outils-grid-container">
        {userData.listings && userData.listings.length > 0 ? (
          <>
            <div className="tools-grid">
              {userData.listings.map(tool => (
                <div key={tool.id} className="outil-card">
                  {/* Image de l'outil */}
                  <div className="outil-image-container">
                    <img 
                      src={tool.image || '/favicon.ico'} 
                      alt={tool.title}
                      className="outil-image"
                    />

                    <div 
                      className="status-badge floating"
                      style={{ backgroundColor: getStatusColor(tool.status) }}
                    >
                      {getStatusText(tool.status)}
                    </div>
                    
                    {tool.featured && (
                      <div className="featured-badge floating">
                        <FiTag /> En vedette
                      </div>
                    )}

                    <div className="image-overlay">
                      <button className="btn-quick-view">
                        <FiEye /> Voir
                      </button>
                    </div>
                  </div>

                  {/* Contenu de la carte */}
                  <div className="outil-content">
                    <h3 className="outil-title">{tool.title}</h3>
                    
                    <div className="outil-meta">
                      <div className="meta-item">
                        <FiTag />
                        <span>Catégorie: {tool.category || 'Non spécifiée'}</span>
                      </div>
                      {tool.location && (
                        <div className="meta-item">
                          <FiMapPin />
                          <span>{tool.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="outil-details">
                      <div className="price-section">
                        <span className="price-value">{tool.dailyPrice || tool.price}€ / jour</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="outil-actions">
                      <button 
                        className="btn-action view"
                        onClick={() => window.location.href = `/equipments/${tool.id}`}
                      >
                        <FiEye /> Détails
                      </button>
                      <button 
                        className="btn-action edit"
                        onClick={() => window.location.href = `/edit-listing?item=${tool.id}`}
                      >
                        <FiEdit2 /> Modifier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          
          <div className="empty-outils">
            <div className="empty-icon">
              <FiTool size={64} />
            </div>
            <h3>Aucun outil publié</h3>
            <p>Commencez à générer des revenus en publiant vos outils inutilisés.</p>
            <div className="empty-actions">
              <button 
                className="btn-publish-primary"
                onClick={() => window.location.href = '/publish'}
              >
                <FiPlus /> Publier mon premier outil
              </button>
              <button 
                className="btn-secondary"
                onClick={() => window.location.href = '/search'}
              >
                <FiEye /> Voir les outils disponibles
              </button>
            </div>
            <div className="empty-tips">
              <h4>Conseils pour réussir :</h4>
              <ul>
                <li>Ajoutez des photos de qualité</li>
                <li>Décrivez précisément votre outil</li>
                <li>Fixez un prix compétitif</li>
                <li>Répondez rapidement aux demandes</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MesOutils;