class Location {
    constructor(latitude, longitude) {
        if (!this._isValidCoordinate(latitude, -90, 90)) {
            throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90`);
        }
        if (!this._isValidCoordinate(longitude, -180, 180)) {
            throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180`);
        }

        this.latitude = parseFloat(latitude);
        this.longitude = parseFloat(longitude);
    }

    _isValidCoordinate(value, min, max) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    /**
     * Calculate distance between two locations (Haversine formula)
     * Returns distance in kilometers
     */
    distanceTo(otherLocation) {
        const R = 6371; // Earth's radius in km
        const dLat = this._toRad(otherLocation.latitude - this.latitude);
        const dLon = this._toRad(otherLocation.longitude - this.longitude);
        const lat1 = this._toRad(this.latitude);
        const lat2 = this._toRad(otherLocation.latitude);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    _toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    equals(other) {
        if (!(other instanceof Location)) {
            return false;
        }
        return this.latitude === other.latitude && this.longitude === other.longitude;
    }

    toString() {
        return `${this.latitude}, ${this.longitude}`;
    }

    toJSON() {
        return {
            latitude: this.latitude,
            longitude: this.longitude,
        };
    }
}

export default Location;
