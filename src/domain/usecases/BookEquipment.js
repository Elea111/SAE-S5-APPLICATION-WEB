export async function BookEquipment(bookingData, bookingRepository = null, equipmentRepository = null) {
    if (!bookingData) {
        throw new Error("Données de réservation requises");
    }

    const { item_id, borrower_id, start_date, end_date } = bookingData;

    // ✅ VALIDATION DATES
    if (!start_date || !end_date) {
        throw new Error("Dates de début et fin requises");
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (endDate <= startDate) {
        throw new Error("La date de fin doit être après la date de début");
    }

    // ✅ VÉRIFIER S'IL Y A DÉJÀ UNE RÉSERVATION CHEVAUCHANTE
    if (bookingRepository && typeof bookingRepository.findConflictingBookings === 'function') {
        try {
            const conflicts = await bookingRepository.findConflictingBookings(
                item_id,
                startDate.toISOString(),
                endDate.toISOString()
            );
            
            if (conflicts && conflicts.length > 0) {
                console.warn('⚠️ Conflit de réservation détecté pour l\'item:', item_id);
                throw new Error("Cet outil n'est pas disponible pour ces dates. Veuillez choisir d'autres dates.");
            }
        } catch (err) {
            if (err.message.includes("n'est pas disponible")) {
                throw err;
            }
            console.warn('⚠️ Impossible de vérifier les conflits:', err.message);
        }
    }

    // ✅ CALCULER LE NOMBRE DE JOURS
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (totalDays < 1) {
        throw new Error("La location doit être d'au moins 1 jour");
    }

    // ✅ RÉCUPÉRER LE PRIX DE L'ÉQUIPEMENT SI DISPONIBLE
    let totalAmount = 0;
    let cautionAmount = 0;

    if (equipmentRepository && typeof equipmentRepository.findById === 'function') {
        try {
            const equipment = await equipmentRepository.findById(item_id);
            if (equipment) {
                // Calculer le montant total (prix journalier × nombre de jours)
                const dailyPrice = equipment.daily_price || 0;
                totalAmount = dailyPrice * totalDays;
                cautionAmount = equipment.caution_deposit || 0;
                
                console.log(`💰 Calcul montants: ${dailyPrice}€/jour × ${totalDays}j = ${totalAmount}€ + ${cautionAmount}€ caution`);
            }
        } catch (err) {
            console.warn('⚠️ Impossible de récupérer l\'équipement pour calculer le prix:', err.message);
        }
    }

    const payload = {
        item_id,
        borrower_id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_days: totalDays,
        total_amount: totalAmount,
        caution_amount: cautionAmount,
        status: 'pending',
        created_at: new Date().toISOString()
    };

    // ✅ UTILISER LE REPOSITORY
    if (bookingRepository && typeof bookingRepository.create === 'function') {
        const booking = await bookingRepository.create(payload);
        
        // ✅ METTRE À JOUR LE STATUT DE L'ITEM À "en location"
        if (equipmentRepository && typeof equipmentRepository.update === 'function') {
            try {
                await equipmentRepository.update(item_id, {
                    is_available: false,
                    booking_status: 'en location'
                });
                console.log(`✅ Item ${item_id} marqué comme "en location"`);
            } catch (err) {
                console.warn('⚠️ Impossible de mettre à jour le statut de l\'item:', err.message);
            }
        }
        
        return {
            id: booking.id,
            ...booking,
            total_days: totalDays,
            total_amount: totalAmount,
            caution_amount: cautionAmount
        };
    }

    throw new Error("Repository réservation non disponible");
}
