export async function BookEquipment(bookingData, bookingRepository = null) {
    if (!bookingData || !bookingData.equipmentId || !bookingData.userId || !bookingData.startDate || !bookingData.endDate) {
        throw new Error("Données de réservation incomplètes");
    }
    // Ajout de la date de création si non fournie
    if (!bookingData.created_at) {
        bookingData.created_at = new Date().toISOString();
    }
    if (bookingRepository && typeof bookingRepository.create === 'function') {
        return await bookingRepository.create(bookingData);
    }
    throw new Error("Aucun repository de réservation fourni");
}
