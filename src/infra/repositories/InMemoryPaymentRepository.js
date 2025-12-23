import { v4 as uuidv4 } from 'uuid';

export default class InMemoryPaymentRepository {
    constructor() {
        this.store = new Map();
    }

    async charge(paymentData) {
        const id = uuidv4();
        const rec = {
            id,
            booking_id: paymentData.bookingId || null,
            user_id: paymentData.userId || null,
            amount: paymentData.amount,
            currency: paymentData.currency || 'EUR',
            status: 'paid',
            stripe_payment_intent_id: `pi_${id}`,
            paid_at: new Date(),
            created_at: new Date(),
        };
        this.store.set(id, rec);
        return rec;
    }

    async refund(paymentId, amount) {
        const p = this.store.get(paymentId);
        if (!p) throw new Error('Payment not found');
        p.refunded_at = new Date();
        p.refund_reason = `refund ${amount}`;
        p.status = 'refunded';
        return p;
    }

    async findById(paymentId) {
        return this.store.get(paymentId) || null;
    }
}
