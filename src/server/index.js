// ✅ CHARGER LES VARIABLES D'ENV EN PREMIER
import '../config/env.js';

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import di from '../boot/di.js';
import SupabaseStorageRepository from '../infra/repositories/SupabaseStorageRepository.js';
import supabaseClient from '../infra/database/supabaseClient.js'; // ✅ AJOUTER IMPORT
import { sessionMiddleware } from '../infra/middleware/sessionMiddleware.js';

// Puis tous les autres imports
import bodyParser from 'body-parser';
import { z } from 'zod';  // ← ZULU
import stripeService from '../infra/services/StripeService.js';  // ← STRIPE SERVICE
import emailService from '../infra/services/EmailService.js';  // ← EMAIL SERVICE
import chatService from '../infra/services/ChatService.js';  // ← IA CHATBOT
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

// ============================================
// 🔒 SÉCURITÉ - MIDDLEWARE
// ============================================

// ✅ Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:']
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// ✅ Rate Limiting - Login (5 tentatives par 5 min)
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  skipSuccessfulRequests: true, // Reset après succès
  standardHeaders: true, // Envoyer info dans le header `RateLimit-*`
  legacyHeaders: false, // Désactiver les headers `X-RateLimit-*`
  handler: (req, res) => {
    res.status(429).json({ 
      message: 'Trop de tentatives de login. Réessayez dans 5 minutes.' 
    });
  }
});

// ✅ Rate Limiting - Général API (augmenté pour dev, à réduire en prod)
// En dev: 10000 requêtes par heure (pratiquement pas de limite)
// En prod: réduire à 100 requêtes par 15 min
const apiLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 60 * 1000, // 15 min en prod, 1h en dev
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Strict en prod, très permissif en dev
  handler: (req, res) => {
    res.status(429).json({ 
      message: 'Trop de requêtes. Réessayez plus tard.' 
    });
  }
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ Cookie Parser (pour CSRF)
app.use(cookieParser());

// ✅ Session Middleware (créer sessionId + CSRF token)
app.use(sessionMiddleware);

// ✅ CSRF Protection (valider CSRF token sur POST/PATCH/DELETE)
const csrfProtection = csrf({
  cookie: false, // Ne pas utiliser de cookie pour le token (utiliser la session)
  value: (req) => {
    // Récupérer token du header X-CSRF-Token
    return req.headers['x-csrf-token'] || req.body?._csrf
  }
});

// ✅ Appliquer rate limiting APRÈS les parsers
app.use('/api/', apiLimiter); // General API rate limit

// ✅ MULTER POUR LES UPLOADS
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images allowed.'));
    }
  }
});

// ========== CORS MIDDLEWARE ==========
app.use((req, res, next) => {
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

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.type('text/plain').send('Mock API server running. Use /api/* endpoints (eg. /api/health).');
});

app.use(optionalAuthMiddleware);

// ========== PUBLIC ENDPOINTS ==========
app.get('/api/health', (_, res) => res.json({ ok: true }));

// ✅ GET /api/csrf-token: Retourner le CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// POST /api/login
app.post('/api/login', loginLimiter, validateBody(LoginSchema), async (req, res) => {
  try {
    const { email, password } = req.validated;
    const user = await di.userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const result = await LoginUser(email, password, di.userRepository);

    // ✅ Retourner le token directement (dev mode - on met la sécurité en prod)
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
    console.error('Login error:', err.message);
    const message = err.message && err.message.includes('Utilisateur') 
      ? err.message 
      : 'Email ou mot de passe incorrect';
    res.status(401).json({ message });
  }
});

