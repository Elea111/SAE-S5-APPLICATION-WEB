import fetch from 'cross-fetch';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:4000';
const JWT_SECRET = '0peh6ZGzkZAP/90eQK82DrrReQHf+ZD5ZQvMk2yMKkEOU93efdK2OxjJMgmn3ga7coVuIQd3NFidW56yyszgMA=='; // Depuis .env

// Utilisateur de test (créé via seed-data.js)
const TEST_USER_ID = 'bed26c6b-3b22-4adf-874b-7f4ec5ba6458';

const TEST_TOKEN = jwt.sign(
  { 
    id: TEST_USER_ID,
    email: 'test@example.com'
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('\n╔════════════════════════════════════════════╗');
console.log('║  🧪 TEST PUBLICATION AVEC CATÉGORIE       ║');
console.log('╚════════════════════════════════════════════╝\n');

/**
 * STEP 1: Récupérer les catégories
 */
async function testGetCategories() {
  console.log('📌 ÉTAPE 1: Récupérer les catégories');
  console.log('=========================================\n');

  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    const data = await res.json();

    console.log(`✅ Status: ${res.status}`);
    console.log('📦 Catégories disponibles:');
    data.forEach(cat => {
      console.log(`   • ${cat.icon} ${cat.name} (slug: "${cat.slug}", id: "${cat.id}")`);
    });
    console.log();
    
    return data; // Retourner pour utiliser dans next test
  } catch (err) {
    console.error(`\n❌ Erreur réseau: ${err.message}\n`);
    return [];
  }
}

/**
 * STEP 2: Publier un équipement AVEC la catégorie
 */
async function testPublishEquipmentWithCategory(categories) {
  console.log('📌 ÉTAPE 2: Publier un équipement');
  console.log('=========================================\n');

  if (categories.length === 0) {
    console.log('❌ Pas de catégories disponibles!\n');
    return null;
  }

  // Utiliser la première catégorie
  const selectedCategory = categories[0];
  
  const payload = {
    title: '🔧 Perceuse Makita 18V TEST',
    description: 'Perceuse professionnelle avec batterie et chargeur. Excellente condition. Test de publication avec catégorie.',
    daily_price: 25.99,
    caution_deposit: 50,
    location: 'Paris, France',
    condition: 'excellent',
    category_id: selectedCategory.id  // ✅ UTILISER L'UUID RÉEL DE LA CATÉGORIE
  };

  console.log('📤 Payload envoyé:');
  console.log(JSON.stringify(payload, null, 2));
  console.log();

  try {
    const res = await fetch(`${API_BASE}/api/equipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    console.log(`✅ Status: ${res.status}`);
    console.log('📦 Réponse serveur:');
    console.log(JSON.stringify(data, null, 2));
    console.log();

    if (res.ok && data.id) {
      console.log(`✅ Équipement publié avec succès! ID: ${data.id}\n`);
      return data.id;
    } else {
      console.error(`❌ Erreur publication: ${data.message}\n`);
      return null;
    }
  } catch (err) {
    console.error(`❌ Erreur réseau: ${err.message}\n`);
    return null;
  }
}

/**
 * STEP 3: Récupérer les détails de l'équipement (vérifier la catégorie)
 */
async function testGetEquipmentDetail(equipmentId) {
  console.log('📌 ÉTAPE 3: Récupérer les détails de l\'équipement');
  console.log('=========================================\n');

  if (!equipmentId) {
    console.log('❌ Pas d\'équipement à récupérer\n');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/equipments/${equipmentId}`);
    const data = await res.json();

    console.log(`✅ Status: ${res.status}`);
    console.log('📦 Détails complets:');
    console.log(JSON.stringify(data, null, 2));
    console.log();

    // VÉRIFICATIONS CRITIQUES
    console.log('🔍 VÉRIFICATIONS:');
    console.log(`   ✅ ID: ${data.id ? '✓' : '✗'}`);
    console.log(`   ✅ Title: ${data.title ? '✓' : '✗'}`);
    console.log(`   ✅ Category ID: ${data.category_id ? '✓' : '✗'} (${data.category_id})`);
    console.log(`   ✅ Category Name: ${data.category_name ? '✓' : '✗'} (${data.category_name})`);
    console.log(`   ✅ Category Icon: ${data.category_icon ? '✓' : '✗'} (${data.category_icon})`);
    console.log();

    // VERDICT
    if (data.category_name && data.category_name !== 'Sans catégorie') {
      console.log('✅✅✅ SUCCÈS! La catégorie s\'affiche correctement!\n');
    } else {
      console.log('❌❌❌ ÉCHEC! La catégorie n\'s\'affiche pas!\n');
    }
  } catch (err) {
    console.error(`❌ Erreur réseau: ${err.message}\n`);
  }
}

/**
 * STEP 4: Vérifier dans la liste (GET /api/equipments)
 */
async function testListEquipments() {
  console.log('📌 ÉTAPE 4: Vérifier dans la liste des équipements');
  console.log('=========================================\n');

  try {
    const res = await fetch(`${API_BASE}/api/equipments`);
    const data = await res.json();

    console.log(`✅ Status: ${res.status}`);
    console.log(`📊 Total d'équipements: ${data.length}`);
    
    // Chercher le dernier équipement publié (normalement celui de notre test)
    const lastEquipment = data[0];
    if (lastEquipment && lastEquipment.title.includes('TEST')) {
      console.log('\n🎯 Trouvé l\'équipement de test:');
      console.log(JSON.stringify(lastEquipment, null, 2));
      
      console.log('\n🔍 VÉRIFICATION DANS LA LISTE:');
      console.log(`   ✅ Category Name: ${lastEquipment.category_name ? '✓' : '✗'} (${lastEquipment.category_name})`);
      console.log(`   ✅ Category Icon: ${lastEquipment.category_icon ? '✓' : '✗'} (${lastEquipment.category_icon})`);
    }
    console.log();
  } catch (err) {
    console.error(`❌ Erreur réseau: ${err.message}\n`);
  }
}

/**
 * Exécuter tous les tests dans l'ordre
 */
async function runAllTests() {
  try {
    // 1. Récupérer les catégories
    const categories = await testGetCategories();
    
    // 2. Publier un équipement avec la catégorie
    const equipmentId = await testPublishEquipmentWithCategory(categories);
    
    // 3. Récupérer les détails
    await testGetEquipmentDetail(equipmentId);
    
    // 4. Vérifier dans la liste
    await testListEquipments();

    console.log('╔════════════════════════════════════════════╗');
    console.log('║           ✅ TESTS TERMINÉS               ║');
    console.log('╚════════════════════════════════════════════╝\n');
  } catch (err) {
    console.error('❌ Erreur générale:', err);
  }
}

// Lancer les tests
runAllTests();
