export async function ConfirmHandover(bookingId, bookingRepository = null) {
    if (!bookingId) throw new Error('BookingId requis');

    if (bookingRepository && typeof bookingRepository.confirmHandover === 'function') {
        return await bookingRepository.confirmHandover(bookingId);
    }

    const res = await fetch(`/api/bookings/${bookingId}/handover`, { method: 'POST' });
    const data = await res.json().catch(() => { throw new Error('JSON invalide'); });
    if (!res.ok) throw new Error(data.message || 'Erreur confirmation remise');
    return data;
}
