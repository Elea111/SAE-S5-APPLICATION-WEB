/**
 * Value Object représentant une plage de dates
 * Utilisé pour les périodes de location
 */
class DateRange {
    constructor(startDate, endDate) {
        if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
            throw new Error('Les dates de début et de fin doivent être des objets Date valides');
        }

        if (startDate >= endDate) {
            throw new Error('La date de début doit être antérieure à la date de fin');
        }

        // Vérifier que la plage ne dépasse pas la durée maximum (90 jours)
        const maxDurationDays = 90;
        const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        if (durationInDays > maxDurationDays) {
            throw new Error(`La durée de location ne peut pas excéder ${maxDurationDays} jours`);
        }

        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
    }

    /**
     * Calcule la durée en jours
     */
    getDurationInDays() {
        return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
    }

    /**
     * Calcule la durée en heures
     */
    getDurationInHours() {
        return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60));
    }

    /**
     * Vérifie si une date est comprise dans la plage
     */
    contains(date) {
        const checkDate = new Date(date);
        return checkDate >= this.startDate && checkDate <= this.endDate;
    }

    /**
     * Vérifie si cette plage chevauche une autre plage
     */
    overlaps(otherRange) {
        if (!(otherRange instanceof DateRange)) {
            throw new Error('Le paramètre doit être une instance de DateRange');
        }
        
        return (
            this.contains(otherRange.startDate) ||
            this.contains(otherRange.endDate) ||
            otherRange.contains(this.startDate) ||
            otherRange.contains(this.endDate)
        );
    }

    /**
     * Extend la plage avec une autre plage
     */
    extend(otherRange) {
        if (!this.overlaps(otherRange) && !this.isAdjacent(otherRange)) {
            throw new Error('Les plages doivent se chevaucher ou être adjacentes');
        }

        const newStartDate = this.startDate < otherRange.startDate ? this.startDate : otherRange.startDate;
        const newEndDate = this.endDate > otherRange.endDate ? this.endDate : otherRange.endDate;
        
        return new DateRange(newStartDate, newEndDate);
    }

    /**
     * Vérifie si cette plage est adjacente à une autre (se touche sans chevaucher)
     */
    isAdjacent(otherRange) {
        const oneDayMs = 24 * 60 * 60 * 1000;
        return (
            Math.abs(this.endDate - otherRange.startDate) === oneDayMs ||
            Math.abs(otherRange.endDate - this.startDate) === oneDayMs
        );
    }

    equals(other) {
        if (!(other instanceof DateRange)) {
            return false;
        }
        return this.startDate.getTime() === other.startDate.getTime() &&
               this.endDate.getTime() === other.endDate.getTime();
    }

    toJSON() {
        return {
            startDate: this.startDate.toISOString(),
            endDate: this.endDate.toISOString(),
            durationInDays: this.getDurationInDays(),
            durationInHours: this.getDurationInHours(),
        };
    }

    toString() {
        return `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`;
    }
}

export default DateRange;