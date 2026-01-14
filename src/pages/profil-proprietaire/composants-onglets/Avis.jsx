import React, { useState } from 'react';
import './Avis.css';
import { 
  FiStar, 
  FiMessageSquare, 
  FiThumbsUp,
  FiCalendar
} from 'react-icons/fi';

const Avis = ({ reviews, renderStars }) => {
  const [filter, setFilter] = useState('all');

  // Combinez les avis réels avec les temporaires
  const allReviews = reviews || [];

  // Filtrer les avis
  const filteredReviews = allReviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === '5-stars') return review.rating === 5;
    if (filter === '4-stars') return review.rating >= 4;
    if (filter === 'recent') {
      const reviewDate = new Date(review.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return reviewDate > weekAgo;
    }
    return true;
  });

  // Calcul des statistiques
  const stats = {
    total: allReviews.length,
    average: allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length || 0,
    fiveStars: allReviews.filter(r => r.rating === 5).length,
    fourStars: allReviews.filter(r => r.rating === 4).length
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#00b894';
    if (rating >= 4) return '#fdcb6e';
    if (rating >= 3) return '#e17055';
    if (rating >= 0) return '#000000ff';  
    return '#d63031'; 
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="avis-tab">
      {/* En-tête avec statistiques */}
      <div className="avis-header">
        <div className="header-content">
          <div className="header-title">
            <h1><FiStar /> Avis reçus</h1>
            <p>Découvrez ce que pensent les locataires de vos outils</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="avis-stats">
          <div className="stat-card">
            <div className="stat-icon total">
              <FiMessageSquare />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Avis total</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon average">
              <FiStar />
            </div>
            <div className="stat-info">
              <span 
                className="stat-value"
                style={{ color: getRatingColor(stats.average) }}
              >
                {stats.average.toFixed(1)}
              </span>
              <span className="stat-label">Note moyenne</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon excellent">
              <FiThumbsUp />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.fiveStars}</span>
              <span className="stat-label">5 étoiles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="filters-bar">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous ({allReviews.length})
          </button>
          <button 
            className={`filter-btn ${filter === '5-stars' ? 'active' : ''}`}
            onClick={() => setFilter('5-stars')}
          >
            <FiStar /> 5 étoiles ({stats.fiveStars})
          </button>
          <button 
            className={`filter-btn ${filter === '4-stars' ? 'active' : ''}`}
            onClick={() => setFilter('4-stars')}
          >
            <FiStar /> 4+ étoiles ({stats.fourStars + stats.fiveStars})
          </button>
          <button 
            className={`filter-btn ${filter === 'recent' ? 'active' : ''}`}
            onClick={() => setFilter('recent')}
          >
            <FiCalendar /> Récents
          </button>
        </div>
      </div>

      {/* Liste d'avis */}
      <div className="reviews-container">
        {filteredReviews.length > 0 ? (
          <div className="reviews-list">
            {filteredReviews.slice(0, 10).map(r => {
              const reviewerId = r.reviewer_id || r.reviewer?.id || r.user_id || r.users?.id;
              const reviewerAvatar = r.reviewer_avatar || r.reviewer?.avatar_url || r.users?.avatar_url;
              const reviewerName = r.reviewer_name || r.reviewer?.first_name || `${r.users?.first_name || ''} ${r.users?.last_name || ''}` || 'Anonyme';

              return (
                <div key={r.id} className="review-card">
                  <div className="review-header">
                    {reviewerId ? (
                      <a href={`/profil?userId=${reviewerId}`} className="reviewer-info-link">
                        <div className="reviewer-info">
                          {reviewerAvatar ? (
                            <img src={reviewerAvatar} alt={reviewerName} className="reviewer-avatar" />
                          ) : (
                            <div className="reviewer-avatar-placeholder">{String(reviewerName).charAt(0) || 'A'}</div>
                          )}
                          <div className="reviewer-details">
                            <strong className="reviewer-name">{reviewerName}</strong>
                            <span className="review-date">{formatDate(r.created_at || r.date || Date.now())}</span>
                          </div>
                        </div>
                      </a>
                    ) : (
                      <div className="reviewer-info">
                        {reviewerAvatar ? (
                          <img src={reviewerAvatar} alt={reviewerName} className="reviewer-avatar" />
                        ) : (
                          <div className="reviewer-avatar-placeholder">{String(reviewerName).charAt(0) || 'A'}</div>
                        )}
                        <div className="reviewer-details">
                          <strong className="reviewer-name">{reviewerName}</strong>
                          <span className="review-date">{formatDate(r.created_at || r.date || Date.now())}</span>
                        </div>
                      </div>
                    )}

                    <div className="review-rating">
                      {renderStars && renderStars(r.rating || 0)}
                      <span className="rating-value">{r.rating || 0}/5</span>
                    </div>
                  </div>


                  <p className="review-content">{r.content || r.comment || r.title || '—'}</p>

                  {r.tool_name && (
                    <div className="review-tool">
                      Concernait: {r.tool_id ? <a href={`/equipments/${r.tool_id}`}>{r.tool_name}</a> : <strong>{r.tool_name}</strong>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-reviews">
            <FiStar size={48} />
            <p>Vous n'avez pas encore d'avis</p>
            <small>Les avis apparaîtront ici après vos premières locations</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Avis;
