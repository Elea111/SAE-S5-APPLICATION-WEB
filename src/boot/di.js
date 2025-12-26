import SupabaseUserRepository from '../infra/repositories/SupabaseUserRepository.js';
import SupabaseEquipmentRepository from '../infra/repositories/SupabaseEquipmentRepository.js';
import SupabaseBookingRepository from '../infra/repositories/SupabaseBookingRepository.js';
import SupabasePaymentRepository from '../infra/repositories/SupabasePaymentRepository.js';
import SupabaseReviewRepository from '../infra/repositories/SupabaseReviewRepository.js';
import SupabaseMessageRepository from '../infra/repositories/SupabaseMessageRepository.js';

// Mock Stripe
import MockStripeService from '../infra/services/MockStripeService.js';
import StripePaymentAdapter from '../infra/adapters/StripePaymentAdapter.js';

const mockStripe = new MockStripeService();
const stripeAdapter = new StripePaymentAdapter(mockStripe);

export default {
  userRepository: SupabaseUserRepository,
  equipmentRepository: SupabaseEquipmentRepository,
  bookingRepository: SupabaseBookingRepository,
  paymentRepository: SupabasePaymentRepository,
  reviewRepository: SupabaseReviewRepository,
  messageRepository: SupabaseMessageRepository,
  stripeAdapter,
};
