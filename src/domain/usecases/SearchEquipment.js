export async function SearchEquipment(filters = {}, equipmentRepository = null) {
    if (equipmentRepository && typeof equipmentRepository.search === 'function') {
        return await equipmentRepository.search(filters);
    }
    throw new Error("Aucun repository d'équipement fourni");
}
