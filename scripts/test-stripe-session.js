#!/usr/bin/env node

/**
 * Script pour tester la création d'une session Stripe
 * Usage: node scripts/test-stripe-session.js
 */

import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
});

console.log('🧪 TEST CREATION SESSION STRIPE\n');
console.log('='.repeat(50));

try {
  console.log('\n💳 Création d\'une session de test...\n');

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: 'test@example.com',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Perceuse 18V - Test',
            description: 'Location pour 3 jour(s)',
            metadata: {
              itemId: '123e4567-e89b-12d3-a456-426614174000',
              bookingId: '987e6543-e89b-12d3-a456-426614174999'
            }
          },
          unit_amount: 7797 // 77.97€ en centimes
        },
        quantity: 1
      }
    ],
    success_url: 'http://localhost:3000/paiement/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:3000/paiement',
    metadata: {
      bookingId: '987e6543-e89b-12d3-a456-426614174999',
      itemId: '123e4567-e89b-12d3-a456-426614174000',
      days: '3'
    }
  });

  console.log('✅ SESSION CRÉÉE AVEC SUCCÈS!\n');
  console.log('Détails:');
  console.log('---');
  console.log('Session ID:', session.id);
  console.log('URL Checkout:', session.url);
  console.log('Status:', session.payment_status);
  console.log('Mode:', session.mode);
  
  console.log('\n🔗 Lien à tester:');
  console.log('---');
  console.log(session.url);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ La session a été créée! Vous pouvez tester le paiement.');
  console.log('='.repeat(50) + '\n');

} catch (error) {
  console.error('❌ ERREUR:', error.message);
  if (error.type) {
    console.error('Type d\'erreur:', error.type);
  }
  console.error('\nDétails:', error);
  process.exit(1);
}
