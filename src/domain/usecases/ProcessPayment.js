export async function ProcessPayment(paymentData, paymentRepository = null) {
    if (!paymentData || !paymentData.bookingId || !paymentData.userId || !paymentData.amount) {
        throw new Error("Données de paiement incomplètes");
    }
    if (!paymentData.created_at) {
        paymentData.created_at = new Date().toISOString();
    }
    if (paymentRepository && typeof paymentRepository.create === 'function') {
        return await paymentRepository.create(paymentData);
    }
    throw new Error("Aucun repository de paiement fourni");
}
