#!/usr/bin/env node

/**
 * Script pour tester l'endpoint /api/stripe/checkout-session
 * Usage: node scripts/test-stripe-endpoint.js
 */

import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 TEST ENDPOINT STRIPE\n');
console.log('='.repeat(50));

const API_BASE = 'http://localhost:4000';

try {
  // Créer un token JWT valide (pour test)
  // Format simplifié pour test local
  const authToken = 'test-token-for-stripe-endpoint';

  console.log('\n📡 Appel à /api/stripe/checkout-session...\n');

  const response = await fetch(`${API_BASE}/api/stripe/checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      bookingId: '987e6543-e89b-12d3-a456-426614174999',
      amount: 77.97,
      itemTitle: 'Perceuse 18V',
      itemId: '123e4567-e89b-12d3-a456-426614174000',
      days: 3
    })
  });

  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);

  const data = await response.json();

  if (response.ok) {
    console.log('\n✅ SUCCÈS!\n');
    console.log('Session URL:', data.sessionUrl);
  } else {
    console.log('\n❌ ERREUR!\n');
    console.log('Message:', data.message);
    console.log('Erreur complète:', JSON.stringify(data, null, 2));
  }

  console.log('\n' + '='.repeat(50) + '\n');

} catch (error) {
  console.error('❌ ERREUR RÉSEAU:', error.message);
  console.error('\nAssurez-vous que:');
  console.error('1. Le serveur tourne sur http://localhost:4000');
  console.error('2. Les variables .env sont chargées');
  process.exit(1);
}
