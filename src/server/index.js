import express from 'express';
import bodyParser from 'body-parser';
import di from '../boot/di.js';
import { RegisterUser } from '../domain/usecases/RegisterUser';
import { LoginUser } from '../domain/usecases/LoginUser';
import { PublishEquipment } from '../domain/usecases/PublishEquipment';
import { SearchEquipment } from '../domain/usecases/SearchEquipment';
import { BookEquipment } from '../domain/usecases/BookEquipment';
import { ProcessPayment } from '../domain/usecases/ProcessPayment';
import { LeaveReview } from '../domain/usecases/LeaveReview';

const app = express();
app.use(bodyParser.json());

// Health
app.get('/api/health', (_, res) => res.json({ ok: true }));

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, isPro = false } = req.body;
        const user = await RegisterUser(firstName, lastName, email, password, di.userRepository);
        // Ensure isPro stored via repository (create accepts payload)
        // If repository returned public user, we may need to update is_pro flag
        // For safety, set in repo store if possible
        const created = await di.userRepository.findById(user.id);
        if (created && typeof created === 'object') {
            // best effort: set is_pro on stored user if method exists
            try {
                // underlying repo stores is_pro; but update here if needed
                if (di.userRepository.store && di.userRepository.store.get(user.id)) {
                    const raw = di.userRepository.store.get(user.id);
                    raw.is_pro = !!isPro;
                    di.userRepository.store.set(user.id, raw);
                }
            } catch (e) { /* ignore */ }
        }
        res.status(201).json({ id: user.id, ...user, isPro: !!isPro });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await LoginUser(email, password, di.userRepository);
        res.json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
});

// Get user by id
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await di.userRepository.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get reviews for user
app.get('/api/users/:id/reviews', async (req, res) => {
    try {
        const reviews = await di.reviewRepository.listForTarget(req.params.id);
        res.json(reviews || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Publish equipment
app.post('/api/equipments', async (req, res) => {
    try {
        const equipment = await PublishEquipment(req.body, di.equipmentRepository);
        res.status(201).json(equipment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get equipment by id
app.get('/api/equipments/:id', async (req, res) => {
    try {
        const eq = await di.equipmentRepository.findById(req.params.id);
        if (!eq) return res.status(404).json({ message: 'Equipment not found' });
        res.json(eq);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search equipments
app.get('/api/equipments', async (req, res) => {
    try {
        const results = await SearchEquipment(req.query, di.equipmentRepository);
        res.json(results);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Book equipment
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = await BookEquipment(req.body, di.bookingRepository);
        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Payments (process)
app.post('/api/payments', async (req, res) => {
    try {
        const payment = await ProcessPayment(req.body, di.paymentRepository);
        res.status(201).json(payment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Reviews
app.post('/api/reviews', async (req, res) => {
    try {
        const review = await LeaveReview(req.body, di.reviewRepository);
        res.status(201).json(review);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Messages
app.post('/api/messages', async (req, res) => {
    try {
        const { bookingId = null, senderId, receiverId, content } = req.body;
        const msg = await di.messageRepository.create({ bookingId, senderId, receiverId, content });
        res.status(201).json(msg);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Start server if run directly
if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`Mock API server running on http://localhost:${port}`);
    });
}

export default app;
