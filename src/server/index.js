// ✅ CHARGER LES VARIABLES D'ENV EN PREMIER (chemin correct)
import '../config/env.js';

// Puis tous les autres imports
import express from 'express';
import bodyParser from 'body-parser';
import di from '../boot/di.js';
import { RegisterUser } from '../domain/usecases/RegisterUser.js';
import { LoginUser } from '../domain/usecases/LoginUser.js';
import { PublishEquipment } from '../domain/usecases/PublishEquipment.js';
import { SearchEquipment } from '../domain/usecases/SearchEquipment.js';
import { BookEquipment } from '../domain/usecases/BookEquipment.js';
import { ProcessPayment } from '../domain/usecases/ProcessPayment.js';
import { LeaveReview } from '../domain/usecases/LeaveReview.js';
import { authMiddleware, optionalAuthMiddleware } from '../infra/middleware/authMiddleware.js';
import { validateBody, validateQuery } from '../infra/middleware/validationMiddleware.js';
import {
  RegisterSchema,
  LoginSchema,
  UpdateUserSchema,
  PublishEquipmentSchema,
  SearchEquipmentSchema,
  BookEquipmentSchema,
  UpdateBookingSchema,
  ProcessPaymentSchema,
  LeaveReviewSchema,
  SendMessageSchema,
  GetMessagesSchema
} from '../infra/validation/schemas.js';

const app = express();

// ----------------- CORS MIDDLEWARE (dev) -----------------
// Allow frontend dev server to call the mock API without CORS errors.
// In production replace or restrict origin appropriately.
app.use((req, res, next) => {
  // ✅ Vérifier que CORS est activé
  const allowedOrigin = 'http://localhost:3000';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// body parser
app.use(bodyParser.json());

// Simple root endpoint so visiting http://localhost:4000 shows a friendly message
app.get('/', (req, res) => {
    res.type('text/plain').send('Mock API server running. Use /api/* endpoints (eg. /api/health).');
});

// Appliquer optionalAuthMiddleware à toutes les routes
app.use(optionalAuthMiddleware);

// ========== PUBLIC ENDPOINTS ==========
app.get('/api/health', (_, res) => res.json({ ok: true }));

// Login with validation
app.post('/api/login', validateBody(LoginSchema), async (req, res) => {
    try {
        const { email, password } = req.validated;
        
        // ✅ Utiliser le repository pour récupérer l'utilisateur
        const user = await di.userRepository.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // ✅ Vérifier le mot de passe (déjà fait par LoginUser)
        const result = await LoginUser(email, password, di.userRepository);
        
        // ✅ RETOURNER TOUS LES CHAMPS NECESSAIRES
        res.json({
            id: result.id,
            email: result.email,
            token: result.token,
            isPro: result.isPro || false,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            avatar_url: user.avatar_url || null
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
});

// Register with validation
app.post('/api/register', validateBody(RegisterSchema), async (req, res) => {
    try {
        const { firstName, lastName, email, password, isPro = false } = req.validated;
        
        // ✅ Créer l'utilisateur
        const user = await RegisterUser(firstName, lastName, email, password, di.userRepository);
        
        // ✅ Mettre à jour le statut pro si nécessaire
        if (typeof di.userRepository.update === 'function' && user && user.id) {
            await di.userRepository.update(user.id, { is_pro: !!isPro });
        }
        
        // ✅ RETOURNER TOUS LES CHAMPS NECESSAIRES
        res.status(201).json({ 
            id: user.id, 
            email: user.email,
            token: user.token,
            isPro: !!isPro,
            first_name: firstName,
            last_name: lastName,
            avatar_url: user.avatar_url || null
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(400).json({ message: err.message || 'Erreur lors de l\'inscription' });
    }
});

// ========== PROTECTED USER ENDPOINTS ==========
app.get('/api/users/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }
        
        const user = await di.userRepository.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch('/api/users/:id', authMiddleware, validateBody(UpdateUserSchema), async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const updates = req.validated;
        if (di.userRepository && typeof di.userRepository.update === 'function') {
            const updated = await di.userRepository.update(req.params.id, updates);
            return res.json(updated);
        }
        
        return res.status(404).json({ message: 'User not found' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/users/:id/payments', authMiddleware, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const userId = req.params.id;
        if (di.paymentRepository && typeof di.paymentRepository.findByUserId === 'function') {
            const payments = await di.paymentRepository.findByUserId(userId);
            return res.json(payments || []);
        }
        return res.json([]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/users/:id/reviews', authMiddleware, async (req, res) => {
    try {
        const reviews = await di.reviewRepository.findByTargetUserId(req.params.id);
        res.json(reviews || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ========== EQUIPMENT ENDPOINTS ==========
app.post('/api/equipments', authMiddleware, validateBody(PublishEquipmentSchema), async (req, res) => {
    try {
        const equipmentData = { ...req.validated, user_id: req.user.id };
        const equipment = await PublishEquipment(equipmentData, di.equipmentRepository);
        res.status(201).json(equipment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/equipments/:id', async (req, res) => {
    try {
        const eq = await di.equipmentRepository.findById(req.params.id);
        if (!eq) return res.status(404).json({ message: 'Equipment not found' });
        res.json(eq);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/equipments', validateQuery(SearchEquipmentSchema), async (req, res) => {
    try {
        const results = await SearchEquipment(req.validated, di.equipmentRepository);
        res.json(results);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ========== BOOKING ENDPOINTS ==========
app.post('/api/bookings', authMiddleware, validateBody(BookEquipmentSchema), async (req, res) => {
    try {
        const bookingData = { ...req.validated, borrower_id: req.user.id };
        const booking = await BookEquipment(bookingData, di.bookingRepository);
        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.patch('/api/bookings/:id', authMiddleware, validateBody(UpdateBookingSchema), async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await di.bookingRepository.findById(bookingId);
        
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.borrower_id !== req.user.id) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        const updated = await di.bookingRepository.update(bookingId, req.validated);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ========== PAYMENT ENDPOINTS ==========
app.post('/api/payments', authMiddleware, validateBody(ProcessPaymentSchema), async (req, res) => {
    try {
        const paymentData = { ...req.validated, user_id: req.user.id };
        const payment = await ProcessPayment(paymentData, di.paymentRepository);
        res.status(201).json(payment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ========== REVIEW ENDPOINTS ==========
app.post('/api/reviews', authMiddleware, validateBody(LeaveReviewSchema), async (req, res) => {
    try {
        const reviewData = { ...req.validated, author_id: req.user.id };
        const review = await LeaveReview(reviewData, di.reviewRepository);
        res.status(201).json(review);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ========== MESSAGE ENDPOINTS ==========
app.post('/api/messages', authMiddleware, validateBody(SendMessageSchema), async (req, res) => {
    try {
        const { receiver_id, content, booking_id = null } = req.validated;
        const msg = await di.messageRepository.create({ 
            sender_id: req.user.id,
            receiver_id, 
            content,
            booking_id
        });
        res.status(201).json(msg);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/messages', authMiddleware, validateQuery(GetMessagesSchema), async (req, res) => {
    try {
        const { otherUser } = req.validated;
        const conv = await di.messageRepository.findByConversation(req.user.id, otherUser);
        res.json(conv || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ========== ERROR HANDLER (À LA FIN) ==========
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err);
    res.status(500).json({ 
        message: 'Erreur serveur', 
        error: err.message 
    });
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
