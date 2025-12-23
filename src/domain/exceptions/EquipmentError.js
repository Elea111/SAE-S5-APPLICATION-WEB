/**
 * Erreur métier spécifique aux équipements
 */
export class EquipmentError extends Error {
    constructor(message = 'Equipment error', code = 'EQUIPMENT_ERROR') {
        super(message);
        this.name = 'EquipmentError';
        this.code = code;
    }
}

/**
 * Erreur lorsque l'équipement n'est pas disponible
 */
export class EquipmentNotAvailableError extends EquipmentError {
    constructor(id) {
        super(`Equipment ${id} not available`, 'NOT_AVAILABLE');
    }
}

/**
 * Erreur lorsque l'équipement est en cours de location
 */
export class EquipmentRentedError extends EquipmentError {
    constructor(id) {
        super(`Equipment ${id} is currently rented`, 'RENTED');
    }
}

/**
 * Erreur lorsque la durée de location est invalide
 */
export class InvalidRentalDurationError extends EquipmentError {
    constructor(min, max, given) {
        super(`Invalid rental duration ${given} (allowed ${min}-${max})`, 'INVALID_DURATION');
    }
}