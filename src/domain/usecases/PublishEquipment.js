export async function PublishEquipment(equipmentData, equipmentRepository = null) {
    // Accepter soit ownerId soit user_id
    const userId = equipmentData.ownerId || equipmentData.user_id;
    
    if (!equipmentData || !equipmentData.title || !userId) {
        throw new Error("Titre et propriétaire requis");
    }
    
    // Ajout de la date de création si non fournie
    if (!equipmentData.created_at) {
        equipmentData.created_at = new Date().toISOString();
    }
    
    const payload = { ...equipmentData, user_id: userId };
    
    if (equipmentRepository && typeof equipmentRepository.create === 'function') {
        return await equipmentRepository.create(payload);
    }
    throw new Error("Aucun repository d'équipement fourni");
}
