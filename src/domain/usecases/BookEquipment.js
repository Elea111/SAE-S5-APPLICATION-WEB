export async function BookEquipment(bookingData, bookingRepository = null) {
    if (!bookingData || !bookingData.equipmentId || !bookingData.userId || !bookingData.startDate || !bookingData.endDate) {
        throw new Error('Données de réservation incomplètes');
    }

    if (bookingRepository && typeof bookingRepository.create === 'function') {
        return await bookingRepository.create(bookingData);
    }

    const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
    });

    const data = await res.json().catch(() => { throw new Error('JSON invalide'); });
    if (!res.ok) throw new Error(data.message || 'Erreur réservation');
    return data;
}
