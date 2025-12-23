/**
 * Enum représentant le statut de disponibilité d'un équipement
 */
const EquipmentStatus = Object.freeze({
    AVAILABLE: 'available',
    RENTED: 'rented',
    RESERVED: 'reserved',
    MAINTENANCE: 'maintenance',
    UNAVAILABLE: 'unavailable',
    DELETED: 'deleted',
});

export default EquipmentStatus;