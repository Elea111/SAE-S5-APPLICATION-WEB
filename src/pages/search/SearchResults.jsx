import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import Ecology from '../../components/layout/ecology/Ecology';
import './SearchResults.css';

const CATEGORIES = [
  { slug: 'electroportatif', name: 'Électroportatif', icon: '🔌' },
  { slug: 'jardinage', name: 'Jardinage', icon: '🌱' },
  { slug: 'construction', name: 'Construction', icon: '🔨' },
  { slug: 'nettoyage', name: 'Nettoyage', icon: '🧹' },
  { slug: 'soudure', name: 'Soudure', icon: '⚡' },
  { slug: 'mesure', name: 'Mesure', icon: '📏' },
  { slug: 'peinture', name: 'Peinture', icon: '🎨' },
  { slug: 'autre', name: 'Autre', icon: '📦' }
];

const INITIAL_FILTERS = {
  categories: [],
  priceRange: { min: 0, max: 500 },
  rating: 0,
  availability: 'all'
};

const SearchResults = () => {
  const [q, setQ] = useState(() => 
    new URLSearchParams(window.location.search).get('q') || ''
  );
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState('relevance');

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  // ✅ CHARGER TOUS LES EQUIPEMENTS PAR DEFAUT
  useEffect(() => {
    const doSearch = async () => {
      setLoading(true);
      try {
        const searchQuery = new URLSearchParams(window.location.search).get('q') || '';
        const queryParam = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
        
        console.log('📥 Fetching from:', `${API_BASE}/api/equipments${queryParam}`);

        const res = await fetch(`${API_BASE}/api/equipments${queryParam}`);
        if (res.ok) {
          const data = await res.json();
          
          // ✅ FILTRER LES ITEMS PERSONNELS (MASQUER SES PROPRES ITEMS)
          const auth = JSON.parse(localStorage.getItem('auth') || '{}');
          const currentUserId = auth.userId || auth.id;
          
          console.log('🔍 Current User ID:', currentUserId, 'Auth:', auth);
          
          const rawData = Array.isArray(data) ? data : (data.items || []);
          
          const filteredData = rawData.filter(item => {
            const itemOwnerId = item.ownerId || item.owner_id || item.user_id;
            console.log('📦 Item:', item.id, 'Owner:', itemOwnerId, 'Current User:', currentUserId, 'Filter:', itemOwnerId !== currentUserId);
            return itemOwnerId !== currentUserId;
          });
          
          console.log('✅ Equipments loaded:', filteredData.length, 'Total:', rawData.length, '(filtered out:', rawData.length - filteredData.length, ')');
          setResults(filteredData);
        } else {
          console.error('❌ API error:', res.status);
          setResults([]);
        }
      } catch (error) {
        console.error('❌ Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    doSearch();
  }, [API_BASE]);

  // ✅ RECHERCHE VIA FORMULAIRE
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (!q.trim()) return;
    
    const searchUrl = `?q=${encodeURIComponent(q)}`;
    if (window.location.search !== searchUrl) {
      window.location.search = searchUrl;
    }
  }, [q]);

  const handleViewDetails = useCallback((id) => {
    window.location.href = `/equipments/${id}`;
  }, []);

  // ✅ REDIRECTION VERS LE PROFIL DU PROPRIETAIRE
  const handleViewProfile = useCallback((ownerId, ownerName) => {
    if (!ownerId) {
      console.error('❌ Pas de propriétaire trouvé');
      return;
    }
    window.location.href = `/profil-proprietaire?userId=${ownerId}`;
  }, []);

  // ✅ OUVRIR LES MESSAGES
  const handleSendMessage = useCallback((ownerId, ownerName, itemId) => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.token) {
      window.location.href = '/connexion';
      return;
    }
    // Rediriger vers la page de messages avec le propriétaire et l'item
    window.location.href = `/messages?userId=${ownerId}&itemId=${itemId}`;
  }, []);

  // ✅ CORRIGER : Redirection vers le profil du propriétaire
  const handleViewOwner = useCallback((ownerId) => {
    if (!ownerId) {
      console.error('❌ Pas de propriétaire trouvé');
      return;
    }
    console.log('📍 Redirection vers profil:', ownerId);
    window.location.href = `/profil?userId=${ownerId}`;
  }, []);

  // ✅ CORRIGER : Redirection vers la page de réservation
  const handleReserve = useCallback((equipmentId) => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.token) {
      console.log('❌ Pas connecté, redirection vers connexion');
      window.location.href = '/connexion';
      return;
    }
    console.log('📅 Redirection vers réservation:', equipmentId);
    // ✅ VERIFIER QUE C'EST BIEN /reservation (pas /booking, /reserve, etc.)
    window.location.href = `/reservation?equipmentId=${equipmentId}`;
  }, []);

  const handleResetSearch = useCallback(() => {
    setQ('');
    setFilters(INITIAL_FILTERS);
    window.location.search = '';
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // ✅ FILTRAGE ET TRI DES RESULTATS
  const filteredResults = useMemo(() => {
    return results
      .filter(item => {
        // Filtre catégorie - comparer avec category_slug du backend
        if (filters.categories.length > 0) {
          const itemCategorySlug = item.category_slug || item.category_id; // Slug de la catégorie
          if (!filters.categories.includes(itemCategorySlug)) {
            return false;
          }
        }
        
        // Filtre prix
        const price = item.daily_price || 0;
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          return false;
        }
        
        // Filtre rating
        const rating = item.owner_rating || item.ownerRating || 0;
        if (filters.rating > 0 && rating < filters.rating) {
          return false;
        }
        
        // Filtre disponibilité
        if (filters.availability === 'available' && !item.is_available) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        const priceA = a.daily_price || 0;
        const priceB = b.daily_price || 0;
        
        switch (sortBy) {
          case 'price_asc':
            return priceA - priceB;
          case 'price_desc':
            return priceB - priceA;
          case 'rating':
            return (b.owner_rating || 0) - (a.owner_rating || 0);
          case 'recent':
            return new Date(b.created_at) - new Date(a.created_at);
          default:
            return 0;
        }
      });
  }, [results, filters, sortBy]);

  // ✅ COMPOSANTS INTERNES
  const SearchBar = () => (
    <form className="search-form" onSubmit={handleSearch}>
      <div className="search-input-container">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un outil"
          className="search-input"
        />
        <button type="submit" className="search-button">
          Rechercher
        </button>
      </div>
    </form>
  );

  const CategoryFilter = () => (
    <div className="filter-section">
      <h4>Catégories</h4>
      <div className="category-list">
        {CATEGORIES.map(cat => {
          const isSelected = filters.categories.includes(cat.slug);
          return (
            <label key={cat.slug} className="category-item">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  setFilters(prev => ({
                    ...prev,
                    categories: e.target.checked
                      ? [...prev.categories, cat.slug]
                      : prev.categories.filter(c => c !== cat.slug)
                  }));
                }}
              />
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const PriceFilter = () => (
    <div className="filter-section">
      <h4>Prix (€/jour)</h4>
      <div className="price-range-filter">
        <div className="price-inputs-group">
          {[['min', 'Minimum'], ['max', 'Maximum']].map(([key, label]) => (
            <div key={key} className="price-input-wrapper">
              <label className="price-label">{label}</label>
              <div className="price-input-container">
                <span className="price-currency">€</span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={filters.priceRange[key]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: {
                      ...prev.priceRange,
                      [key]: parseInt(e.target.value) || 0
                    }
                  }))}
                  className="price-input"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RatingFilter = () => (
    <div className="filter-section">
      <h4>Note minimale</h4>
      <div className="rating-filters">
        {[4, 3, 2, 1].map(rating => (
          <button
            key={rating}
            className={`rating-filter ${filters.rating === rating ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({
              ...prev,
              rating: prev.rating === rating ? 0 : rating
            }))}
          >
            {rating} + ★
          </button>
        ))}
      </div>
    </div>
  );

  const ResultCard = ({ item }) => {
    const imageUrl = item.image_url || item.image || item.thumbnail || '/default-tool.jpg';
    const ownerName = item.owner_name || item.ownerName || 'Propriétaire inconnu';
    const ownerAvatar = item.owner_avatar || item.ownerAvatar || '/favicon.ico';
    const ownerId = item.ownerId || item.owner_id || item.user_id;
    const categoryName = item.category_name || 'Catégorie';
    const categoryIcon = item.category_icon || '📦';
    
    // ✅ DEBUG: Afficher les données de l'item pour vérifier les avis
    console.log('📊 ResultCard DEBUG - Item data:', {
      ownerName,
      owner_rating: item.owner_rating,
      ownerRating: item.ownerRating,
      owner_reviews: item.owner_reviews,
      ownerReviews: item.ownerReviews,
      review_count: item.review_count,
      allUserData: item.users,
      fullItem: item
    });
    
    return (
      <div className="result-card">
        <div className="result-image-container">
          <img 
            src={imageUrl}
            alt={item.title || item.name} 
            className="result-image" 
            onError={(e) => { e.target.src = '/default-tool.jpg'; }}
          />
          <div className="result-status-badge">
            {item.is_available ? '✅ Disponible' : '❌ Indisponible'}
          </div>
          {categoryName && (
            <div className="result-category-badge">
              {categoryIcon} {categoryName}
            </div>
          )}
        </div>
        
        <div className="result-content">
          <div className="result-header">
            <h3 className="result-title">{item.title || item.name}</h3>
          </div>
          
          {item.description && (
            <p className="result-description">{item.description.substring(0, 120)}...</p>
          )}
          
          <div className="result-meta">
            <div className="result-condition">
              État: <strong>{item.condition || 'bon'}</strong>
            </div>
          </div>
          
          <div className="result-owner">
            <img src={ownerAvatar} alt={ownerName} className="owner-avatar" />
            <div className="owner-info">
              <span className="owner-name">{ownerName}</span>
              <div className="owner-rating">
                {(item.owner_rating || item.ownerRating || 0).toFixed(1)} ★
                <span className="rating-count">({item.owner_reviews || item.ownerReviews || item.review_count || 0})</span>
              </div>
            </div>
            <button 
              className="profile-btn"
              onClick={() => handleViewProfile(ownerId, ownerName)}
              title="Voir le profil du propriétaire"
            >
              👤
            </button>
          </div>
          
          <div className="result-footer">
            <div className="result-price">
              <span className="price">{item.daily_price || item.price || 0}€</span>
              <span className="period">/ jour</span>
            </div>
            
            <div className="result-actions">
              <button 
                className="message-btn"
                onClick={() => handleSendMessage(ownerId, ownerName, item.id)}
                title="Envoyer un message au propriétaire"
              >
                💬 Message
              </button>
              <button 
                className="reserve-btn" 
                onClick={() => {
                  console.log('🛒 Réserver:', item.id);
                  handleReserve(item.id);
                }}
              >
                📅 Réserver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadingState = () => (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>Chargement des équipements...</p>
    </div>
  );

  const NoResults = () => (
    <div className="no-results">
      <div className="no-results-icon">🔍</div>
      <h3>{q ? 'Aucun résultat trouvé' : 'Aucun équipement disponible'}</h3>
      <p>
        {q 
          ? 'Essayez avec d\'autres termes de recherche ou ajustez vos filtres.'
          : 'Revenez plus tard ou explorez d\'autres catégories.'
        }
      </p>
      {q && (
        <button className="reset-search" onClick={handleResetSearch}>
          Réinitialiser la recherche
        </button>
      )}
    </div>
  );

  return (
    <>
      <Header />
      <div className="search-results-page">
        {/* Hero Section */}
        <div className="search-hero">
        <h1 className="hero-title">Trouvez l'outil pour votre projet</h1>
        <p className="hero-subtitle">Des milliers d'outils disponibles près de chez vous</p>
        <SearchBar />
      </div>

      <div className="search-content">
        {/* Filters Sidebar */}
        <div className="filters-sidebar">
          <div className="filters-header">
            <h3 className="filters-title">Filtres</h3>
            {filters.categories.length > 0 && (
              <span className="category-selected-badge">
                {filters.categories.length}
              </span>
            )}
          </div>
          
          <CategoryFilter />
          <PriceFilter />
          <RatingFilter />
          
          <div className="filter-section">
            <h4>Disponibilité</h4>
            <select
              value={filters.availability}
              onChange={(e) => setFilters(prev => ({...prev, availability: e.target.value}))}
              className="availability-select"
            >
              <option value="all">Tous</option>
              <option value="available">Disponibles</option>
            </select>
          </div>

          <button className="clear-filters" onClick={handleClearFilters}>
            Effacer tous les filtres
          </button>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {/* Results Header */}
          <div className="results-header">
            <div className="results-info">
              <h2 className="results-title">
                {q ? `Résultats pour "${q}"` : 'Tous les outils disponibles'}
              </h2>
              <p className="results-count">
                {loading ? 'Chargement...' : `${filteredResults.length} ${filteredResults.length === 1 ? 'outil trouvé' : 'outils trouvés'}`}
              </p>
            </div>
            
            <div className="sort-options">
              <span className="sort-label">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="relevance">Pertinence</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="rating">Meilleures notes</option>
                <option value="recent">Plus récents</option>
              </select>
            </div>
          </div>

          {/* Results Content */}
          {loading ? (
            <LoadingState />
          ) : (
            <div className="results-grid">
              {filteredResults.length === 0 ? (
                <NoResults />
              ) : (
                filteredResults.map(item => (
                  <ResultCard key={item.id} item={item} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
      </div>
      <Ecology />
      <Footer />
    </>
  );
};

export default SearchResults;