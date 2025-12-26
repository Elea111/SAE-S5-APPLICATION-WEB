export default class StripePaymentAdapter {
    constructor(stripeService) {
        if (!stripeService) throw new Error('stripeService is required');
        this.stripe = stripeService;
    }

    // charge(paymentData) -> crée intent, confirme et retourne objet payment conforme à PaymentRepository expectations
    async charge(paymentData) {
        // expected fields: amount, currency, bookingId, userId, source/metadata...
        const amount = paymentData.amount;
        const currency = paymentData.currency || 'EUR';
        const metadata = {
            bookingId: paymentData.bookingId || null,
            userId: paymentData.userId || null,
            ...paymentData.metadata,
        };

        const intent = await this.stripe.createPaymentIntent({ amount, currency, metadata });
        // For mock, confirm immediately
        const confirmed = await this.stripe.confirmPaymentIntent(intent.id);

        return {
            id: confirmed.id,
            booking_id: metadata.bookingId,
            user_id: metadata.userId,
            amount: confirmed.amount,
            currency: confirmed.currency,
            status: confirmed.status === 'succeeded' ? 'paid' : confirmed.status,
            stripe_payment_intent_id: confirmed.id,
            paid_at: confirmed.confirmed_at || new Date().toISOString(),
            created_at: confirmed.created_at,
        };
    }

    async refund(paymentId, amount) {
        // paymentId corresponds to stripe payment intent id in mock
        const refund = await this.stripe.refundPaymentIntent(paymentId, amount);
        return {
            id: refund.id,
            payment_intent: refund.payment_intent,
            amount: refund.amount,
            status: refund.status,
            refunded_at: refund.created_at,
        };
    }

    async findById(paymentId) {
        const intent = await this.stripe.getPaymentIntent(paymentId);
        if (!intent) return null;
        return {
            id: intent.id,
            amount: intent.amount,
            currency: intent.currency,
            status: intent.status === 'succeeded' ? 'paid' : intent.status,
            stripe_payment_intent_id: intent.id,
            created_at: intent.created_at,
        };
    }
}
