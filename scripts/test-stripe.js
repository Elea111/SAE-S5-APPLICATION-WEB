#!/usr/bin/env node

/**
 * Script de test pour vérifier la connexion Stripe
 * Usage: node scripts/test-stripe.js
 */

import dotenv from 'dotenv';
import Stripe from 'stripe';

// Charger les env vars
dotenv.config();

console.log('🔍 TEST STRIPE CONNECTION\n');
console.log('=' .repeat(50));

// 1️⃣ Vérifier les variables d'environnement
console.log('\n📋 Variables d\'environnement:');
console.log('---');

const secretKey = process.env.STRIPE_SECRET_KEY;
const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (secretKey) {
  console.log('✅ STRIPE_SECRET_KEY:', secretKey.substring(0, 10) + '...' + secretKey.substring(secretKey.length - 5));
} else {
  console.error('❌ STRIPE_SECRET_KEY: NON DÉFINI');
}

if (publishableKey) {
  console.log('✅ REACT_APP_STRIPE_PUBLISHABLE_KEY:', publishableKey.substring(0, 10) + '...' + publishableKey.substring(publishableKey.length - 5));
} else {
  console.error('❌ REACT_APP_STRIPE_PUBLISHABLE_KEY: NON DÉFINI');
}

// 2️⃣ Initialiser Stripe
console.log('\n🔗 Initialisation Stripe:');
console.log('---');

try {
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-06-20'
  });

  console.log('✅ Client Stripe créé avec succès');

  // 3️⃣ Tester la connexion à l'API Stripe
  console.log('\n⚡ Test de connexion à l\'API Stripe:');
  console.log('---');

  try {
    const account = await stripe.account.retrieve();
    console.log('✅ Connexion réussie à l\'API Stripe');
    console.log('   Compte ID:', account.id);
    console.log('   Status:', account.charges_enabled ? '✅ Paiements activés' : '❌ Paiements désactivés');
    console.log('   Type:', account.type);

    // 4️⃣ Lister les webhooks configurés
    console.log('\n🔔 Webhooks configurés:');
    console.log('---');

    const webhooks = await stripe.webhookEndpoints.list({ limit: 5 });
    if (webhooks.data.length > 0) {
      webhooks.data.forEach((wh) => {
        console.log(`✅ ${wh.url}`);
        console.log(`   Status: ${wh.status}`);
        console.log(`   Events: ${wh.enabled_events.join(', ')}`);
      });
    } else {
      console.log('⚠️  Aucun webhook configuré');
    }

    // 5️⃣ Résumé final
    console.log('\n' + '='.repeat(50));
    console.log('✅ TOUT EST CONNECTÉ! Stripe fonctionne correctement.');
    console.log('='.repeat(50) + '\n');

  } catch (apiError) {
    console.error('❌ Erreur connexion API:', apiError.message);
    if (apiError.type === 'StripeAuthenticationError') {
      console.error('   → Clé API invalide ou expirée');
    } else if (apiError.type === 'StripeConnectionError') {
      console.error('   → Erreur réseau - Vérifiez votre connexion internet');
    }
    process.exit(1);
  }

} catch (initError) {
  console.error('❌ Erreur initialisation Stripe:', initError.message);
  process.exit(1);
}
