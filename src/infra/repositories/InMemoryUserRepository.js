import { v4 as uuidv4 } from 'uuid';

export default class InMemoryUserRepository {
    constructor() {
        this.store = new Map(); // id -> user
        this.emailIndex = new Map();
    }

    async create(payload) {
        const id = uuidv4();
        const user = {
            id,
            email: payload.email,
            password_hash: payload.password, // plain for dev only
            first_name: payload.firstName || payload.first_name || null,
            last_name: payload.lastName || payload.last_name || null,
            is_pro: !!payload.isPro,
            phone: payload.phone || null,
            address: payload.address || null,
            avatar_url: payload.avatarUrl || null,
            latitude: payload.latitude || null,
            longitude: payload.longitude || null,
            rating: 0,
            review_count: 0,
            email_verified: false,
            verification_token: null,
            created_at: new Date(),
            updated_at: new Date(),
        };
        this.store.set(id, user);
        this.emailIndex.set(user.email, id);
        // return a copy (simulate API response without password)
        const { password_hash, ...publicUser } = user;
        return { id, ...publicUser };
    }

    async findByEmail(email) {
        const id = this.emailIndex.get(email);
        if (!id) return null;
        return this.store.get(id) || null;
    }

    async findByCredentials(email, password) {
        const id = this.emailIndex.get(email);
        if (!id) throw new Error('Invalid credentials');
        const user = this.store.get(id);
        if (!user) throw new Error('Invalid credentials');
        if (user.password_hash !== password) throw new Error('Invalid credentials');
        // Simple token simulation
        const token = `dev-token-${user.id}`;
        const { password_hash, ...publicUser } = user;
        return { token, user: publicUser };
    }

    async findById(id) {
        const user = this.store.get(id) || null;
        if (!user) return null;
        const { password_hash, ...publicUser } = user;
        return publicUser;
    }
}
