import { v4 as uuidv4 } from 'uuid';

export default class InMemoryBookingRepository {
    constructor() {
        this.store = new Map();
    }

    async create(booking) {
        const id = uuidv4();
        const rec = {
            id,
            item_id: booking.equipmentId || booking.item_id,
            borrower_id: booking.userId || booking.borrower_id,
            start_date: booking.startDate ? new Date(booking.startDate) : null,
            end_date: booking.endDate ? new Date(booking.endDate) : null,
            total_days: booking.totalDays || null,
            total_amount: booking.totalAmount || null,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
            ...booking,
        };
        this.store.set(id, rec);
        return rec;
    }

    async findById(id) {
        return this.store.get(id) || null;
    }

    async confirmHandover(bookingId) {
        const b = this.store.get(bookingId);
        if (!b) throw new Error('Booking not found');
        b.pickup_confirmed_at = new Date();
        b.status = 'in_progress';
        b.updated_at = new Date();
        return b;
    }

    async confirmReturn(bookingId) {
        const b = this.store.get(bookingId);
        if (!b) throw new Error('Booking not found');
        b.return_confirmed_at = new Date();
        b.status = 'completed';
        b.updated_at = new Date();
        return b;
    }

    async listForUser(userId) {
        return Array.from(this.store.values()).filter(b => b.borrower_id === userId);
    }
}
