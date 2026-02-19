#!/usr/bin/env node

/**
 * Test d'envoi d'emails lors d'une réservation
 * Simule: Propriétaire publie outil → Emprunteur réserve → Emails envoyés
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000';
const OWNER_EMAIL = 'owner-test-' + Date.now() + '@gmail.com';
const BORROWER_EMAIL = 'borrower-test-' + Date.now() + '@gmail.com';

console.log('\n🧪 === TEST EMAIL BOOKING FLOW ===\n');

// ============= STEP 1: Créer le compte propriétaire =============
console.log('📝 ÉTAPE 1: Créer compte propriétaire...');
console.log('   Email:', OWNER_EMAIL);

let ownerResponse = await fetch(`${API_BASE}/api/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Owner',
    lastName: 'Test',
    email: OWNER_EMAIL,
    password: 'Password123!',
    isPro: true
  })
});

let ownerData = await ownerResponse.json();
console.log('   Status:', ownerResponse.status);

if (!ownerResponse.ok) {
  if (ownerData.message && ownerData.message.includes('existe')) {
    console.log('   ⚠️  Email existe déjà, tentative de login...');
    ownerResponse = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: OWNER_EMAIL,
        password: 'Password123!'
      })
    });
    ownerData = await ownerResponse.json();
  } else {
    console.error('   ❌ Erreur création propriétaire:', ownerData.message);
    process.exit(1);
  }
}

const ownerToken = ownerData.token;
const ownerId = ownerData.id;
console.log('✅ Propriétaire créé/connecté');
console.log('   ID:', ownerId);
console.log('   Token:', ownerToken.substring(0, 30) + '...');

// ============= STEP 2: Créer le compte emprunteur =============
console.log('\n📝 ÉTAPE 2: Créer compte emprunteur...');
console.log('   Email:', BORROWER_EMAIL);

let borrowerResponse = await fetch(`${API_BASE}/api/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Borrower',
    lastName: 'Test',
    email: BORROWER_EMAIL,
    password: 'Password123!',
    isPro: false
  })
});

let borrowerData = await borrowerResponse.json();

if (!borrowerResponse.ok) {
  if (borrowerData.message && borrowerData.message.includes('existe')) {
    console.log('   ⚠️  Email existe déjà, tentative de login...');
    borrowerResponse = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: BORROWER_EMAIL,
        password: 'Password123!'
      })
    });
    borrowerData = await borrowerResponse.json();
  } else {
    console.error('   ❌ Erreur création emprunteur:', borrowerData.message);
    process.exit(1);
  }
}

const borrowerToken = borrowerData.token;
const borrowerId = borrowerData.id;
console.log('✅ Emprunteur créé/connecté');
console.log('   ID:', borrowerId);
console.log('   Token:', borrowerToken.substring(0, 30) + '...');

// ============= STEP 3: Propriétaire crée un outil =============
console.log('\n📝 ÉTAPE 3: Propriétaire crée un outil...');

const itemResponse = await fetch(`${API_BASE}/api/items`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ownerToken}`
  },
  body: JSON.stringify({
    title: 'Perceuse Test Email',
    description: 'Une perceuse pour tester les emails',
    daily_price: 50,
    caution_deposit: 100,
    location: 'Test City',
    condition: 'Excellent',
    category_id: 1
  })
});

const itemData = await itemResponse.json();
if (!itemResponse.ok) {
  console.error('   ❌ Erreur création outil:', itemData.message);
  process.exit(1);
}

const itemId = itemData.id;
console.log('✅ Outil créé');
console.log('   ID:', itemId);
console.log('   Titre:', itemData.title);
console.log('   Prix:', itemData.daily_price + '€/jour');

// ============= STEP 4: Emprunteur réserve l'outil =============
console.log('\n📝 ÉTAPE 4: Emprunteur crée une réservation...');

// Dates: aujourd'hui + 5 jours
const today = new Date();
const startDate = today.toISOString().split('T')[0];
const endDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

console.log('   Dates:', startDate, '→', endDate);

const bookingResponse = await fetch(`${API_BASE}/api/bookings`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${borrowerToken}`
  },
  body: JSON.stringify({
    item_id: itemId,
    start_date: startDate,
    end_date: endDate
  })
});

const bookingData = await bookingResponse.json();
if (!bookingResponse.ok) {
  console.error('   ❌ Erreur réservation:', bookingData.message || bookingData);
  process.exit(1);
}

const bookingId = bookingData.id;
console.log('✅ Réservation créée');
console.log('   ID:', bookingId);
console.log('   Montant:', bookingData.total_amount + '€');

// ============= STEP 5: Vérifier les logs serveur =============
console.log('\n🔍 ÉTAPE 5: Analyse des emails...');
console.log('');
console.log('📧 Les emails DOIVENT avoir été envoyés à:');
console.log('   ✉️  Propriétaire:', OWNER_EMAIL);
console.log('   ✉️  Emprunteur:', BORROWER_EMAIL);
console.log('');
console.log('💡 VÉRIFICATIONS: ');
console.log('   1. Regarde la console du serveur (logs "✅ Email envoyé à...")');
console.log('   2. Vérifie les email inboxes des deux comptes');
console.log('   3. Regarde le dashboard Resend: https://resend.com/emails');
console.log('');

// ============= TEST DIRECT =============
console.log('📡 TEST DIRECT: Appel POST /api/bookings capturé');
console.log('');
console.log('Server logs attendus:');
console.log('  📝 Nouvelle réservation: borrower=XXX, item=XXX...');
console.log('  ✅ Réservation créée: ID=XXX');
console.log('  ✅ Email envoyé à', OWNER_EMAIL, '(ID: re_...)');
console.log('  ✅ Email envoyé à', BORROWER_EMAIL, '(ID: re_...)');
console.log('');

// ============= STEP 6: Test supplémentaire - Appel direct Resend =============
console.log('🧪 ÉTAPE 6: Test API Resend directement...');

try {
  const testEmailResponse = await fetch('http://localhost:4000/api/test-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${borrowerToken}`
    },
    body: JSON.stringify({
      to: BORROWER_EMAIL,
      subject: '🧪 Test Direct API Resend',
      html: '<h1>Test Email</h1><p>Si vous recevez cet email, Resend fonctionne!</p>'
    })
  });

  const testResult = await testEmailResponse.json();
  if (testEmailResponse.ok) {
    console.log('✅ Email de test envoyé directement');
    console.log('   Recipient:', BORROWER_EMAIL);
  }
} catch (err) {
  console.log('⚠️  Endpoint test-email non disponible (normal)');
}

console.log('\n' + '='.repeat(60));
console.log('✅ TEST COMPLET - Regarde les logs du serveur!');
console.log('='.repeat(60) + '\n');
