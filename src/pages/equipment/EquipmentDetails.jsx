import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './EquipmentDetails.css';

const EquipmentDetails = () => {
  const [equipment, setEquipment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [owner, setOwner] = useState(null);

  // ✅ DEFINIR API_BASE AU DEBUT DU COMPOSANT
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  useEffect(() => {
    const path = window.location.pathname;
    // support /equipments/:id or /equipment/:id
    const parts = path.split('/');
    const id = parts[parts.length - 1] || parts[2];
    
    if (!id) {
      setError('ID équipement manquant');
      setLoading(false);
      return;
    }

    console.log('📥 Fetching equipment:', id);

    fetch(`${API_BASE}/api/equipments/${id}`)
      .then(r => {
        console.log('📨 Response status:', r.status);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log('✅ Equipment loaded:', data);
        setEquipment(data);
        
        // ✅ Les images sont déjà dans data.photos
        if (data.photos && data.photos.length > 0) {
          setImages(data.photos);
        }
      })
      .catch(err => {
        console.error('❌ Fetch error:', err);
        setError('Équipement introuvable');
      })
      .finally(() => setLoading(false));
  }, [API_BASE]);

  if (loading) {
    return (
      <div className="equipment-page">
        <p>⏳ Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="equipment-page">
        <p className="error">❌ {error}</p>
        <button onClick={() => window.location.href = '/search'}>
          ← Retour à la recherche
        </button>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="equipment-page">
        <p>Équipement introuvable</p>
      </div>
    );
  }

  const ownerLink = `/profil?userId=${equipment.user_id || equipment.owner_id || ''}`;

  return (
    <>
      <Header />
      <div className="equipment-page">
        <div className="equipment-card">
        <div className="equipment-left">
          <img 
            src={equipment.image_url || equipment.image || '/favicon.ico'} 
            alt={equipment.title || equipment.name} 
            className="equipment-image" 
          />
        </div>
        
        <div className="equipment-right">
          <h1 className="equipment-title">{equipment.title || equipment.name}</h1>
          <p className="equipment-category">📁 {equipment.category_icon || '📦'} {equipment.category_name || 'Catégorie non spécifiée'}</p>
          <p className="equipment-desc">{equipment.description}</p>

          <div className="equipment-meta">
            <div className="price">
              💰 {(equipment.daily_price || equipment.dailyPrice || 0)} € / jour
            </div>
            {equipment.caution_deposit && (
              <div className="caution">
                🛡️ Caution : {equipment.caution_deposit}€
              </div>
            )}
            <div className="location">
              📍 {equipment.location || 'Localisation non spécifiée'}
            </div>
            <div className="condition">
              ⚙️ État : {equipment.condition || 'Non spécifié'}
            </div>
          </div>

          <div className="owner-info">
            <span>Proposé par : </span>
            <a href={ownerLink} onClick={(e) => { e.preventDefault(); window.location.href = ownerLink; }}>
              {equipment.owner_name || 'Propriétaire'}
            </a>
          </div>

          <div className="actions">
            <button 
              className="btn-primary" 
              onClick={() => { 
                window.location.href = `/schedule?equipmentId=${equipment.id}`; 
              }}
            >
              📅 Programmer une location
            </button>
            <button 
              className="btn-outline" 
              onClick={() => { 
                window.location.href = `/messages?other=${equipment.user_id}`; 
              }}
            >
              💬 Contacter le propriétaire
            </button>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="equipment-images">
          <div className="images-slider">
            {images.map(photo => (
              <img key={photo.id} src={photo.image_url} alt="equipment" />
            ))}
          </div>
        </div>
      )}
      </div>
      <Footer />
    </>
  );
};

export default EquipmentDetails;
