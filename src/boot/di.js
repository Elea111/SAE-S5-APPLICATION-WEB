import InMemoryUserRepository from '../infra/repositories/InMemoryUserRepository';
import InMemoryEquipmentRepository from '../infra/repositories/InMemoryEquipmentRepository';
import InMemoryBookingRepository from '../infra/repositories/InMemoryBookingRepository';
import InMemoryReviewRepository from '../infra/repositories/InMemoryReviewRepository';
import InMemoryMessageRepository from '../infra/repositories/InMemoryMessageRepository';

// New imports for mock stripe
import MockStripeService from '../infra/services/MockStripeService';
import StripePaymentAdapter from '../infra/adapters/StripePaymentAdapter';

const userRepository = new InMemoryUserRepository();
const equipmentRepository = new InMemoryEquipmentRepository();
const bookingRepository = new InMemoryBookingRepository();
const reviewRepository = new InMemoryReviewRepository();
const messageRepository = new InMemoryMessageRepository();

// Instantiate mock stripe service + adapter and expose as paymentRepository
const mockStripe = new MockStripeService();
const stripeAdapter = new StripePaymentAdapter(mockStripe);

// Replace previous in-memory payment repository with Stripe adapter (mock)
const paymentRepository = stripeAdapter;

export default {
    userRepository,
    equipmentRepository,
    bookingRepository,
    paymentRepository,
    reviewRepository,
    messageRepository,
};
