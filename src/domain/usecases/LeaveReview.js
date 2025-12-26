export async function LeaveReview(reviewData, reviewRepository = null) {
    if (!reviewData || !reviewData.bookingId || !reviewData.authorId || !reviewData.targetUserId || !reviewData.rating) {
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