// POST /api/register
app.post('/api/register', validateBody(RegisterSchema), async (req, res) => {
  try {
    const { firstName, lastName, email, password, isPro = false } = req.validated;
    const user = await RegisterUser(firstName, lastName, email, password, di.userRepository);

    if (typeof di.userRepository.update === 'function' && user && user.id) {
      await di.userRepository.update(user.id, { is_pro: !!isPro });
    }

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
    
    // ✅ CALCULER LES STATS D'AVIS EN TEMPS RÉEL
    const reviews = await di.reviewRepository.findByTargetUserId(req.params.id);
    const review_count = reviews.length;
    const avgRating = review_count > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / review_count).toFixed(1)
      : 0;
    
    // ✅ RETOURNER L'UTILISATEUR AVEC LES STATS CALCULÉES
    res.json({
      ...user,
      rating: parseFloat(avgRating),
      review_count: review_count
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ ENDPOINT PUBLIC POUR VOIR LE PROFIL D'UN AUTRE UTILISATEUR
app.get('/api/users/:id/public', async (req, res) => {
  try {
    const user = await di.userRepository.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // ✅ CALCULER LES STATS D'AVIS EN TEMPS RÉEL
    const reviews = await di.reviewRepository.findByTargetUserId(req.params.id);
    const review_count = reviews.length;
    const avgRating = review_count > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / review_count).toFixed(1)
      : 0;
    
    // ✅ RETOURNER SEULEMENT LES INFOS PUBLIQUES
    res.json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      rating: parseFloat(avgRating),
      review_count: review_count,
      created_at: user.created_at,
      is_pro: user.is_pro
    });
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
    const payments = di.paymentRepository && typeof di.paymentRepository.findByUserId === 'function'
      ? await di.paymentRepository.findByUserId(req.params.id)
      : [];
    res.json(payments || []);
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

// ✅ NOUVEAU: GET /api/users/:userId/equipments - Récupère les équipements publiés par un utilisateur
app.get('/api/users/:id/equipments', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Query Supabase pour récupérer les équipements de cet utilisateur
    const { data, error } = await supabaseClient
      .from('items')
      .select(`
        id,
        title,
        description,
        daily_price,
        caution_deposit,
        location,
        condition,
        category_id,
        user_id,
        is_available,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur Supabase:', error);
      return res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }

    // ✅ Récupérer les images pour chaque équipement
    const equipmentsWithImages = await Promise.all(
      (data || []).map(async (item) => {
        const { data: photos } = await supabaseClient
          .from('item_photos')
          .select('id, image_url, is_main')
          .eq('item_id', item.id);
        
        return {
          ...item,
          image_url: photos && photos.length > 0 ? photos[0].image_url : null,
          photos: photos || []
        };
      })
    );

    res.json(equipmentsWithImages || []);
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ message: err.message });
  }
});

// ========== EQUIPMENT ENDPOINTS ==========

// ⚠️ ROUTES SPECIFIQUES D'ABORD (avant les routes génériques)

/**
 * POST /api/users/:userId/avatar
 * Upload l'avatar d'un utilisateur
 */
app.post('/api/users/:userId/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Upload via StorageService
    const result = await SupabaseStorageRepository.uploadUserAvatar(userId, file.buffer);

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: result
    });
  } catch (err) {
    console.error('❌ Avatar upload error:', err.message);
    res.status(500).json({
      error: 'Avatar upload failed',
      details: err.message
    });
  }
});

/**
 * POST /api/equipments/:equipmentId/images
 * Upload une image pour un équipement
 */
app.post('/api/equipments/:equipmentId/images', upload.single('image'), async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const file = req.file;
    const { sortOrder = 0, isMain = false } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!equipmentId) {
      return res.status(400).json({ error: 'equipmentId is required' });
    }

    // Upload via StorageService
    const result = await SupabaseStorageRepository.uploadEquipmentImage(
      equipmentId,
      file.buffer,
      parseInt(sortOrder),
      isMain === 'true' || isMain === true
    );

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: result
    });
  } catch (err) {
    console.error('❌ Equipment image upload error:', err.message);
    res.status(500).json({
      error: 'Image upload failed',
      details: err.message
    });
  }
});

/**
 * GET /api/equipments/:equipmentId/images
 * Récupérer toutes les images d'un équipement
 */
app.get('/api/equipments/:equipmentId/images', async (req, res) => {
  try {
    const { equipmentId } = req.params;

    if (!equipmentId) {
      return res.status(400).json({ error: 'equipmentId is required' });
    }

    const images = await SupabaseStorageRepository.getEquipmentImages(equipmentId);

    res.status(200).json({
      success: true,
      data: images
    });
  } catch (err) {
    console.error('❌ Get images error:', err.message);
    res.status(500).json({
      error: 'Failed to fetch images',
      details: err.message
    });
  }
});

/**
 * PATCH /api/equipments/images/:photoId/main
 * Définir une image comme principale
 */
app.patch('/api/equipments/images/:photoId/main', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { equipmentId } = req.body;

    if (!photoId || !equipmentId) {
      return res.status(400).json({ error: 'photoId and equipmentId are required' });
    }

    const result = await SupabaseStorageRepository.setMainImage(photoId, equipmentId);

    res.status(200).json({
      success: true,
      message: 'Main image set successfully',
      data: result
    });
  } catch (err) {
    console.error('❌ Set main image error:', err.message);
    res.status(500).json({
      error: 'Failed to set main image',
      details: err.message
    });
  }
});

/**
 * DELETE /api/equipments/images/:photoId
 * Supprimer une image d'équipement
 */
app.delete('/api/equipments/images/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { bucket, filePath } = req.body;

    if (!photoId || !bucket || !filePath) {
      return res.status(400).json({ error: 'photoId, bucket, and filePath are required' });
    }

    await SupabaseStorageRepository.deleteEquipmentImage(photoId, bucket, filePath);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (err) {
    console.error('❌ Delete image error:', err.message);
    res.status(500).json({
      error: 'Failed to delete image',
      details: err.message
    });
  }
});

// ⚠️ ROUTES GENERIQUES D'ENSUITE (après les routes spécifiques)

app.post('/api/equipments', authMiddleware, validateBody(PublishEquipmentSchema), async (req, res) => {
  try {
    const equipmentData = {
      ...req.validated,
      user_id: req.user.id,
      category_id: req.validated.category_id // ✅ Passer category_id
    };

    console.log('📦 Publishing equipment:', equipmentData);

    const equipment = await PublishEquipment(
      equipmentData,
      di.equipmentRepository,
      di.photosRepository
    );

    console.log('✅ Equipment published:', equipment.id);
    res.status(201).json(equipment);
  } catch (err) {
    console.error('❌ Publish error:', err);
    res.status(400).json({ message: err.message || 'Erreur lors de la publication' });
  }
});

app.get('/api/equipments/:id', async (req, res) => {
  try {
    // ✅ JOINDRE users ET categories (directement via category_id) ET item_photos
    const { data, error } = await di.equipmentRepository
      .supabase
      .from('items')
      .select(`
        id,
        user_id,
        title,
        description,
        daily_price,
        caution_deposit,
        location,
        condition,
        is_available,
        category_id,
        created_at,
        users!user_id (
          id,
          first_name,
          last_name,
          avatar_url,
          rating,
          review_count
        ),
        categories!category_id (
          id,
          name,
          slug,
          icon
        ),
        item_photos (
          id,
          image_url,
          sort_order
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // ✅ MAPPER LES DONNÉES
    const mapped = {
      id: data.id,
      title: data.title,
      description: data.description,
      daily_price: data.daily_price,
      caution_deposit: data.caution_deposit,
      location: data.location,
      condition: data.condition,
      is_available: data.is_available,
      created_at: data.created_at,
      
      // Propriétaire
      user_id: data.user_id,
      owner_name: data.users 
        ? `${data.users.first_name} ${data.users.last_name}` 
        : 'Propriétaire inconnu',
      owner_avatar: data.users?.avatar_url,
      owner_rating: data.users?.rating,
      owner_reviews: data.users?.review_count,
      
      // ✅ Catégorie (directement de la colonne category_id + join categories)
      category_id: data.category_id,
      category_name: data.categories?.name || 'Sans catégorie',
      category_icon: data.categories?.icon,
      category_slug: data.categories?.slug,
      
      // ✅ IMAGE PRINCIPALE (première photo)
      image_url: data.item_photos?.[0]?.image_url || null,
      
      // ✅ TOUTES LES PHOTOS
      photos: (data.item_photos || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    };

    res.json(mapped);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ✅ PATCH /api/equipments/:id - Modifier un équipement
app.patch('/api/equipments/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, daily_price, caution_deposit, location, condition, category_id } = req.body;

    // ✅ VÉRIFIER QUE C'EST LE PROPRIÉTAIRE
    const checkRes = await di.equipmentRepository.supabase
      .from('items')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkRes.error || !checkRes.data) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (checkRes.data.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // ✅ METTRE À JOUR
    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(daily_price !== undefined && { daily_price: parseFloat(daily_price) }),
      ...(caution_deposit !== undefined && { caution_deposit: caution_deposit ? parseFloat(caution_deposit) : null }),
      ...(location && { location }),
      ...(condition && { condition }),
      ...(category_id && { category_id }),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await di.equipmentRepository.supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Update error:', error);
      return res.status(400).json({ message: 'Update failed' });
    }

    console.log('✅ Equipment updated:', id);
    res.json({ message: 'Equipment updated', data: data[0] });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE /api/equipments/:id - Supprimer un équipement
app.delete('/api/equipments/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ VÉRIFIER QUE C'EST LE PROPRIÉTAIRE
    const checkRes = await di.equipmentRepository.supabase
      .from('items')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkRes.error || !checkRes.data) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (checkRes.data.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // ✅ SUPPRIMER (CASCADE DELETE s'occupe des photos et bookings)
    const { error } = await di.equipmentRepository.supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Delete error:', error);
      return res.status(400).json({ message: 'Delete failed' });
    }

    console.log('✅ Equipment deleted:', id);
    res.json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST /api/equipments/:id/images - Upload plusieurs images (pour édition)
app.post('/api/equipments/:id/images', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // ✅ VÉRIFIER QUE C'EST LE PROPRIÉTAIRE
    const checkRes = await di.equipmentRepository.supabase
      .from('items')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkRes.error || !checkRes.data) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (checkRes.data.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // ✅ SUPPRIMER LES ANCIENNES PHOTOS
    await di.equipmentRepository.supabase
      .from('item_photos')
      .delete()
      .eq('item_id', id);

    // ✅ UPLOADER LES NOUVELLES PHOTOS
    const uploadedPhotos = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await SupabaseStorageRepository.uploadEquipmentImage(
        id,
        file.buffer,
        i,
        i === 0 // première image = principale
      );
      uploadedPhotos.push(result);
    }

    console.log('✅ Images uploaded:', uploadedPhotos.length);
    res.json({ success: true, data: uploadedPhotos });
  } catch (err) {
    console.error('❌ Image upload error:', err.message);
    res.status(500).json({ error: 'Image upload failed', details: err.message });
  }
});

app.get('/api/equipments/:id/photos', async (req, res) => {
  try {
    const photos = await di.photosRepository.findByItemId(req.params.id);
    res.json(photos);
  } catch (err) {
    console.error('Photos fetch error:', err);
    res.status(400).json({ message: err.message });
  }
});

// GET /api/equipments - Recherche avec données du propriétaire ET catégorie
app.get('/api/equipments', validateQuery(SearchEquipmentSchema), async (req, res) => {
    try {
        console.log('🔍 Requête /api/equipments reçue');

        // ✅ ÉTAPE 1: RÉCUPÉRER LES ITEMS
        const { data: items, error: itemsError } = await di.equipmentRepository
            .supabase
            .from('items')
            .select(`
                id,
                user_id,
                title,
                description,
                daily_price,
                caution_deposit,
                location,
                condition,
                is_available,
                category_id,
                created_at,
                categories!category_id (
                    id,
                    name,
                    slug,
                    icon
                ),
                item_photos (
                    id,
                    image_url,
                    sort_order
                )
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (itemsError) {
            console.error('❌ Supabase items error:', itemsError);
            throw itemsError;
        }

        // ✅ ÉTAPE 2: RÉCUPÉRER LES USERS SÉPARÉMENT
        const userIds = [...new Set((items || []).map(item => item.user_id))];
        let usersMap = {};
        
        if (userIds.length > 0) {
            const { data: users, error: usersError } = await di.equipmentRepository
                .supabase
                .from('users')
                .select('id, first_name, last_name, avatar_url')
                .in('id', userIds);
            
            if (usersError) {
                console.error('❌ Supabase users error:', usersError);
            } else {
                usersMap = Object.fromEntries((users || []).map(u => [u.id, u]));
                console.log('✅ Users chargés:', Object.keys(usersMap).length);
            }
            
            // ✅ ÉTAPE 2B: RÉCUPÉRER LES REVIEWS POUR CHAQUE USER ET CALCULER LE RATING
            for (const userId of userIds) {
                const reviews = await di.reviewRepository.findByTargetUserId(userId);
                const reviewCount = reviews?.length || 0;
                const avgRating = reviewCount > 0
                    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount).toFixed(1)
                    : 0;
                
                if (usersMap[userId]) {
                    usersMap[userId].review_count = reviewCount;
                    usersMap[userId].rating = parseFloat(avgRating);
                    
                    // DEBUG
                    if (usersMap[userId].first_name === 'Math') {
                        console.log('🔍 DEBUG Math - Reviews:', {
                            userId,
                            reviewCount,
                            avgRating,
                            reviews
                        });
                    }
                }
            }
        }

        console.log(`✅ ${items?.length || 0} équipements trouvés`);

        // ✅ ÉTAPE 3: MAPPER LES DONNÉES
        const results = (items || []).map(item => {
            const user = usersMap[item.user_id];
            
            // ✅ DEBUG: Vérifier les données utilisateur
            if (item.title?.includes('Batte') || item.title?.includes('plaque')) {
                console.log('🔍 DEBUG - Item trouvé:', {
                    itemTitle: item.title,
                    userId: item.user_id,
                    userData: user,
                    userRating: user?.rating,
                    userReviewCount: user?.review_count
                });
            }
            
            return {
            id: item.id,
            title: item.title,
            description: item.description,
            daily_price: item.daily_price,
            caution_deposit: item.caution_deposit,
            location: item.location,
            condition: item.condition,
            is_available: item.is_available,
            created_at: item.created_at,
            
            // ✅ DONNÉES DU PROPRIÉTAIRE
            ownerId: item.user_id,
            owner_id: item.user_id,
            owner_name: user 
                ? `${user.first_name} ${user.last_name}` 
                : 'Propriétaire inconnu',
            ownerName: user 
                ? `${user.first_name} ${user.last_name}` 
                : 'Propriétaire inconnu',
            owner_avatar: user?.avatar_url,
            ownerAvatar: user?.avatar_url,
            owner_rating: user?.rating || 0,
            ownerRating: user?.rating || 0,
            owner_reviews: user?.review_count || 0,
            ownerReviews: user?.review_count || 0,
            review_count: user?.review_count || 0,
            
            // ✅ DONNÉES DE CATÉGORIE (directement)
            category_id: item.category_id,
            category_name: item.categories?.name || 'Sans catégorie',
            category_slug: item.categories?.slug,
            category_icon: item.categories?.icon,
            
            // ✅ IMAGE PRINCIPALE (première photo)
            image_url: item.item_photos?.[0]?.image_url || null
        };
        });

        res.json(results);
    } catch (err) {
        console.error('❌ Search error:', err.message);
        res.status(400).json({ message: 'Erreur de recherche' });
    }
});

// ========== BOOKING ENDPOINTS ==========
app.post('/api/bookings', authMiddleware, validateBody(BookEquipmentSchema), async (req, res) => {
  try {
    const { item_id, start_date, end_date } = req.validated;
    
    // ✅ DEBUG: Vérifier que l'utilisateur est bien authentifié
    if (!req.user || !req.user.id) {
      console.error('❌ Erreur auth: req.user ou req.user.id manquant');
      console.log('   req.user:', req.user);
      console.log('   headers:', req.headers.authorization?.substring(0, 50) + '...');
      return res.status(401).json({ message: 'Authentification invalide - ID utilisateur manquant' });
    }
    
    const borrower_id = req.user.id;
    
    console.log(`📝 Nouvelle réservation: borrower=${borrower_id}, item=${item_id}, dates=${start_date}→${end_date}`);

    const booking = await BookEquipment(
      {
        item_id,
        borrower_id,
        start_date,
        end_date
      },
      di.bookingRepository,
      di.equipmentRepository
    );

    console.log(`✅ Réservation créée: ID=${booking.id}`);

    // 📧 Envoyer les emails de notification (en background)
    (async () => {
      try {
        // Récupérer les infos de l'emprunteur
        const { data: borrower } = await supabaseClient
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', borrower_id)
          .single();

        // Récupérer les infos de l'outil et du propriétaire
        const { data: item } = await supabaseClient
          .from('items')
          .select('title, daily_price, user_id')
          .eq('id', item_id)
          .single();

        if (item && borrower) {
          const { data: owner } = await supabaseClient
            .from('users')
            .select('first_name, last_name, email')
            .eq('id', item.user_id)
            .single();

          if (owner) {
            await emailService.sendNewBookingNotification({
              ownerEmail: owner.email,
              ownerName: owner.first_name || 'Propriétaire',
              borrowerName: borrower.first_name || 'Emprunteur',
              borrowerEmail: borrower.email,
              itemTitle: item.title,
              startDate: start_date,
              endDate: end_date,
              dailyPrice: item.daily_price
            });
          }
        }
      } catch (emailErr) {
        console.error('⚠️  Email error (non-critical):', emailErr.message);
        // L'email n'est pas critique, on continue
      }
    })();

    res.status(201).json(booking);
  } catch (err) {
    console.error('Booking error:', err);
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/bookings/user/:userId
 * Récupère toutes les réservations d'un utilisateur (comme emprunteur ou propriétaire)
 */

// ✅ GET /api/bookings/user/proprietaire
// Endpoint spécifique pour récupérer les bookings où l'utilisateur est propriétaire
app.get('/api/bookings/user/proprietaire', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    // 1. Récupérer tous les items de l'utilisateur
    const { data: itemsOfOwner, error: iError } = await supabaseClient
      .from('items')
      .select('id')
      .eq('user_id', userId);

    if (iError) {
      console.error('❌ Error fetching user items:', iError);
      return res.status(500).json({ message: 'Erreur lors de la récupération des outils' });
    }

    if (!itemsOfOwner || itemsOfOwner.length === 0) {
      return res.json([]); // Pas d'outils = pas de bookings
    }

    // 2. Récupérer les bookings pour ces items
    const itemIds = itemsOfOwner.map(i => i.id);
    
    const { data: bookingsData, error: bError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        items!item_id(id, title, daily_price, user_id),
        users!borrower_id(id, first_name, last_name, avatar_url, email)
      `)
      .in('item_id', itemIds)
      .order('created_at', { ascending: false });

    if (bError) {
      console.error('❌ Error fetching proprietaire bookings:', bError);
      return res.status(500).json({ message: 'Erreur lors de la récupération des réservations' });
    }

    console.log('✅ Proprietaire bookings fetched:', bookingsData?.length || 0, 'for user', userId);
    res.json(bookingsData || []);
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/bookings/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Récupérer les réservations où l'utilisateur est borrower
    const { data: borrowerBookings, error: bError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        items!item_id(id, title, daily_price, user_id),
        users!borrower_id(id, first_name, last_name, avatar_url)
      `)
      .eq('borrower_id', userId)
      .order('created_at', { ascending: false });

    if (bError) {
      console.error('❌ Error fetching borrower bookings:', bError);
    }

    // Récupérer les réservations où l'utilisateur est owner (via items)
    const { data: itemsOfOwner, error: iError } = await supabaseClient
      .from('items')
      .select('id')
      .eq('user_id', userId);

    let ownerBookings = [];
    if (!iError && itemsOfOwner && itemsOfOwner.length > 0) {
      const itemIds = itemsOfOwner.map(i => i.id);
      
      const { data: obsData, error: obError } = await supabaseClient
        .from('bookings')
        .select(`
          *,
          items!item_id(id, title, daily_price, user_id),
          users!borrower_id(id, first_name, last_name, avatar_url)
        `)
        .in('item_id', itemIds)
        .order('created_at', { ascending: false });

      if (obError) {
        console.error('❌ Error fetching owner bookings:', obError);
      } else {
        ownerBookings = obsData || [];
      }
    }

    // Fusionner et dédupliquer, en ajoutant l'owner_id calculé
    const allBookings = [
      ...(borrowerBookings || []),
      ...ownerBookings
    ];
    
    const uniqueBookings = Array.from(
      new Map(allBookings.map(b => [b.id, {
        ...b,
        owner_id: b.items?.user_id  // Ajouter owner_id calculé depuis items.user_id
      }])).values()
    );

    console.log('✅ Bookings fetched:', uniqueBookings.length, 'for user', userId);
    res.json(uniqueBookings || []);
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/bookings/:id
 * Récupère les détails d'une réservation (pour le paiement)
 */
app.get('/api/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await di.bookingRepository.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // ✅ Vérifier que c'est soit l'emprunteur SOIT le propriétaire
    const item = await di.equipmentRepository.findById(booking.item_id);
    const owner_id = item?.owner_id;
    
    console.log('🔍 DEBUG GET /api/bookings/:id');
    console.log('  bookingId:', bookingId);
    console.log('  booking.borrower_id:', booking.borrower_id);
    console.log('  booking.owner_id:', booking.owner_id); 
    console.log('  owner_id from item:', owner_id);
    console.log('  req.user.id:', req.user.id);
    console.log('  Est borrower?:', booking.borrower_id === req.user.id);
    console.log('  Est owner?:', owner_id === req.user.id);
    
    if (booking.borrower_id !== req.user.id && owner_id !== req.user.id) {
      console.log('❌ Accès refusé - pas borrower ni owner');
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Récupérer les infos de l'équipement
    const equipment = await di.equipmentRepository.findById(booking.item_id);

    // Formater la réponse pour le frontend
    res.json({
      id: booking.id,
      equipment_id: booking.item_id,
      equipment_name: equipment?.title || 'Équipement',
      daily_rate: equipment?.daily_price || 0,
      total_days: booking.total_days || 1,
      rental_amount: booking.total_amount || 0,
      deposit_amount: booking.caution_amount || 0,
      start_date: booking.start_date,
      end_date: booking.end_date,
      status: booking.status,
      borrower_id: booking.borrower_id,
      owner_id: equipment?.user_id || null
    });
  } catch (err) {
    console.error('❌ Erreur récupération réservation:', err);
    res.status(500).json({ message: 'Erreur serveur' });
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

/**
 * PATCH /api/bookings/:id/status
 * Mettre à jour le statut d'une réservation
 * Status: pending → confirmed → handed_over → returned
 * SI TRANSITION pending→confirmed, ENVOYER NOTIFICATION AU BORROWER
 */
app.patch('/api/bookings/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    console.log('🔄 Update booking status:', { id, status, userId });

    if (!status || !['pending', 'confirmed', 'handed_over', 'pickup_confirmed', 'returned', 'return_confirmed', 'cancelled'].includes(status)) {
      console.error('❌ Invalid status:', status);
      return res.status(400).json({ message: 'Statut invalide: ' + status });
    }

    // Vérifier que booking existe
    const { data: booking, error: fetchError } = await supabaseClient
      .from('bookings')
      .select('*, items!item_id(user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Récupérer owner_id depuis l'item
    const owner_id = booking.items?.user_id;

    // Vérifier que user est owner ou borrower
    if (owner_id !== userId && booking.borrower_id !== userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Mettre à jour le statut
    const { data, error } = await supabaseClient
      .from('bookings')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Update status error:', error);
      return res.status(400).json({ message: error.message });
    }

    // SI TRANSITION pending→confirmed (propriétaire accepte), ENVOYER NOTIFICATION
    if (booking.status === 'pending' && status === 'confirmed') {
      const targetUserId = booking.borrower_id;
      const message = `✅ Bonne nouvelle! Votre réservation a été acceptée par le propriétaire.`;
      
      try {
        await supabaseClient
          .from('messages')
          .insert([
            {
              sender_id: owner_id,
              receiver_id: targetUserId,
              content: message,
              booking_id: booking.id,
              created_at: new Date().toISOString()
            }
          ]);
        console.log('✅ Notification sent to borrower');
      } catch (msgErr) {
        console.warn('⚠️ Erreur envoi notif:', msgErr);
      }
    }

    // ✅ SI TRANSITION return_confirmed (réservation finie), RENDRE L'ITEM DISPONIBLE
    if (status === 'return_confirmed') {
      try {
        const { error: updateError } = await supabaseClient
          .from('items')
          .update({ is_available: true })
          .eq('id', booking.item_id);
        
        if (updateError) {
          console.warn('⚠️ Erreur mise à jour disponibilité item:', updateError);
        } else {
          console.log(`✅ Item ${booking.item_id} remis disponible après retour confirmé`);
        }
      } catch (err) {
        console.warn('⚠️ Erreur rendre item disponible:', err.message);
      }
    }

    console.log('✅ Booking status updated:', id, '→', status);
    res.json(data[0]);
  } catch (err) {
    console.error('❌ Status update error:', err.message);
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
// ✅ GET /api/reviews - List reviews with filters
app.get('/api/reviews', authMiddleware, async (req, res) => {
  try {
    const { booking_id, reviewer_id } = req.query;
    
    let query = supabaseClient.from('reviews').select('*');
    
    if (booking_id) {
      query = query.eq('booking_id', booking_id);
    }
    
    if (reviewer_id) {
      query = query.eq('author_id', reviewer_id);
    }
    
    const { data: reviews, error } = await query;
    
    if (error) {
      throw error;
    }
    
    res.json(reviews || []);
  } catch (err) {
    console.error('❌ Error fetching reviews:', err);
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/reviews', authMiddleware, validateBody(LeaveReviewSchema), async (req, res) => {
  try {
    const reviewData = { ...req.validated, author_id: req.user.id };
    const review = await LeaveReview(reviewData, di.reviewRepository);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ PATCH /api/reviews/:id - Update existing review
app.patch('/api/reviews/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // Get the review first to verify ownership
    const { data: review, error: fetchError } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !review) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }
    
    // Check if user is the author
    if (review.author_id !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cet avis' });
    }
    
    // Update the review
    const { data: updated, error: updateError } = await supabaseClient
      .from('reviews')
      .update({
        rating: rating || review.rating,
        comment: comment || review.comment,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    console.log('✅ Review updated:', id);
    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating review:', err);
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

/**
 * POST /api/stripe/checkout-session
 * Crée une session Stripe Checkout pour un paiement
 * Protégé : JWT requis
 */
app.post('/api/stripe/checkout-session', authMiddleware, validateBody(z.object({
  bookingId: z.string().uuid(),
  amount: z.number().positive(),
  itemTitle: z.string(),
  itemId: z.string().uuid(),
  days: z.number().positive(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
})), async (req, res) => {
  try {
    const user = req.user;
    const { bookingId, amount, itemTitle, itemId, days, successUrl, cancelUrl } = req.validated;

    console.log('💳 Requête checkout:', { bookingId, amount, user: user.id });

    // Créer la session Stripe
    const sessionUrl = await stripeService.createCheckoutSession({
      bookingId,
      amount: Math.round(amount * 100), // Convertir en centimes
      itemTitle,
      itemId,
      borrowerEmail: user.email,
      days,
      successUrl: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/paiement/success`,
      cancelUrl: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/paiement`
    });

    res.json({ sessionUrl });
  } catch (err) {
    console.error('❌ Erreur checkout:', err);
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET /api/stripe/session/:sessionId
 * Récupère les détails d'une session Stripe
 * Public (mais devrait être protégé en prod)
 */
app.get('/api/stripe/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripeService.getSession(sessionId);

    res.json({
      id: session.id,
      status: session.payment_status,
      amountTotal: session.amount_total,
      paymentIntent: session.payment_intent,
      metadata: session.metadata
    });
  } catch (err) {
    console.error('❌ Erreur récupération session:', err);
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /api/stripe/webhook
 * Webhook pour les événements Stripe
 * NON PROTÉGÉ : Stripe n'utilise pas Bearer tokens
 */
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ message: 'Signature manquante' });
    }

    // Vérifier la signature Stripe
    const event = stripeService.constructEvent(req.body, signature);

    console.log('📨 Événement Stripe reçu:', event.type);

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`⚠️ Type d'événement non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('❌ Erreur webhook:', err);
    res.status(400).json({ message: err.message });
  }
});

/**
 * Gestionnaires d'événements Stripe
 */

async function handleCheckoutSessionCompleted(session) {
  console.log('✅ Paiement complété:', {
    sessionId: session.id,
    bookingId: session.metadata?.bookingId,
    amount: session.amount_total
  });

  try {
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      console.error('❌ bookingId manquant dans metadata');
      return;
    }

    // 1️⃣ METTRE À JOUR LA RÉSERVATION
    const { error: bookingError } = await supabaseClient
      .from('bookings')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (bookingError) {
      console.error('❌ Erreur update booking:', bookingError);
      return;
    }

    // 2️⃣ CRÉER L'ENREGISTREMENT PAYMENT
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        booking_id: bookingId,
        user_id: session.metadata?.userId,
        stripe_payment_intent_id: session.payment_intent,
        amount: session.amount_total / 100, // Stripe en centimes
        platform_fee: Math.floor((session.amount_total * 0.1) / 100), // 10%
        status: 'completed',
        payment_method: 'stripe_card',
        paid_at: new Date().toISOString()
      });

    if (paymentError) {
      console.error('❌ Erreur création payment:', paymentError);
      return;
    }

    console.log('✅ Payment enregistré pour booking:', bookingId);
  } catch (err) {
    console.error('❌ Erreur handleCheckoutSessionCompleted:', err);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('💰 Paiement réussi:', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount
  });
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.error('❌ Paiement échoué:', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    error: paymentIntent.last_payment_error?.message
  });

  try {
    const bookingId = paymentIntent.metadata?.bookingId;
    if (!bookingId) {
      console.error('❌ bookingId manquant dans metadata');
      return;
    }

    // Mettre à jour la réservation avec status 'failed'
    await supabaseClient
      .from('bookings')
      .update({
        status: 'payment_failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    // Enregistrer l'échec de paiement
    await supabaseClient
      .from('payments')
      .insert({
        booking_id: bookingId,
        user_id: paymentIntent.metadata?.userId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        status: 'failed',
        payment_method: 'stripe_card'
      });

    console.log('✅ Paiement échoué enregistré pour booking:', bookingId);
  } catch (err) {
    console.error('❌ Erreur handlePaymentIntentFailed:', err);
  }
}
async function handleChargeRefunded(charge) {
  console.log('♻️ Remboursement traité:', {
    chargeId: charge.id,
    amount: charge.amount_refunded
  });
  // TODO: Mettre à jour le statut de la réservation
}

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({
    message: 'Erreur serveur',
    error: err.message
  });
});

// ========== START SERVER ==========
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Mock API server running on http://localhost:${port}`);
  });
}

