export async function ConfirmReturn(bookingId, bookingRepository = null) {
    if (!bookingId) throw new Error('BookingId requis');

    if (bookingRepository && typeof bookingRepository.confirmReturn === 'function') {
        return await bookingRepository.confirmReturn(bookingId);
    }

    const res = await fetch(`/api/bookings/${bookingId}/return`, { method: 'POST' });
    const data = await res.json().catch(() => { throw new Error('JSON invalide'); });
    if (!res.ok) throw new Error(data.message || 'Erreur confirmation restitution');
    return data;
}
