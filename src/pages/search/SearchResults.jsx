import React, { useEffect, useState, useCallback, useMemo } from 'react';
import './SearchResults.css';

const SAMPLE_SUGGESTIONS = [
  'perceuse', 'ponceuse', 'scie', 'marteau', 'ponceuse à bande',
  'visseuse', 'meuleuse', 'rabot', 'scie circulaire', 'nettoyeur haute pression'
];

const CATEGORIES = [
  'Electroportatif', 'Outillage à main', 'Jardinage',
  'Nettoyage', 'Soudure', 'Mesure', 'Peinture'
];

const INITIAL_FILTERS = {
  categories: [],
  priceRange: { min: 0, max: 100 },
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

  // Suggestions filtrées
  const filteredSuggestions = useMemo(() => 
    SAMPLE_SUGGESTIONS.filter(s => 
      s.toLowerCase().includes(q.toLowerCase())
    ), [q]
  );

  // Recherche initiale
  useEffect(() => {
    const searchQuery = new URLSearchParams(window.location.search).get('q') || '';
    if (!searchQuery) return;
    
    const doSearch = async () => {
      setLoading(true);
      try {
        const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
        const res = await fetch(`${API_BASE}/api/equipments?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : (data.items || []));
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    doSearch();
  }, []);

  // Recherche via formulaire
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (!q.trim()) return;
    
    const searchUrl = `?q=${encodeURIComponent(q)}`;
    if (window.location.search !== searchUrl) {
      window.location.search = searchUrl;
    }
  }, [q]);

  // Gestionnaires d'événements
  const handleSelectSuggestion = useCallback((suggestion) => {
    window.location.search = `?q=${encodeURIComponent(suggestion)}`;
  }, []);

  const handleViewDetails = useCallback((id) => {
    window.location.href = `/equipments/${id}`;
  }, []);

  const handleViewOwner = useCallback((ownerId) => {
    window.location.href = `/profil?userId=${ownerId}`;
  }, []);

  const handleResetSearch = useCallback(() => {
    setQ('');
    setFilters(INITIAL_FILTERS);
    window.location.search = '';
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Filtrage et tri des résultats
  const filteredResults = useMemo(() => {
    return results
      .filter(item => {
        if (filters.categories.length > 0 && !filters.categories.includes(item.category)) {
          return false;
        }
        if (item.price < filters.priceRange.min || item.price > filters.priceRange.max) return false;
        if (filters.rating > 0 && item.rating < filters.rating) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_asc': return a.price - b.price;
          case 'price_desc': return b.price - a.price;
          case 'rating': return b.rating - a.rating;
          default: return 0;
        }
      });
  }, [results, filters, sortBy]);

  // Composants internes pour mieux organiser le JSX
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

  const Suggestions = () => (
    <div className="search-suggestions">
      <p className="suggestions-label">Suggestions :</p>
      <div className="suggestions-list">
        {filteredSuggestions.map(s => (
          <button
            key={s}
            className="suggestion-tag"
            onClick={() => handleSelectSuggestion(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  const CategoryFilter = () => (
    <div className="filter-section">
      <h4>Catégories</h4>
      <div className="category-list">
        {CATEGORIES.map(category => {
          const isSelected = filters.categories.includes(category);
          return (
            <label key={category} className="category-item">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  setFilters(prev => ({
                    ...prev,
                    categories: e.target.checked
                      ? [...prev.categories, category]
                      : prev.categories.filter(c => c !== category)
                  }));
                }}
              />
              <span>{category}</span>
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
                  max="200"
                  placeholder={key === 'min' ? '0' : '100'}
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
    const imageUrl = item.image || item.thumbnail || '/default-tool.jpg';
    const ownerName = item.ownerName || `Utilisateur ${item.ownerId || item.owner_id}`;
    
    return (
      <div className="result-card">
        <div className="result-image-container">
          <img 
            src={imageUrl}
            alt={item.title || item.name} 
            className="result-image" 
            onError={(e) => { e.target.src = '/default-tool.jpg'; }}
          />
          <div className="result-badge">Disponible</div>
          {item.category && <div className="result-category">{item.category}</div>}
        </div>
        
        <div className="result-content">
          <div className="result-header">
            <h3 className="result-title">{item.title || item.name}</h3>
            {(item.rating || item.rating === 0) && (
              <div className="result-rating">
                <span className="stars">{"★".repeat(Math.floor(item.rating))}</span>
                <span className="rating-value">{item.rating?.toFixed(1)}</span>
                {item.reviews && <span className="reviews-count">({item.reviews})</span>}
              </div>
            )}
          </div>
          
          {item.description && <p className="result-description">{item.description}</p>}
          
          <div className="result-owner">
            <div className="owner-info">
              <span className="owner-label">Propriétaire :</span>
              <span className="owner-name">{ownerName}</span>
              {item.ownerRating && <span className="owner-rating">{item.ownerRating} ★</span>}
            </div>
          </div>
          
          <div className="result-footer">
            <div className="result-price">
              <span className="price">{item.price || 0}€</span>
              <span className="period">/ {item.period || 'jour'}</span>
            </div>
            
            <div className="result-actions">
              <button className="view-details-btn" onClick={() => handleViewDetails(item.id)}>
                Voir détails
              </button>
              <button className="view-owner-btn" onClick={() => handleViewOwner(item.ownerId || item.owner_id)}>
                Voir profil
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
      <p>Recherche en cours...</p>
    </div>
  );

  const NoResults = () => (
    <div className="no-results">
      <div className="no-results-icon">🔍</div>
      <h3>{q ? 'Aucun résultat trouvé' : 'Commencez votre recherche'}</h3>
      <p>
        {q 
          ? 'Essayez avec d\'autres termes de recherche ou ajustez vos filtres.'
          : 'Utilisez la barre de recherche pour trouver des outils disponibles.'
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
  <div className="search-results-page">
      {/* Hero Section */}
      <div className="search-hero">
        <h1 className="hero-title">Trouvez l'outil pour votre projet</h1>
        <p className="hero-subtitle">Des milliers d'outils disponibles près de chez vous</p>
        <SearchBar />
      </div>

      {/* Suggestions */}
      {q && filteredSuggestions.length > 0 && <Suggestions />}

      <div className="search-content">
        {/* Filters Sidebar */}
        <div className="filters-sidebar">
          <div className="filters-header">
            <h3 className="filters-title">Filtres</h3>
            {filters.categories.length > 0 && (
              <span className="category-selected-badge">
                {filters.categories.length} catégorie{filters.categories.length > 1 ? 's' : ''}
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
              <option value="today">Aujourd'hui</option>
              <option value="tomorrow">Demain</option>
              <option value="weekend">Ce weekend</option>
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
                {q ? `Résultats pour "${q}"` : 'Outils disponibles'}
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
  );
};

export default SearchResults;