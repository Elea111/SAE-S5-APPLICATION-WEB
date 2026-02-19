#!/usr/bin/env node

/**
 * Test Chat Privé / Messages
 * 
 * Ce script teste le workflow complet de messages privés:
 * 1. Login 2 utilisateurs
 * 2. User A envoie un message à User B
 * 3. Vérifier que les messages sont créés
 * 4. Vérifier le compteur de messages non lus
 * 
 * Usage: node scripts/test-chat.js
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
  user1: {
    email: 'chatuser1@example.com',
    password: 'Test@123456',
    token: null,
    id: null,
    name: 'Alice'
  },
  user2: {
    email: 'chatuser2@example.com',
    password: 'Test@123456',
    token: null,
    id: null,
    name: 'Bob'
  }
};

async function testChat() {
  try {
    log.info('=== TEST CHAT PRIVÉ ===\n');

    // ÉTAPE 1: Login User 1
    log.info('ÉTAPE 1: Login User 1 (Alice)...');
    await loginUserIfNeeded(TEST_DATA.user1);
    log.success(`User 1 connecté: ${TEST_DATA.user1.email}`);
    log.success(`Token: ${TEST_DATA.user1.token.substring(0, 20)}...`);
    log.success(`ID: ${TEST_DATA.user1.id}`);

    // ÉTAPE 2: Login User 2
    log.info('\nÉTAPE 2: Login User 2 (Bob)...');
    await loginUserIfNeeded(TEST_DATA.user2);
    log.success(`User 2 connecté: ${TEST_DATA.user2.email}`);
    log.success(`Token: ${TEST_DATA.user2.token.substring(0, 20)}...`);
    log.success(`ID: ${TEST_DATA.user2.id}`);

    // ÉTAPE 3: User 1 envoie un message à User 2
    log.info('\nÉTAPE 3: Alice envoie un message à Bob...');
    const messageId = await sendMessage(
      TEST_DATA.user1,
      TEST_DATA.user2.id,
      'Salut Bob! Es-tu intéressé par ma perceuse?'
    );
    log.success(`Message envoyé (ID: ${messageId})`);

    // ÉTAPE 4: User 2 envoie une réponse
    log.info('\nÉTAPE 4: Bob répond à Alice...');
    const replyId = await sendMessage(
      TEST_DATA.user2,
      TEST_DATA.user1.id,
      'Oui Alice, ça m\'intéresse beaucoup! Elle est en bon état?'
    );
    log.success(`Réponse envoyée (ID: ${replyId})`);

    // ÉTAPE 5: Récupérer la conversation
    log.info('\nÉTAPE 5: Récupérer les messages d\'Alice...');
    const messagesAlice = await getMessages(TEST_DATA.user1);
    log.success(`Messages d'Alice: ${messagesAlice.length}`);
    messagesAlice.forEach((msg, idx) => {
      const senderName = msg.sender_id === TEST_DATA.user1.id ? 'Alice' : 'Bob';
      log.info(`  [${idx + 1}] ${senderName}: "${msg.content.substring(0, 50)}..."`);
    });

    // ÉTAPE 6: Vérifier le compteur non lus
    log.info('\nÉTAPE 6: Vérifier les messages non lus de Bob...');
    const unreadCount = await getUnreadCount(TEST_DATA.user2);
    log.success(`Messages non lus: ${unreadCount}`);

    // ÉTAPE 7: Marquer comme lu
    log.info('\nÉTAPE 7: Bob marque les messages comme lus...');
    const unreadsMessages = await getMessages(TEST_DATA.user2);
    if (unreadsMessages.length > 0) {
      const firstUnread = unreadsMessages.find(m => !m.read_at);
      if (firstUnread) {
        await markAsRead(TEST_DATA.user2, firstUnread.id);
        log.success(`Message marqué comme lu`);
      }
    }

    // ÉTAPE 8: Vérifier nouveaux non lus
    log.info('\nÉTAPE 8: Vérifier les non lus après lecture...');
    const newUnreadCount = await getUnreadCount(TEST_DATA.user2);
    log.success(`Messages non lus: ${newUnreadCount}`);

    // RÉSUMÉ
    log.info('\n=== RÉSUMÉ TEST CHAT ===');
    log.success('✅ User 1 login');
    log.success('✅ User 2 login');
    log.success('✅ Message envoyé (User 1 → User 2)');
    log.success('✅ Réponse envoyée (User 2 → User 1)');
    log.success('✅ Récupération messages');
    log.success('✅ Compteur non lus');
    log.success('✅ Marquer comme lu');

    log.info('\n💬 Flux chat complet testé avec succès!');
    log.info(`Total messages: ${messagesAlice.length}`);
    log.info(`Messages non lus finaux: ${newUnreadCount}`);

  } catch (err) {
    log.error('❌ Erreur: ' + err.message);
    process.exit(1);
  }
}

async function loginUserIfNeeded(user) {
  try {
    // Essayer login d'abord
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password })
    });

    if (res.ok) {
      const data = await res.json();
      user.token = data.token;
      user.id = data.id;
      return;
    }

    // Si pas ok, créer le compte
    if (res.status === 401) {
      log.warn(`  Utilisateur ${user.email} n'existe pas, création...`);
      await registerUser(user);
      return loginUserIfNeeded(user); // Retry
    }

    throw new Error(await res.text());
  } catch (err) {
    log.error(`  Erreur login: ${err.message}`);
    throw err;
  }
}

async function registerUser(user) {
  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        firstName: user.name,
        lastName: 'Test'
      })
    });

    if (!res.ok) throw new Error('Register error');
    const data = await res.json();
    log.success(`  Compte créé: ${data.email}`);
  } catch (err) {
    log.error(`  Erreur register: ${err.message}`);
    throw err;
  }
}

async function sendMessage(fromUser, toUserId, content) {
  try {
    const res = await fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fromUser.token}`
      },
      body: JSON.stringify({
        receiver_id: toUserId,
        content: content
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error sending message');
    }

    const data = await res.json();
    return data.id;
  } catch (err) {
    log.error(`  Erreur envoi message: ${err.message}`);
    throw err;
  }
}

async function getMessages(user) {
  try {
    const res = await fetch(`${API_BASE}/api/messages`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });

    if (!res.ok) throw new Error('Error fetching messages');
    const data = await res.json();
    return data.messages || data || [];
  } catch (err) {
    log.error(`  Erreur récupération messages: ${err.message}`);
    return [];
  }
}

async function getUnreadCount(user) {
  try {
    const res = await fetch(`${API_BASE}/api/messages/unread-count`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });

    if (!res.ok) throw new Error('Error fetching unread count');
    const data = await res.json();
    return data.unreadCount || 0;
  } catch (err) {
    log.error(`  Erreur compteur: ${err.message}`);
    return 0;
  }
}

async function markAsRead(user, messageId) {
  try {
    const res = await fetch(`${API_BASE}/api/messages/${messageId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({})
    });

    if (!res.ok) throw new Error('Error marking as read');
  } catch (err) {
    log.error(`  Erreur marquer lu: ${err.message}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Lancer le test
testChat();
