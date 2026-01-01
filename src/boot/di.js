import SupabaseUserRepository from '../infra/repositories/SupabaseUserRepository.js';
import SupabaseEquipmentRepository from '../infra/repositories/SupabaseEquipmentRepository.js';
import SupabaseBookingRepository from '../infra/repositories/SupabaseBookingRepository.js';
import SupabasePaymentRepository from '../infra/repositories/SupabasePaymentRepository.js';
import SupabaseReviewRepository from '../infra/repositories/SupabaseReviewRepository.js';
import SupabaseMessageRepository from '../infra/repositories/SupabaseMessageRepository.js';
import SupabasePhotosRepository from '../infra/repositories/SupabasePhotosRepository.js';

const di = {
  userRepository: new SupabaseUserRepository(),
  equipmentRepository: new SupabaseEquipmentRepository(),
  bookingRepository: new SupabaseBookingRepository(),
  paymentRepository: new SupabasePaymentRepository(),
  reviewRepository: new SupabaseReviewRepository(),
  messageRepository: new SupabaseMessageRepository(),
  photosRepository: new SupabasePhotosRepository()
};

export default di;
