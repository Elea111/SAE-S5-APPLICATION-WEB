/**
 * Test manuel pour vérifier le endpoint POST /api/equipments
 * Lance avec : node tests/publish.test.js
 */

const API_BASE = 'http://localhost:4000';

// Données de test
const testEquipment = {
  title: 'Perceuse électrique 18V',
  description: 'Perceuse professionnelle en excellent état, avec 2 batteries',
  daily_price: 25.99,
  caution_deposit: 50,
  location: 'Paris (75001)',
  condition: 'bon',
  category: 'electroportatif'
};

let testToken = null;
let testUserId = null;

/**
 * 1️⃣ Créer un utilisateur de test
 */
async function testRegister() {
  console.log('\n🔐 TEST 1 : Inscription utilisateur');
  console.log('─'.repeat(50));

  try {
    const response = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Publisher',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        isPro: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ Erreur inscription:', data);
      return false;
    }

    console.log('✅ Inscription réussie');
    console.log('   ID:', data.id);
    console.log('   Email:', data.email);
    console.log('   Token:', data.token.substring(0, 20) + '...');

    testToken = data.token;
    testUserId = data.id;

    return true;
  } catch (err) {
    console.log('❌ Erreur réseau:', err.message);
    return false;
  }
}

/**
 * 2️⃣ Publier un équipement
 */
async function testPublish() {
  console.log('\n📦 TEST 2 : Publication d\'équipement');
  console.log('─'.repeat(50));

  if (!testToken) {
    console.log('❌ Token manquant. Inscrivez-vous d\'abord.');
    return false;
  }

  console.log('📤 Envoi des données:');
  console.log(JSON.stringify(testEquipment, null, 2));

  try {
    const response = await fetch(`${API_BASE}/api/equipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify(testEquipment)
    });

    const data = await response.json();

    console.log(`\n📨 Réponse serveur (${response.status}):`);
    console.log(JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.log('\n❌ Erreur publication:', data.message);
      
      // Afficher les logs du serveur
      if (data.error) {
        console.log('\n🔍 Détails erreur:');
        console.log(data.error);
      }
      
      return false;
    }

    console.log('\n✅ Équipement publié avec succès');
    console.log('   ID:', data.id);
    console.log('   Titre:', data.title);
    console.log('   Prix:', data.daily_price + '€/jour');

    return true;
  } catch (err) {
    console.log('\n❌ Erreur réseau:', err.message);
    console.log('\n💡 Conseils:');
    console.log('   1. Le serveur backend est-il lancé? (port 4000)');
    console.log('   2. Vérifiez le `.env` et les clés Supabase');
    console.log('   3. Vérifiez les logs du serveur backend');
    return false;
  }
}

/**
 * 3️⃣ Récupérer l'équipement publié
 */
async function testFetchEquipment(equipmentId) {
  console.log('\n🔍 TEST 3 : Récupération équipement');
  console.log('─'.repeat(50));

  try {
    const response = await fetch(`${API_BASE}/api/equipments/${equipmentId}`);
    const data = await response.json();

    if (!response.ok) {
      console.log('❌ Erreur fetch:', data);
      return false;
    }

    console.log('✅ Équipement récupéré:');
    console.log(JSON.stringify(data, null, 2));

    return true;
  } catch (err) {
    console.log('❌ Erreur réseau:', err.message);
    return false;
  }
}

/**
 * Lancer tous les tests
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(50));
  console.log('🧪 TESTS ENDPOINT /api/equipments');
  console.log('='.repeat(50));

  // Test 1: Inscription
  const registered = await testRegister();
  if (!registered) {
    console.log('\n⚠️ Tests arrêtés (inscription échouée)');
    return;
  }

  // Test 2: Publication
  const published = await testPublish();
  if (!published) {
    console.log('\n⚠️ Tests arrêtés (publication échouée)');
    return;
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ TOUS LES TESTS RÉUSSIS');
  console.log('='.repeat(50));
}

// Lancer les tests
runAllTests().catch(err => {
  console.error('💥 Erreur critique:', err);
  process.exit(1);
});
