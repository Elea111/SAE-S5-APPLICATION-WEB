export async function PublishEquipment(equipmentData, equipmentRepository = null) {
    if (!equipmentData || !equipmentData.ownerId || !equipmentData.title) {
        throw new Error('Données d\'équipement invalides');
    }

    if (equipmentRepository && typeof equipmentRepository.create === 'function') {
        return await equipmentRepository.create(equipmentData);
    }

    const res = await fetch('/api/equipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentData)
    });

    const data = await res.json().catch(() => { throw new Error('JSON invalide'); });
    if (!res.ok) throw new Error(data.message || 'Erreur publication équipement');
    return data;
}
