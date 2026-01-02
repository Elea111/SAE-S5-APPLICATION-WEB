import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const EquipmentDetail = () => {
  const { equipmentId } = useParams();
  const [equipment, setEquipment] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, [equipmentId]);

  const fetchEquipment = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/equipments/${equipmentId}`);
      const data = await res.json();
      
      console.log('📦 Equipment data:', data); // DEBUG
      
      setEquipment(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <h1>{equipment?.title}</h1>
      
      {/* ✅ Afficher la catégorie */}
      {equipment?.category_name && (
        <p>
          <strong>Catégorie:</strong> {equipment.category_icon} {equipment.category_name}
        </p>
      )}
      
      {/* ✅ Afficher le propriétaire */}
      <div className="owner-info">
        {equipment?.owner_avatar && (
          <img src={equipment.owner_avatar} alt={equipment.owner_name} className="avatar" />
        )}
        <div>
          <p><strong>Proposé par:</strong> {equipment?.owner_name}</p>
          <p>⭐ {equipment?.owner_rating || 0} / 5 ({equipment?.owner_reviews || 0} avis)</p>
        </div>
      </div>
      
      {/* ...existing code... */}
    </div>
  );
};

export default EquipmentDetail;