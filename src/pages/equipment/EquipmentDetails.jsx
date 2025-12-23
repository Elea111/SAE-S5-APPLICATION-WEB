import React, { useEffect, useState } from 'react';
import './EquipmentDetails.css';

const EquipmentDetails = () => {
  const [equipment, setEquipment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const path = window.location.pathname;
    // support /equipments/:id or /equipment/:id
    const parts = path.split('/');
    const id = parts[parts.length - 1] || parts[2];
    if (!id) return;
    fetch(`/api/equipments/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(setEquipment)
      .catch(() => setError('Équipement introuvable (mock).'));
  }, []);

  if (error) return <div className="equipment-page"><p className="error">{error}</p></div>;
  if (!equipment) return <div className="equipment-page"><p>Chargement...</p></div>;

  const ownerLink = `/profil?userId=${equipment.ownerId || equipment.owner_id || ''}`;

  return (
    <div className="equipment-page">
      <div className="equipment-card">
        <div className="equipment-left">
          <img src={equipment.image || '/favicon.ico'} alt={equipment.title || equipment.name} className="equipment-image" />
        </div>
        <div className="equipment-right">
          <h1 className="equipment-title">{equipment.title || equipment.name}</h1>
          <p className="equipment-category">{equipment.category || ''}</p>
          <p className="equipment-desc">{equipment.description}</p>

          <div className="equipment-meta">
            <div className="price">{(equipment.dailyPrice || equipment.daily_price || equipment.daily_price?.amount || equipment.dailyPrice?.amount || 0)} € / jour</div>
            <div className="owner">
              Proposé par: <a href={ownerLink} onClick={(e) => { e.preventDefault(); window.location.href = '/profil'; }}>{equipment.ownerId || equipment.owner_id || 'Propriétaire'}</a>
            </div>
          </div>

          <div className="actions">
            <button className="btn-primary" onClick={() => { window.location.href = `/schedule?equipmentId=${equipment.id || equipment.id}`; }}>Programmer une location</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;
