
class Money {
    constructor(amount, currency = 'EUR') {
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new Error('Amount must be a valid number');
        }

        if (amount < 0) {
            throw new Error('Amount cannot be negative');
        }

        if (!currency || typeof currency !== 'string') {
            throw new Error('Currency must be a valid string');
        }

        // Store amount with 2 decimal places
        this.amount = Math.round(amount * 100) / 100;
        this.currency = currency.toUpperCase();
    }

    add(other) {
        this._validateSameCurrency(other);
        return new Money(this.amount + other.amount, this.currency);
    }

    subtract(other) {
        this._validateSameCurrency(other);
        const result = this.amount - other.amount;
        if (result < 0) {
            throw new Error('Result cannot be negative');
        }
        return new Money(result, this.currency);
    }

    multiply(factor) {
        if (typeof factor !== 'number') {
            throw new Error('Factor must be a number');
        }
        return new Money(this.amount * factor, this.currency);
    }

    isEqualTo(other) {
        this._validateSameCurrency(other);
        return this.amount === other.amount;
    }

    isGreaterThan(other) {
        this._validateSameCurrency(other);
        return this.amount > other.amount;
    }

    isNegativeOrZero() {
        return this.amount <= 0;
    }

    format() {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: this.currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(this.amount);
    }

    _validateSameCurrency(other) {
        if (!(other instanceof Money)) {
            throw new Error('Can only operate with Money instances');
        }
        if (this.currency !== other.currency) {
            throw new Error('Currencies must match');
        }
    }

    toJSON() {
        return {
            amount: this.amount,
            currency: this.currency,
            formatted: this.format(),
        };
    }
}

export default Money;