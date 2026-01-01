import React, { useEffect, useState } from 'react';
import './OutilsPopulaires.css';

const OutilsPopulaires = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  // ✅ CHARGER LES EQUIPEMENTS DEPUIS SUPABASE
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/equipments`);
        if (res.ok) {
          const data = await res.json();
          // Prendre les 6 premiers équipements
          setTools(data.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching tools:', error);
        setTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [API_BASE]);

  // ✅ REDIRECTION VERS LA PAGE DE RESERVATION
  const handleReservation = (toolId) => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.token) {
      window.location.href = '/connexion';
      return;
    }
    // ✅ REDIRIGER VERS /reservation AVEC L'ID DE L'EQUIPEMENT
    window.location.href = `/reservation?equipmentId=${toolId}`;
  };

  if (loading) {
    return (
      <section className="section">
        <div className="section-container">
          <h2 className="section-title outils-populaires-title">Outils à la une</h2>
          <p>Chargement...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-container">
        <div className="section-outils-populaires-header">
          <h2 className="section-title outils-populaires-title">Outils à la une</h2>
          <a href="/search" className="voir-tout-link">
            Voir tout →
          </a>
        </div>
        <div className="tools-grid">
          {tools.map((tool) => (
            <div key={tool.id} className="tool-card">
              <div className="tool-image">
                <img
                  src={tool.image || tool.thumbnail || '/default-tool.jpg'}
                  alt={tool.title || tool.name}
                  onError={(e) => { e.target.src = '/default-tool.jpg'; }}
                />
              </div>
              <div className="tool-content">
                <div className="tool-category">{tool.category || 'Catégorie'}</div>
                <h3 className="tool-name">{tool.title || tool.name}</h3>
                <p className="tool-description">{tool.description?.substring(0, 100)}...</p>
                <div className="tool-footer">
                  <div className="price-container">
                    <div className="tool-price">{tool.daily_price || 0}€</div>
                    <span className="price-unit">/ jour</span>
                  </div>
                  <button
                    className="reserve-btn"
                    onClick={() => handleReservation(tool.id)}
                    disabled={!tool.is_available}
                  >
                    {tool.is_available ? 'Réserver' : 'Non disponible'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutilsPopulaires;