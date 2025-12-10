class Email {
    constructor(value) {
        if (!this._isValid(value)) {
            throw new Error(`Invalid email format: ${value}`);
        }
        this.value = value.toLowerCase();
    }

    _isValid(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return typeof email === 'string' && emailRegex.test(email) && email.length <= 255;
    }

    equals(other) {
        if (!(other instanceof Email)) {
            return false;
        }
        return this.value === other.value;
    }

    toString() {
        return this.value;
    }

    toJSON() {
        return this.value;
    }
}

export default Email;
