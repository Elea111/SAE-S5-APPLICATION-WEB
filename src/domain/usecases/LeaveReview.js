export async function LeaveReview(reviewData, reviewRepository = null) {
    if (!reviewData || !reviewData.authorId || !reviewData.targetId || !reviewData.rating) {
        throw new Error('Données d\'avis incomplètes');
    }

    if (!Number.isInteger(reviewData.rating) || reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Rating doit être un entier entre 1 et 5');
    }

    if (reviewRepository && typeof reviewRepository.create === 'function') {
        return await reviewRepository.create(reviewData);
    }

    const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
    });

    const data = await res.json().catch(() => { throw new Error('JSON invalide'); });
    if (!res.ok) throw new Error(data.message || 'Erreur création avis');
    return data;
}
