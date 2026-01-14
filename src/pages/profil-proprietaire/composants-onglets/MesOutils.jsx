import React, { useState, useEffect } from 'react'; 
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
  FiRefreshCw
} from 'react-icons/fi';

const MesOutils = ({ userData, setActiveTab }) => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  // Calcul des statistiques basées sur les outils filtrés
  const filteredTools = tools.filter(tool => 
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: tools.length,
    disponible: tools.filter(tool => tool.status === 'available').length,
    loue: tools.filter(tool => tool.status === 'rented').length,
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

  const formatTools = (toolsList) => {
    if (!toolsList || !Array.isArray(toolsList)) return [];
    
    return toolsList.map(tool => ({
      id: tool.id,
      title: tool.title || tool.name || 'Sans titre',
      image: tool.image || tool.images?.[0] || tool.image_url || '/favicon.ico',
      status: tool.status || 'available',
      category: tool.category || tool.category_name || 'Non catégorisé',
      location: tool.location || tool.city || 'Non spécifié',
      dailyPrice: tool.dailyPrice || tool.daily_price || tool.price || 0,
      price: tool.price || tool.daily_price || tool.dailyPrice || 0,
      featured: tool.featured || false
    }));
  };

  const fetchTools = async () => {
    try {
      const authRaw = localStorage.getItem('auth');
      if (!authRaw) return;
      
      const auth = JSON.parse(authRaw);
      const userId = auth.userId || auth.id;
      
      const headers = {};
      if (auth.token) {
        headers['Authorization'] = `Bearer ${auth.token}`;
      }
      
      // Essayer plusieurs endpoints possibles
      let toolsData = [];
      
      // Option 1: Endpoint spécifique pour les outils de l'utilisateur
      try {
        const response = await fetch(`${API_BASE}/api/users/${userId}/equipments`, { headers });
        if (response.ok) {
          toolsData = await response.json();
        } else {
          console.log('Endpoint /api/users/{id}/equipments non disponible');
        }
      } catch (err) {
        console.log('Erreur avec endpoint 1:', err);
      }
      
      // Option 2: Endpoint général avec filtre par user_id
      if (!toolsData.length) {
        try {
          const response = await fetch(`${API_BASE}/api/equipments?user_id=${userId}`, { headers });
          if (response.ok) {
            const allEquipments = await response.json();
            // Filtrer pour ne garder que ceux de l'utilisateur
            toolsData = allEquipments.filter(eq => eq.user_id === userId);
          }
        } catch (err) {
          console.log('Erreur avec endpoint 2:', err);
        }
      }
      
      // Option 3: Vérifier si userData a déjà les listings
      if (!toolsData.length && userData?.listings) {
        toolsData = userData.listings;
      }
      
      setTools(formatTools(toolsData));
      
      // Si toujours vide, essayer de voir si l'API retourne quelque chose
      if (!toolsData.length) {
        console.log('Aucun outil trouvé pour l\'utilisateur:', userId);
        console.log('Vérifiez les endpoints API disponibles');
      }
      
    } catch (err) {
      console.error('Erreur lors du chargement des outils:', err);
      // En cas d'erreur, utiliser les données de userData si disponibles
      if (userData?.listings) {
        setTools(formatTools(userData.listings));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [userData]);

  if (loading) {
    return (
      <div className="mes-outils-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de vos outils...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mes-outils-tab">
      {/* En-tête avec statistiques */}
      <div className="outils-header">
        <div className="header-content">
          <div className="header-title">
            <h1><FiTool /> Mes outils</h1>
            <p>Gérez tous vos outils disponibles à la location</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-publish-primary"
              onClick={() => window.location.href = '/publish'}
            >
              <FiPlus /> Publier un nouvel outil
            </button>
          </div>
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
          <input 
            type="text" 
            placeholder="Rechercher un outil..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <div className="search-info">
            <span>{filteredTools.length} outil(s) trouvé(s) pour "{searchTerm}"</span>
          </div>
        )}
      </div>

      {/* Liste/Grille d'outils */}
      <div className="outils-grid-container">
        {filteredTools.length > 0 ? (
          <div className="tools-grid">
            {filteredTools.map(tool => (
              <div key={tool.id} className="outil-card">
                {/* Image de l'outil */}
                <div className="outil-image-container">
                  <img 
                    src={tool.image} 
                    alt={tool.title}
                    className="outil-image"
                    onError={(e) => {
                      e.target.src = '/favicon.ico';
                    }}
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
                    <button className="btn-quick-view" onClick={() => window.location.href = `/equipments/${tool.id}`}>
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
        ) : (
          <div className="empty-outils">
            <div className="empty-icon">
              <FiTool size={64} />
            </div>
            {searchTerm ? (
              <>
                <h3>Aucun outil trouvé</h3>
                <p>Aucun outil ne correspond à votre recherche "{searchTerm}"</p>
                <button 
                  className="btn-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  Réinitialiser la recherche
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesOutils;
