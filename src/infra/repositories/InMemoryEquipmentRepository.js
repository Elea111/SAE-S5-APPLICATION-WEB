import { v4 as uuidv4 } from 'uuid';

export default class InMemoryEquipmentRepository {
    constructor() {
        this.store = new Map();
    }

    async create(equipment) {
        const id = uuidv4();
        const record = {
            id,
            ownerId: equipment.ownerId,
            title: equipment.title,
            description: equipment.description || '',
            dailyPrice: equipment.dailyPrice || 0,
            is_available: true,
            created_at: new Date(),
            updated_at: new Date(),
            ...equipment,
        };
        this.store.set(id, record);
        return record;
    }

    async findById(id) {
        return this.store.get(id) || null;
    }

    async search(query = {}) {
        // Simple search by title substring or ownerId
        const items = Array.from(this.store.values());
        return items.filter(it => {
            if (query.ownerId && it.ownerId !== query.ownerId) return false;
            if (query.q && !it.title.toLowerCase().includes(String(query.q).toLowerCase())) return false;
            return true;
        });
    }

    async update(id, updates) {
        const existing = this.store.get(id);
        if (!existing) throw new Error('Not found');
        const updated = { ...existing, ...updates, updated_at: new Date() };
        this.store.set(id, updated);
        return updated;
    }

    async remove(id) {
        this.store.delete(id);
        return true;
    }
}
