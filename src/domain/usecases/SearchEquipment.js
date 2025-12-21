export async function SearchEquipment(query = {}, equipmentRepository = null) {
    if (equipmentRepository && typeof equipmentRepository.search === 'function') {
        return await equipmentRepository.search(query);
    }

    // Simple fallback: construire query params
    const params = new URLSearchParams(query).toString();
    const res = await fetch(`/api/equipments?${params}`);
    const data = await res.json().catch(() => { throw new Error('JSON invalide'); });
    if (!res.ok) throw new Error(data.message || 'Erreur recherche');
    return data;
}
