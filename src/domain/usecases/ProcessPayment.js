export async function ProcessPayment(paymentData, paymentRepository = null) {
    if (!paymentData || !paymentData.amount || !paymentData.currency || !paymentData.source) {
        throw new Error('Données de paiement invalides');
    }

    if (paymentRepository && typeof paymentRepository.charge === 'function') {
        return await paymentRepository.charge(paymentData);
    }

    const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
    });

    const data = await res.json().catch(() => { throw new Error('JSON invalide'); });
    if (!res.ok) throw new Error(data.message || 'Erreur paiement');
    return data;
}
