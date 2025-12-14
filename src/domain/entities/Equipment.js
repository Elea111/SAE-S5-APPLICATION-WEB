import { v4 as uuidv4 } from 'uuid';
import Money from '../value-objects/Money';
import Location from '../value-objects/Location';
import DateRange from '../value-objects/DateRange';
import EquipmentCondition from '../value-objects/EquipmentCondition';
import EquipmentStatus from '../value-objects/EquipmentStatus';
import EquipmentCategory from '../value-objects/EquipmentCategory';

/**
 * Entité représentant un équipement/outil disponible à la location
 */
class Equipment {
    constructor({
        id = uuidv4(),
        ownerId,
        title,
        description,
        category,
        brand = null,
        model = null,
        serialNumber = null,
        dailyPrice,
        deposit = null,
        condition,
        status = EquipmentStatus.AVAILABLE,
        location,
        images = [],
        specifications = {},
        features = [],
        availabilitySchedule = [], // Tableau de DateRange
        minRentalDays = 1,
        maxRentalDays = 30,
        deliveryOptions = {
            pickup: true,
            delivery: false,
            deliveryRadius: null,
            deliveryPrice: null,
        },
        insuranceRequired = false,
        insuranceDetails = null,
        rating = 0,
        reviewCount = 0,
        rentalCount = 0,
        metadata = {},
        createdAt = new Date(),
        updatedAt = new Date(),
    }) {
        this.id = id;
        this.ownerId = ownerId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.dailyPrice = dailyPrice instanceof Money ? dailyPrice : new Money(dailyPrice, 'EUR');
        this.deposit = deposit ? (deposit instanceof Money ? deposit : new Money(deposit, 'EUR')) : null;
        this.condition = condition;
        this.status = status;
        this.location = location instanceof Location ? location : null;
        this.images = images;
        this.specifications = specifications;
        this.features = features;
        this.availabilitySchedule = availabilitySchedule;
        this.minRentalDays = minRentalDays;
        this.maxRentalDays = maxRentalDays;
        this.deliveryOptions = deliveryOptions;
        this.insuranceRequired = insuranceRequired;
        this.insuranceDetails = insuranceDetails;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.rentalCount = rentalCount;
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    // ==================== VALIDATION ====================

    validate() {
        if (!this.ownerId || typeof this.ownerId !== 'string') {
            throw new Error('ID du propriétaire est requis');
        }

        if (!this.title || typeof this.title !== 'string' || this.title.trim().length === 0) {
            throw new Error('Le titre est requis et doit être une chaîne non vide');
        }

        if (this.title.length > 100) {
            throw new Error('Le titre ne peut pas excéder 100 caractères');
        }

        if (!this.description || typeof this.description !== 'string' || this.description.trim().length === 0) {
            throw new Error('La description est requise');
        }

        if (this.description.length > 2000) {
            throw new Error('La description ne peut pas excéder 2000 caractères');
        }

        if (!Object.values(EquipmentCategory).includes(this.category)) {
            throw new Error('Catégorie invalide');
        }

        if (!Object.values(EquipmentCondition).includes(this.condition)) {
            throw new Error('État physique invalide');
        }

        if (!Object.values(EquipmentStatus).includes(this.status)) {
            throw new Error('Statut de disponibilité invalide');
        }

        if (!this.dailyPrice || !(this.dailyPrice instanceof Money)) {
            throw new Error('Prix journalier valide requis');
        }

        if (this.dailyPrice.isNegativeOrZero()) {
            throw new Error('Le prix journalier doit être positif');
        }

        if (this.deposit && this.deposit.isNegativeOrZero()) {
            throw new Error('La caution doit être positive si spécifiée');
        }

        if (this.minRentalDays < 1) {
            throw new Error('La durée minimale de location doit être d\'au moins 1 jour');
        }

        if (this.maxRentalDays < this.minRentalDays) {
            throw new Error('La durée maximale de location doit être supérieure à la durée minimale');
        }

        if (this.maxRentalDays > 90) {
            throw new Error('La durée maximale de location ne peut pas excéder 90 jours');
        }

        if (this.images.length > 10) {
            throw new Error('Maximum 10 images autorisées');
        }

        // Validation des URLs d'images
        this.images.forEach(image => {
            if (!this._isValidUrl(image)) {
                throw new Error('URL d\'image invalide');
            }
        });

        // Validation du calendrier de disponibilité
        this.availabilitySchedule.forEach((range, index) => {
            if (!(range instanceof DateRange)) {
                throw new Error(`Plage de disponibilité ${index + 1} doit être une instance de DateRange`);
            }
        });
    }

    // ==================== GETTERS ====================

    /**
     * Calcule le prix total pour une durée donnée
     */
    calculateTotalPrice(days) {
        if (days < this.minRentalDays) {
            throw new Error(`Durée minimale de location: ${this.minRentalDays} jours`);
        }

        if (days > this.maxRentalDays) {
            throw new Error(`Durée maximale de location: ${this.maxRentalDays} jours`);
        }

        // Possibilité d'ajouter des réductions pour longue durée
        let total = this.dailyPrice.amount * days;

        return new Money(total, this.dailyPrice.currency);
    }

    /**
     * Obtient le prix moyen par jour 
     */
    getAverageDailyPrice(days) {
        const total = this.calculateTotalPrice(days);
        return new Money(total.amount / days, this.dailyPrice.currency);
    }

    /**
     * Obtient la note moyenne
     */
    getAverageRating() {
        if (this.reviewCount === 0) return null;
        return (this.rating / this.reviewCount).toFixed(1);
    }

    /**
     * Vérifie si l'équipement est disponible pour une période donnée
     */
    isAvailableForPeriod(startDate, endDate) {
        if (this.status !== EquipmentStatus.AVAILABLE) {
            return false;
        }

        const requestedRange = new DateRange(startDate, endDate);

        // Vérifier les conflits avec le calendrier de disponibilité
        for (const availableRange of this.availabilitySchedule) {
            if (availableRange.overlaps(requestedRange)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Vérifie si l'équipement peut être livré à une adresse
     */
    canDeliverTo(deliveryLocation) {
        if (!this.deliveryOptions.delivery) {
            return false;
        }

        if (!this.location || !deliveryLocation) {
            return false;
        }

        if (!(deliveryLocation instanceof Location)) {
            throw new Error('L\'adresse de livraison doit être une instance de Location');
        }

        const distance = this.location.distanceTo(deliveryLocation);
        
        return distance <= (this.deliveryOptions.deliveryRadius || 50); // 50km par défaut
    }

    /**
     * Calcule le prix de livraison pour une adresse
     */
    calculateDeliveryPrice(deliveryLocation) {
        if (!this.canDeliverTo(deliveryLocation)) {
            throw new Error('Livraison non disponible à cette adresse');
        }

        if (this.deliveryOptions.deliveryPrice) {
            return new Money(this.deliveryOptions.deliveryPrice, this.dailyPrice.currency);
        }

        // Calcul basé sur la distance (1€/km)
        const distance = this.location.distanceTo(deliveryLocation);
        const basePrice = Math.max(5, distance * 1); // Minimum 5€
        
        return new Money(basePrice, this.dailyPrice.currency);
    }

    // ==================== RÈGLES MÉTIERS ====================

    /**
     * Créer un nouvel équipement
     */
    static create({
        ownerId,
        title,
        description,
        category,
        dailyPrice,
        condition,
        location,
        brand = null,
        model = null,
        deposit = null,
        minRentalDays = 1,
        maxRentalDays = 30,
        deliveryOptions = {
            pickup: true,
            delivery: false,
        },
    }) {
        // Validation des champs requis
        if (!ownerId) throw new Error('ID du propriétaire requis');
        if (!title) throw new Error('Titre requis');
        if (!description) throw new Error('Description requise');
        if (!category) throw new Error('Catégorie requise');
        if (!dailyPrice) throw new Error('Prix journalier requis');
        if (!condition) throw new Error('État physique requis');
        if (!location) throw new Error('Localisation requise');

        // Validation du prix
        if (dailyPrice <= 0) {
            throw new Error('Le prix journalier doit être positif');
        }

        // Validation de la durée de location
        if (minRentalDays < 1) {
            throw new Error('Durée minimale de location: 1 jour');
        }

        if (maxRentalDays < minRentalDays) {
            throw new Error('La durée maximale doit être supérieure à la durée minimale');
        }

        if (maxRentalDays > 90) {
            throw new Error('Durée maximale de location: 90 jours');
        }

        return new Equipment({
            ownerId,
            title: title.trim(),
            description: description.trim(),
            category,
            dailyPrice: new Money(dailyPrice, 'EUR'),
            condition,
            location: location instanceof Location ? location : new Location(location.latitude, location.longitude),
            brand,
            model,
            deposit: deposit ? new Money(deposit, 'EUR') : null,
            minRentalDays,
            maxRentalDays,
            deliveryOptions,
        });
    }

    /**
     * Mettre à jour les informations de l'équipement
     */
    update({
        title = null,
        description = null,
        category = null,
        brand = null,
        model = null,
        dailyPrice = null,
        deposit = null,
        condition = null,
        location = null,
        specifications = null,
        features = null,
        minRentalDays = null,
        maxRentalDays = null,
        deliveryOptions = null,
        insuranceRequired = null,
        insuranceDetails = null,
    }) {
        // Ne pas permettre la modification si l'équipement est loué
        if (this.status === EquipmentStatus.RENTED) {
            throw new Error('Impossible de modifier un équipement en cours de location');
        }

        let hasChanges = false;

        if (title !== null) {
            if (typeof title !== 'string' || title.trim().length === 0) {
                throw new Error('Titre invalide');
            }
            if (title.length > 100) {
                throw new Error('Titre trop long (max 100 caractères)');
            }
            this.title = title.trim();
            hasChanges = true;
        }

        if (description !== null) {
            if (typeof description !== 'string' || description.trim().length === 0) {
                throw new Error('Description invalide');
            }
            if (description.length > 2000) {
                throw new Error('Description trop longue (max 2000 caractères)');
            }
            this.description = description.trim();
            hasChanges = true;
        }

        if (category !== null) {
            if (!Object.values(EquipmentCategory).includes(category)) {
                throw new Error('Catégorie invalide');
            }
            this.category = category;
            hasChanges = true;
        }

        if (dailyPrice !== null) {
            const newPrice = dailyPrice instanceof Money ? dailyPrice : new Money(dailyPrice, 'EUR');
            if (newPrice.isNegativeOrZero()) {
                throw new Error('Le prix journalier doit être positif');
            }
            this.dailyPrice = newPrice;
            hasChanges = true;
        }

        if (deposit !== null) {
            if (deposit === null) {
                this.deposit = null;
            } else {
                const newDeposit = deposit instanceof Money ? deposit : new Money(deposit, 'EUR');
                if (newDeposit.isNegativeOrZero()) {
                    throw new Error('La caution doit être positive');
                }
                this.deposit = newDeposit;
            }
            hasChanges = true;
        }

        if (condition !== null) {
            if (!Object.values(EquipmentCondition).includes(condition)) {
                throw new Error('État physique invalide');
            }
            this.condition = condition;
            hasChanges = true;
        }

        if (location !== null) {
            const newLocation = location instanceof Location ? location : new Location(location.latitude, location.longitude);
            this.location = newLocation;
            hasChanges = true;
        }

        if (specifications !== null) {
            if (typeof specifications !== 'object') {
                throw new Error('Les spécifications doivent être un objet');
            }
            this.specifications = specifications;
            hasChanges = true;
        }

        if (features !== null) {
            if (!Array.isArray(features)) {
                throw new Error('Les caractéristiques doivent être un tableau');
            }
            this.features = features;
            hasChanges = true;
        }

        if (minRentalDays !== null) {
            if (minRentalDays < 1) {
                throw new Error('Durée minimale: 1 jour');
            }
            this.minRentalDays = minRentalDays;
            hasChanges = true;
        }

        if (maxRentalDays !== null) {
            if (maxRentalDays < this.minRentalDays) {
                throw new Error('La durée maximale doit être supérieure à la durée minimale');
            }
            if (maxRentalDays > 90) {
                throw new Error('Durée maximale: 90 jours');
            }
            this.maxRentalDays = maxRentalDays;
            hasChanges = true;
        }

        if (deliveryOptions !== null) {
            if (typeof deliveryOptions !== 'object') {
                throw new Error('Les options de livraison doivent être un objet');
            }
            this.deliveryOptions = { ...this.deliveryOptions, ...deliveryOptions };
            hasChanges = true;
        }

        if (insuranceRequired !== null) {
            if (typeof insuranceRequired !== 'boolean') {
                throw new Error('Le champ assurance requise doit être un booléen');
            }
            this.insuranceRequired = insuranceRequired;
            hasChanges = true;
        }

        if (insuranceDetails !== null) {
            this.insuranceDetails = insuranceDetails;
            hasChanges = true;
        }

        if (hasChanges) {
            this.updatedAt = new Date();
            this.metadata.lastUpdatedBy = 'owner';
            this.metadata.updateCount = (this.metadata.updateCount || 0) + 1;
        }

        return hasChanges;
    }

    /**
     * Ajouter une image
     */
    addImage(imageUrl) {
        if (this.images.length >= 10) {
            throw new Error('Maximum 10 images autorisées');
        }

        if (!this._isValidUrl(imageUrl)) {
            throw new Error('URL d\'image invalide');
        }

        this.images.push(imageUrl);
        this.updatedAt = new Date();
    }

    /**
     * Supprimer une image
     */
    removeImage(imageUrl) {
        const index = this.images.indexOf(imageUrl);
        if (index === -1) {
            throw new Error('Image non trouvée');
        }

        this.images.splice(index, 1);
        this.updatedAt = new Date();
    }

    /**
     * Changer le statut de l'équipement
     */
    changeStatus(newStatus) {
        if (!Object.values(EquipmentStatus).includes(newStatus)) {
            throw new Error('Statut invalide');
        }

        // Validations spécifiques selon le statut actuel
        if (this.status === EquipmentStatus.RENTED && newStatus !== EquipmentStatus.RENTED) {
            throw new Error('Impossible de changer le statut d\'un équipement en cours de location');
        }

        this.status = newStatus;
        this.updatedAt = new Date();
        this.metadata.lastStatusChange = {
            from: this.status,
            to: newStatus,
            date: new Date().toISOString(),
        };
    }

    /**
     * Ajouter une plage de disponibilité
     */
    addAvailability(startDate, endDate) {
        if (this.status !== EquipmentStatus.AVAILABLE) {
            throw new Error('Seuls les équipements disponibles peuvent avoir un calendrier de disponibilité');
        }

        const newRange = new DateRange(startDate, endDate);

        // Vérifier les conflits avec les plages existantes
        for (const existingRange of this.availabilitySchedule) {
            if (existingRange.overlaps(newRange)) {
                throw new Error('Conflit avec une plage de disponibilité existante');
            }
        }

        this.availabilitySchedule.push(newRange);
        this.updatedAt = new Date();
    }

    /**
     * Supprimer une plage de disponibilité
     */
    removeAvailability(startDate, endDate) {
        const rangeToRemove = new DateRange(startDate, endDate);
        const initialLength = this.availabilitySchedule.length;

        this.availabilitySchedule = this.availabilitySchedule.filter(
            range => !range.equals(rangeToRemove)
        );

        if (this.availabilitySchedule.length === initialLength) {
            throw new Error('Plage de disponibilité non trouvée');
        }

        this.updatedAt = new Date();
    }

    /**
     * Marquer comme loué
     */
    markAsRented() {
        if (this.status !== EquipmentStatus.AVAILABLE && this.status !== EquipmentStatus.RESERVED) {
            throw new Error('Seuls les équipements disponibles ou réservés peuvent être marqués comme loués');
        }

        this.status = EquipmentStatus.RENTED;
        this.rentalCount += 1;
        this.updatedAt = new Date();
    }

    /**
     * Marquer comme disponible
     */
    markAsAvailable() {
        if (this.status === EquipmentStatus.DELETED) {
            throw new Error('Un équipement supprimé ne peut pas être rendu disponible');
        }

        this.status = EquipmentStatus.AVAILABLE;
        this.updatedAt = new Date();
    }

    /**
     * Ajouter une évaluation
     */
    addReview(ratingValue, reviewText = null) {
        if (typeof ratingValue !== 'number' || ratingValue < 1 || ratingValue > 5) {
            throw new Error('La note doit être un nombre entre 1 et 5');
        }

        this.rating += ratingValue;
        this.reviewCount += 1;
        this.updatedAt = new Date();

        // Stocker les détails de la dernière évaluation
        this.metadata.lastReview = {
            rating: ratingValue,
            text: reviewText,
            date: new Date().toISOString(),
        };
    }

    /**
     * Désactiver l'équipement (le propriétaire peut le faire)
     */
    disable() {
        if (this.status === EquipmentStatus.RENTED) {
            throw new Error('Impossible de désactiver un équipement en cours de location');
        }

        this.status = EquipmentStatus.UNAVAILABLE;
        this.updatedAt = new Date();
        this.metadata.disabledAt = new Date().toISOString();
    }

    /**
     * Supprimer l'équipement 
     */
    softDelete() {
        if (this.status === EquipmentStatus.RENTED) {
            throw new Error('Impossible de supprimer un équipement en cours de location');
        }

        this.status = EquipmentStatus.DELETED;
        this.updatedAt = new Date();
        this.metadata.deletedAt = new Date().toISOString();
    }

    /**
     * Restaurer un équipement supprimé
     */
    restore() {
        if (this.status !== EquipmentStatus.DELETED) {
            throw new Error('Seuls les équipements supprimés peuvent être restaurés');
        }

        this.status = EquipmentStatus.AVAILABLE;
        this.updatedAt = new Date();
        this.metadata.restoredAt = new Date().toISOString();
    }

    // ==================== MÉTHODES DE VALIDATION ====================

    static _isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // ==================== SÉRIALISATION ====================

    toJSON() {
        return {
            id: this.id,
            ownerId: this.ownerId,
            title: this.title,
            description: this.description,
            category: this.category,
            brand: this.brand,
            model: this.model,
            serialNumber: this.serialNumber,
            dailyPrice: this.dailyPrice.toJSON(),
            deposit: this.deposit ? this.deposit.toJSON() : null,
            condition: this.condition,
            status: this.status,
            location: this.location ? this.location.toJSON() : null,
            images: this.images,
            specifications: this.specifications,
            features: this.features,
            availabilitySchedule: this.availabilitySchedule.map(range => range.toJSON()),
            minRentalDays: this.minRentalDays,
            maxRentalDays: this.maxRentalDays,
            deliveryOptions: this.deliveryOptions,
            insuranceRequired: this.insuranceRequired,
            insuranceDetails: this.insuranceDetails,
            rating: this.rating,
            reviewCount: this.reviewCount,
            averageRating: this.getAverageRating(),
            rentalCount: this.rentalCount,
            metadata: this.metadata,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            isAvailable: this.status === EquipmentStatus.AVAILABLE,
            canBeRented: this.status === EquipmentStatus.AVAILABLE,
        };
    }
}

export default Equipment;