// ============================================
// � MESSAGES ENDPOINTS
// ============================================

/**
 * GET /api/messages?userA=id1&userB=id2
 * Récupérer les messages entre deux utilisateurs
 */
app.get('/api/messages', authMiddleware, async (req, res) => {
  try {
    const { userA, userB } = req.query;
    
    if (!userA || !userB) {
      return res.status(400).json({ message: 'userA et userB requis' });
    }

    console.log('🔍 Récupérant messages entre:', userA, 'et', userB);

    // ✅ APPROCHE ALTERNATIVE: Récupérer les deux directions séparément
    const [sent, received] = await Promise.all([
      // Messages envoyés par userA à userB
      supabaseClient
        .from('messages')
        .select('id, sender_id, receiver_id, content, created_at, is_read')
        .eq('sender_id', userA)
        .eq('receiver_id', userB),
      // Messages envoyés par userB à userA
      supabaseClient
        .from('messages')
        .select('id, sender_id, receiver_id, content, created_at, is_read')
        .eq('sender_id', userB)
        .eq('receiver_id', userA)
    ]);

    if (sent.error || received.error) {
      const err = sent.error || received.error;
      console.error('❌ Get messages error:', err);
      return res.status(400).json({ message: err.message });
    }

    // Fusionner et trier
    const allMessages = [...(sent.data || []), ...(received.data || [])]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    console.log('✅ Messages trouvés:', allMessages.length);
    res.json(allMessages);
  } catch (err) {
    console.error('❌ Messages error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/messages
 * Envoyer un message
 */
app.post('/api/messages', authMiddleware, async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !content) {
      return res.status(400).json({ message: 'receiver_id et content requis' });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ message: 'Le message ne peut pas être vide' });
    }

    if (content.length > 5000) {
      return res.status(400).json({ message: 'Le message est trop long (max 5000 caractères)' });
    }

    // ✅ VÉRIFIER QUE CE N'EST PAS UN AUTO-MESSAGE
    if (sender_id === receiver_id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous envoyer de message à vous-même' });
    }

    // Créer le message
    const { data, error } = await supabaseClient
      .from('messages')
      .insert({
        sender_id,
        receiver_id,
        content,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('❌ Create message error:', error);
      return res.status(400).json({ message: error.message });
    }

    console.log('✅ Message créé:', data[0].id);
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('❌ Send message error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/messages/unread-count
 * Récupérer le nombre de messages non lus
 */
app.get('/api/messages/unread-count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { count, error } = await supabaseClient
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);
    
    if (error) {
      console.error('❌ Unread count error:', error);
      return res.status(400).json({ message: error.message });
    }
    
    res.json({ unreadCount: count || 0 });
  } catch (err) {
    console.error('❌ Unread count error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/messages/conversations
 * Récupérer toutes les conversations avec dernier message
 */
app.get('/api/messages/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer tous les messages (envoyés et reçus)
    const { data: allMessages, error } = await supabaseClient
      .from('messages')
      .select('id, sender_id, receiver_id, content, created_at, is_read')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Conversations error:', error);
      return res.status(400).json({ message: error.message });
    }
    
    // Extraire les utilisateurs uniques avec lesquels on a une conversation
    const conversationsMap = new Map();
    
    allMessages?.forEach(msg => {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unreadCount: msg.receiver_id === userId && !msg.is_read ? 1 : 0
        });
      } else {
        const conv = conversationsMap.get(otherUserId);
        if (msg.receiver_id === userId && !msg.is_read) {
          conv.unreadCount++;
        }
      }
    });
    
    res.json(Array.from(conversationsMap.values()));
  } catch (err) {
    console.error('❌ Conversations error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

/**
 * PATCH /api/messages/:id/read
 * Marquer un message comme lu
 */
app.patch('/api/messages/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseClient
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// �📦 CATEGORIES ENDPOINTS
// ============================================

/**
 * GET /api/categories
 * Récupérer toutes les catégories
 */
app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message vide ou invalide' });
    }
    
    if (message.trim().length === 0) {
      return res.status(400).json({ error: 'Message vide' });
    }
    
    // Appeler le service chat
    console.log(`Chat request from ${req.user.email}: "${message.substring(0, 50)}..."`);
    const response = await chatService.chat(message, req.user.id);
    
    // Retourner la réponse
    res.json({ 
      message: response,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ 
      error: err.message || 'Erreur serveur lors du chat'
    });
  }
});

