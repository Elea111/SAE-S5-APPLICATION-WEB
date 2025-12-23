import { v4 as uuidv4 } from 'uuid';

export default class InMemoryReviewRepository {
    constructor() {
        this.store = new Map();
    }

    async create(review) {
        const id = uuidv4();
        const rec = {
            id,
            booking_id: review.rentalId || review.bookingId || null,
            author_id: review.authorId,
            target_id: review.targetId,
            rating: review.rating,
            title: review.title || null,
            content: review.content || null,
            created_at: new Date(),
            updated_at: new Date(),
        };
        this.store.set(id, rec);
        return rec;
    }

    async findById(id) {
        return this.store.get(id) || null;
    }

    async listForTarget(targetId) {
        return Array.from(this.store.values()).filter(r => r.target_id === targetId);
    }

    async report(reviewId, reason) {
        const r = this.store.get(reviewId);
        if (!r) throw new Error('Review not found');
        r.reported = true;
        r.report_reason = reason;
        r.updated_at = new Date();
        return r;
    }
}
