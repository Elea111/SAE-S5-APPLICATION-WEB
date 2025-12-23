export default class MockStripeService {
    constructor() {
        this.intents = new Map(); // id -> intent
        this.refunds = new Map(); // id -> refund
        this._counter = 1;
    }

    _genId(prefix = 'pi') {
        return `${prefix}_${Date.now().toString(36)}_${this._counter++}`;
    }

    async createPaymentIntent({ amount, currency = 'EUR', metadata = {} } = {}) {
        if (!amount || Number.isNaN(Number(amount))) {
            throw new Error('Invalid amount for payment intent');
        }
        const id = this._genId('pi');
        const intent = {
            id,
            amount: Number(amount),
            currency,
            metadata,
            status: 'requires_confirmation',
            client_secret: `${id}_secret`,
            created_at: new Date().toISOString(),
        };
        this.intents.set(id, intent);
        return intent;
    }

    // Simulate immediate confirmation (for mock)
    async confirmPaymentIntent(intentId) {
        const intent = this.intents.get(intentId);
        if (!intent) throw new Error('PaymentIntent not found');
        intent.status = 'succeeded';
        intent.confirmed_at = new Date().toISOString();
        this.intents.set(intentId, intent);
        return intent;
    }

    async getPaymentIntent(intentId) {
        return this.intents.get(intentId) || null;
    }

    async refundPaymentIntent(intentId, amount = null) {
        const intent = this.intents.get(intentId);
        if (!intent) throw new Error('PaymentIntent not found');
        const id = this._genId('re');
        const refundedAmount = amount ? Number(amount) : intent.amount;
        const refund = {
            id,
            payment_intent: intentId,
            amount: refundedAmount,
            status: 'succeeded',
            created_at: new Date().toISOString(),
        };
        this.refunds.set(id, refund);
        intent.status = 'refunded';
        this.intents.set(intentId, intent);
        return refund;
    }
}