/**
 * GET /api/categories
 * Récupérer toutes les catégories
 */
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('id, name, slug, icon, description')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);

    res.json(data || []);
  } catch (err) {
    console.error('❌ Get categories error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/test-email-noauth
 * Endpoint de TEST: Envoyer un email de test (SANS authentification)
 */
app.post('/api/test-email-noauth', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        message: 'Paramètres manquants: to, subject, html' 
      });
    }

    console.log('\n🧪 === TEST EMAIL DIRECT ===');
    console.log('📤 Envoi d\'un email de test...');
    console.log('   To:', to);
    console.log('   Subject:', subject);

    const result = await emailService.sendEmail({ to, subject, html });

    if (result.success) {
      console.log('✅ Email test envoyé avec succès');
      console.log('   ID Resend:', result.emailId);
      res.json({ 
        success: true, 
        message: 'Email de test envoyé',
        resendId: result.emailId
      });
    } else {
      console.error('❌ Erreur Resend:', result.error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur Resend',
        error: result.error 
      });
    }
  } catch (err) {
    console.error('❌ Test email error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/test-email
 * Endpoint de TEST: Envoyer un email de test pour déboguer (avec auth)
 */
app.post('/api/test-email', authMiddleware, async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        message: 'Paramètres manquants: to, subject, html' 
      });
    }

    console.log('\n🧪 === TEST EMAIL DIRECT ===');
    console.log('📤 Envoi d\'un email de test...');
    console.log('   To:', to);
    console.log('   Subject:', subject);

    const result = await emailService.sendEmail({ to, subject, html });

    if (result.success) {
      console.log('✅ Email test envoyé avec succès');
      console.log('   ID Resend:', result.emailId);
      res.json({ 
        success: true, 
        message: 'Email de test envoyé',
        resendId: result.emailId
      });
    } else {
      console.error('❌ Erreur Resend:', result.error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur Resend',
        error: result.error 
      });
    }
  } catch (err) {
    console.error('❌ Test email error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
