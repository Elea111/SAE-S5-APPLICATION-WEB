import { v4 as uuidv4 } from 'uuid';

export default class InMemoryMessageRepository {
    constructor() {
        this.store = new Map();
    }

    async create({ bookingId = null, senderId, receiverId, content }) {
        const id = uuidv4();
        const rec = {
            id,
            booking_id: bookingId,
            sender_id: senderId,
            receiver_id: receiverId,
            content,
            is_read: false,
            read_at: null,
            created_at: new Date(),
        };
        this.store.set(id, rec);
        return rec;
    }

    async listForConversation({ userA, userB }) {
        return Array.from(this.store.values()).filter(m =>
            (m.sender_id === userA && m.receiver_id === userB) || (m.sender_id === userB && m.receiver_id === userA)
        );
    }

    async markAsRead(messageId) {
        const m = this.store.get(messageId);
        if (!m) throw new Error('Message not found');
        m.is_read = true;
        m.read_at = new Date();
        return m;
    }
}
