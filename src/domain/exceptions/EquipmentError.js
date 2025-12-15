/**
 * Erreur métier spécifique aux équipements
 */
class EquipmentError extends Error {
    constructor(message, code = 'EQUIPMENT_ERROR') {
        super(message);
        this.name = 'EquipmentError';
        this.code = code;
    }
}

/**
 * Erreur lorsque l'équipement n'est pas disponible
 */
class EquipmentNotAvailableError extends EquipmentError {
    constructor(equipmentId, requestedDate) {
        super(`L'équipement ${equipmentId} n'est pas disponible pour la date demandée`, 'EQUIPMENT_NOT_AVAILABLE');
        this.equipmentId = equipmentId;
        this.requestedDate = requestedDate;
    }
}

/**
 * Erreur lorsque le propriétaire n'est pas autorisé
 */
class EquipmentOwnerError extends EquipmentError {
    constructor(userId, equipmentId) {
        super(`L'utilisateur ${userId} n'est pas autorisé à modifier l'équipement ${equipmentId}`, 'UNAUTHORIZED_OWNER');
        this.userId = userId;
        this.equipmentId = equipmentId;
    }
}

/**
 * Erreur lorsque l'équipement est en cours de location
 */
class EquipmentRentedError extends EquipmentError {
    constructor(equipmentId) {
        super(`L'équipement ${equipmentId} est actuellement en location`, 'EQUIPMENT_RENTED');
        this.equipmentId = equipmentId;
    }
}

/**
 * Erreur lorsque la durée de location est invalide
 */
class InvalidRentalDurationError extends EquipmentError {
    constructor(minDays, maxDays, requestedDays) {
        super(`Durée de location invalide: ${requestedDays} jours (min: ${minDays}, max: ${maxDays})`, 'INVALID_RENTAL_DURATION');
        this.minDays = minDays;
        this.maxDays = maxDays;
        this.requestedDays = requestedDays;
    }
}

export {
    EquipmentError,
    EquipmentNotAvailableError,
    EquipmentOwnerError,
    EquipmentRentedError,
    InvalidRentalDurationError,
};