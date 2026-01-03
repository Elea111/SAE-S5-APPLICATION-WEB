export async function LeaveReview(reviewData, reviewRepository = null) {
    // Valider les champs requis (snake_case du schéma de validation)
    if (!reviewData || !reviewData.booking_id || !reviewData.author_id || !reviewData.target_user_id || !reviewData.rating) {
        throw new Error("Données d'avis incomplètes");
    }
    if (!reviewData.created_at) {
        reviewData.created_at = new Date().toISOString();
    }
    if (reviewRepository && typeof reviewRepository.create === 'function') {
        return await reviewRepository.create(reviewData);
    }
    throw new Error("Aucun repository d'avis fourni");
}
