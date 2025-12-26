import { z } from 'zod';

// ========== AUTH SCHEMAS ==========
export const RegisterSchema = z.object({
  firstName: z.string().min(2, "Prénom requis (min 2 caractères)"),
  lastName: z.string().min(2, "Nom requis (min 2 caractères)"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe min 6 caractères"),
  isPro: z.boolean().optional().default(false)
});

export const LoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis")
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  companyName: z.string().optional(),
  siret: z.string().optional()
});

// ========== EQUIPMENT SCHEMAS ==========
export const PublishEquipmentSchema = z.object({
  title: z.string().min(5, "Titre min 5 caractères").max(255),
  description: z.string().min(20, "Description min 20 caractères"),
  daily_price: z.number().positive("Prix doit être positif"),
  caution_deposit: z.number().positive().optional(),
  location: z.string().min(3).optional(),
  category_id: z.string().uuid().optional(),
  condition: z.enum(['neuf', 'bon', 'acceptable']).optional(),
  specifications: z.record(z.any()).optional()
});

export const SearchEquipmentSchema = z.object({
  title: z.string().optional(),
  category_id: z.string().uuid().optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  is_available: z.coerce.boolean().optional(),
  limit: z.coerce.number().max(100).default(50).optional(),
  offset: z.coerce.number().default(0).optional()
});

// ========== BOOKING SCHEMAS ==========
export const BookEquipmentSchema = z.object({
  item_id: z.string().uuid("ID équipement invalide"),
  start_date: z.string().datetime("Date de début invalide"),
  end_date: z.string().datetime("Date de fin invalide"),
  borrower_message: z.string().optional(),
  total_amount: z.number().positive().optional()
}).refine(
  (data) => new Date(data.end_date) > new Date(data.start_date),
  { message: "La date de fin doit être après la date de début", path: ["end_date"] }
);

export const UpdateBookingSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'completed']).optional(),
  pickup_confirmed_at: z.string().datetime().optional(),
  return_confirmed_at: z.string().datetime().optional()
});

// ========== PAYMENT SCHEMAS ==========
export const ProcessPaymentSchema = z.object({
  booking_id: z.string().uuid("ID réservation invalide"),
  amount: z.number().positive("Montant doit être positif"),
  currency: z.string().default('EUR'),
  payment_method: z.enum(['card', 'bank_transfer']).default('card').optional()
});

// ========== REVIEW SCHEMAS ==========
export const LeaveReviewSchema = z.object({
  booking_id: z.string().uuid("ID réservation invalide"),
  target_user_id: z.string().uuid("ID utilisateur invalide"),
  rating: z.number().min(1).max(5, "Note entre 1 et 5"),
  comment: z.string().min(10, "Commentaire min 10 caractères").optional(),
  type: z.enum(['borrower', 'lender']).optional()
});

// ========== MESSAGE SCHEMAS ==========
export const SendMessageSchema = z.object({
  receiver_id: z.string().uuid("ID destinataire invalide"),
  content: z.string().min(1, "Message requis").max(5000),
  booking_id: z.string().uuid().optional()
});

export const GetMessagesSchema = z.object({
  otherUser: z.string().uuid("ID utilisateur invalide")
});
