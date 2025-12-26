class Location {
    constructor(latitude, longitude) {
        this.latitude = Number(latitude);
        this.longitude = Number(longitude);
        if (Number.isNaN(this.latitude) || Number.isNaN(this.longitude)) {
            throw new Error('Invalid coordinates');
        }
    }

    // Haversine formula -> distance in kilometers
    distanceTo(other) {
        if (!(other instanceof Location)) throw new Error('Argument must be Location');
        const toRad = (deg) => (deg * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(other.latitude - this.latitude);
        const dLon = toRad(other.longitude - this.longitude);
        const a = Math.sin(dLat/2)**2 + Math.cos(toRad(this.latitude))*Math.cos(toRad(other.latitude))*Math.sin(dLon/2)**2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toJSON() {
        return { latitude: this.latitude, longitude: this.longitude };
    }
}

export default Location;
