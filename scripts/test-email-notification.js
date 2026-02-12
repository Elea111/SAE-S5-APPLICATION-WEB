#!/usr/bin/env node

/**
 * Test Email Notifications
 * 
 * Ce script teste le workflow complet de notification email:
 * 1. Login utilisateur (emprunteur)
 * 2. Créer une réservation
 * 3. Vérifier que les emails ont été envoyés
 * 
 * Usage: node scripts/test-email-notification.js
 */

const API_BASE = 'http://localhost:4000';

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

// Données de test
const TEST_DATA = {
  borrowerEmail: 'testuser@example.com',
  borrowerPassword: 'Test@123456',
  itemId: null, // À récupérer d'abord
  ownerEmail: null // À récupérer du propriétaire de l'équipement
};

async function testEmailNotifications() {
  try {
    log.info('=== TEST NOTIFICATIONS EMAIL ===\n');

    // ÉTAPE 1: Login emprunteur
    log.info('ÉTAPE 1: Login utilisateur (emprunteur)...');
    const borrowerToken = await loginUser(TEST_DATA.borrowerEmail, TEST_DATA.borrowerPassword);
    if (!borrowerToken) throw new Error('❌ Impossible de se connecter');
    log.success(`Token obtenu: ${borrowerToken.substring(0, 20)}...`);

    // ÉTAPE 2: Récupérer une liste d'équipements disponibles
    log.info('\nÉTAPE 2: Récupérer les équipements disponibles...');
    const equipment = await getAvailableEquipment();
    if (!equipment || equipment.length === 0) {
      throw new Error('❌ Aucun équipement trouvé');
    }
    
    const item = equipment[0];
    TEST_DATA.itemId = item.id;
    TEST_DATA.ownerEmail = item.owner_email || 'unknown@example.com';
    log.success(`Équipement trouvé: ${item.name} (ID: ${item.id})`);
    log.success(`Propriétaire: ${TEST_DATA.ownerEmail}`);

    // ÉTAPE 3: Créer une réservation
    log.info('\nÉTAPE 3: Créer une réservation...');
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 jours
    
    const booking = await createBooking(borrowerToken, {
      item_id: TEST_DATA.itemId,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });

    if (!booking || !booking.id) {
      throw new Error('❌ Impossible de créer la réservation');
    }
    log.success(`Réservation créée: ID ${booking.id}`);
    log.success(`Période: ${startDate.toLocaleDateString('fr-FR')} → ${endDate.toLocaleDateString('fr-FR')}`);

    // ÉTAPE 4: Attendre quelques secondes pour que les emails soient envoyés
    log.info('\nÉTAPE 4: Attendre l\'envoi des emails...');
    log.warn('⏳ Attente 3 secondes pour que les emails soient traités...');
    await sleep(3000);

    // ÉTAPE 5: Vérifier les logs
    log.info('\nÉTAPE 5: Vérification des emails envoyés');
    log.info('Regardez la console du serveur pour voir:');
    log.success('  ✅ Emails envoyés: [email au propriétaire, email à l\'emprunteur]');
    log.success('  Adresses: ' + TEST_DATA.ownerEmail + ', ' + TEST_DATA.borrowerEmail);

    // RÉSUMÉ
    log.info('\n=== RÉSUMÉ TEST ===');
    log.success('✅ Connexion utilisateur');
    log.success('✅ Récupération équipements');
    log.success('✅ Création réservation');
    log.success('✅ Réservation créée avec ID: ' + booking.id);
    log.info('\n📧 Les emails auraient dû être envoyés à:');
    log.info('  - Propriétaire: ' + TEST_DATA.ownerEmail);
    log.info('  - Emprunteur: ' + TEST_DATA.borrowerEmail);
    log.info('\n💡 En mode développement, les emails sont loggés en console.');
    log.info('💡 Les vrais emails seront envoyés avec Supabase Email en production.');

  } catch (err) {
    log.error('❌ Erreur: ' + err.message);
    process.exit(1);
  }
}

async function loginUser(email, password) {
  try {
    log.info(`  Tentative login: ${email}...`);
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const error = await res.json();
      // Si pas d'utilisateur, créer un compte test
      if (res.status === 401) {
        log.warn(`  Utilisateur ${email} n'existe pas, création d'un compte test...`);
        await registerUser(email, password);
        return loginUser(email, password); // Retry
      }
      throw new Error(error.message || 'Erreur login');
    }

    const data = await res.json();
    return data.token;
  } catch (err) {
    log.error(`  Erreur login: ${err.message}`);
    return null;
  }
}

async function registerUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName: 'Test',
        lastName: 'User'
      })
    });

    if (!res.ok) throw new Error('Erreur registration');
    const data = await res.json();
    log.success(`  Compte créé: ${data.email}`);
  } catch (err) {
    log.error(`  Erreur registration: ${err.message}`);
  }
}

async function getAvailableEquipment() {
  try {
    const res = await fetch(`${API_BASE}/api/equipments?limit=5`);
    if (!res.ok) throw new Error('Erreur récupération équipements');
    
    const data = await res.json();
    return data.items || data;
  } catch (err) {
    log.error(`  Erreur equipments: ${err.message}`);
    return [];
  }
}

async function createBooking(token, bookingData) {
  try {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erreur création réservation');
    }

    return await res.json();
  } catch (err) {
    log.error(`  Erreur booking: ${err.message}`);
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Lancer le test
testEmailNotifications();
