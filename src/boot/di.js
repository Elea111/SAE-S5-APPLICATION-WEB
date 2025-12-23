import InMemoryUserRepository from '../infra/repositories/InMemoryUserRepository.js';
import InMemoryEquipmentRepository from '../infra/repositories/InMemoryEquipmentRepository.js';
import InMemoryBookingRepository from '../infra/repositories/InMemoryBookingRepository.js';
import InMemoryReviewRepository from '../infra/repositories/InMemoryReviewRepository.js';
import InMemoryMessageRepository from '../infra/repositories/InMemoryMessageRepository.js';

// Stripe mock imports
import MockStripeService from '../infra/services/MockStripeService.js';
import StripePaymentAdapter from '../infra/adapters/StripePaymentAdapter.js';

const userRepository = new InMemoryUserRepository();
const equipmentRepository = new InMemoryEquipmentRepository();
const bookingRepository = new InMemoryBookingRepository();
const reviewRepository = new InMemoryReviewRepository();
const messageRepository = new InMemoryMessageRepository();

// mock stripe adapter
const mockStripe = new MockStripeService();
const stripeAdapter = new StripePaymentAdapter(mockStripe);
const paymentRepository = stripeAdapter;

// Seed simple mock data (users, categories, equipments) if empty
// This runs synchronously because InMemoryRepository.create sets the store immediately.
(function seedMockData() {
    // create sample users
    (async () => {
        try {
            const u1 = await userRepository.create({ firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com', password: 'secret', isPro: false });
            const u2 = await userRepository.create({ firstName: 'Marie', lastName: 'Martin', email: 'marie@example.com', password: 'secret', isPro: true });

            // sample equipments
            await equipmentRepository.create({
                ownerId: u1.id,
                title: 'Perceuse-visseuse sans fil 18V',
                description: 'Perceuse-visseuse professionnelle, batterie lithium, coffret et chargeur fournis.',
                dailyPrice: 25,
                category: 'power_tools',
                condition: 'good',
                image: '/images/perceuse.jpg'
            });

            await equipmentRepository.create({
                ownerId: u2.id,
                title: 'Scie circulaire plongeante 1600W',
                description: 'Scie précise avec rail 140cm, idéale pour coupes rectilignes.',
                dailyPrice: 40,
                category: 'building',
                condition: 'like_new',
                image: '/images/scie.jpg'
            });

            await equipmentRepository.create({
                ownerId: u1.id,
                title: 'Ponceuse à bande 720W',
                description: 'Ponceuse pour menuiserie avec aspiration intégrée.',
                dailyPrice: 18,
                category: 'power_tools',
                condition: 'used',
                image: '/images/ponceuse.jpg'
            });
        } catch (e) {
            // ignore if seed already done
        }
    })();
})();

export default {
    userRepository,
    equipmentRepository,
    bookingRepository,
    paymentRepository,
    reviewRepository,
    messageRepository,
};
