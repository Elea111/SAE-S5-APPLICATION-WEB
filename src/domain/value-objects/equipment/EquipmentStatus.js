/**
 * Enum représentant le statut de disponibilité d'un équipement
 */
const EquipmentStatus = Object.freeze({
    AVAILABLE: 'DISPONIBLE',
    RENTED: 'LOUE',
    RESERVED: 'RESERVE',
    MAINTENANCE: 'EN_MAINTENANCE',
    UNAVAILABLE: 'INDISPONIBLE',
    DELETED: 'SUPPRIME',
});

export default EquipmentStatus;