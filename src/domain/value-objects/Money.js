class Money {
    constructor(amount = 0, currency = 'EUR') {
        this.amount = Number(amount);
        this.currency = currency;
        if (Number.isNaN(this.amount)) throw new Error('Invalid amount');
    }

    isNegativeOrZero() {
        return this.amount <= 0;
    }

    add(other) {
        if (!(other instanceof Money)) throw new Error('Other must be Money');
        if (other.currency !== this.currency) throw new Error('Currency mismatch');
        return new Money(this.amount + other.amount, this.currency);
    }

    toJSON() {
        return { amount: this.amount, currency: this.currency };
    }

    toString() {
        return `${this.amount.toFixed(2)} ${this.currency}`;
    }
}

export default Money;