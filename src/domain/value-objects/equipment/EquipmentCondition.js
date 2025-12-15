/**
 * Enum représentant l'état physique d'un équipement
 */
const EquipmentCondition = Object.freeze({
    NEW: 'NEUF',
    VERY_GOOD: 'TRES_BON_ETAT',
    GOOD: 'BON_ETAT',
    SATISFACTORY: 'ETAT_SATISFAISANT',
    USED: 'USAGE',
    NEEDS_REPAIR: 'A_REPARER',
    FOR_PARTS: 'POUR_PIECES',
});

export default EquipmentCondition;