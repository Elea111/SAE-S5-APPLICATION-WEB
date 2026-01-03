import fetch from 'cross-fetch';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:4000';

// ✅ DONNÉES DE TEST
const TEST_USER_ID = 'c0e26a75-a149-4d7c-ae77-269d440dbc78';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // ⚠️ À matcher avec .env

// ✅ GÉNÉRER UN JWT VALIDE
const TEST_TOKEN = jwt.sign(
  { 
    id: TEST_USER_ID,
    email: 'test@example.com'
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('🔑 JWT généré:', TEST_TOKEN);

// UUIDs des catégories (À OBTENIR après avoir exécuté seed-categories.sql)
const CATEGORY_IDS = {
  'electroportatif': 'f0bfeb59-d633-4efb-ac9f-f175a583464d', // ✅ UUID réel du test précédent
};

/**
 * TEST 1 : Publier un équipement complet
 */
async function testPublishEquipment() {
  console.log('\n🧪 TEST 1 : Publier un équipement');
  console.log('=====================================\n');

  const payload = {
    title: '🔧 Perceuse Bosch 18V PRO - Test Complet',
    description: 'Excellente perceuse professionnelle avec batterie et chargeur. Parfait état, très peu utilisée.',
    daily_price: 35.50,
    caution_deposit: 150,
    location: 'Paris, 75011',
    condition: 'excellent',
    category_id: CATEGORY_IDS['electroportatif'] // ✅ UUID réel
  };

  try {
    const res = await fetch(`${API_BASE}/api/equipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}` // ✅ JWT VALIDE
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    console.log(`✅ Status: ${res.status}`);
    console.log('📦 Response:', JSON.stringify(data, null, 2));

    if (res.ok && data.id) {
      console.log(`\n✅ Équipement créé avec l'ID: ${data.id}\n`);
      return data.id;
    } else {
      console.error(`\n❌ Erreur: ${data.message || data.error}\n`);
      return null;
    }
  } catch (err) {
    console.error(`\n❌ Erreur réseau: ${err.message}\n`);
    return null;
  }
}

/**
 * TEST 2 : Récupérer l'équipement détaillé (avec propriétaire et catégorie)
 */
async function testGetEquipmentDetail(equipmentId) {
  console.log('\n🧪 TEST 2 : Récupérer détails équipement');
  console.log('=====================================\n');

  if (!equipmentId) {
    console.log('⚠️ Pas d\'équipement à récupérer\n');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/equipments/${equipmentId}`);
    const data = await res.json();

    console.log(`✅ Status: ${res.status}`);
    console.log('📦 Response:', JSON.stringify(data, null, 2));

    // ✅ VÉRIFICATIONS IMPORTANTES
    console.log('\n🔍 VÉRIFICATIONS:');
    console.log(`   ✅ ID: ${data.id ? '✓' : '✗'}`);
    console.log(`   ✅ Title: ${data.title ? '✓' : '✗'}`);
    console.log(`   ✅ Owner Name: ${data.owner_name && data.owner_name !== 'Propriétaire inconnu' ? '✓' : '✗'} (${data.owner_name})`);
    console.log(`   ✅ Owner Avatar: ${data.owner_avatar ? '✓' : '✗'} (${data.owner_avatar})`);
    console.log(`   ✅ Category Name: ${data.category_name && data.category_name !== 'Sans catégorie' ? '✓' : '✗'} (${data.category_name})`);
    console.log(`   ✅ Category Icon: ${data.category_icon ? '✓' : '✗'} (${data.category_icon})`);
    console.log(`   ✅ Daily Price: ${data.daily_price ? '✓' : '✗'} (${data.daily_price}€)`);

    if (res.ok) {
      console.log('\n✅ Équipement détaillé récupéré avec succès\n');
      return data;
    } else {
      console.error(`\n❌ Erreur: ${data.message}\n`);
      return null;
    }
  } catch (err) {
    console.error(`\n❌ Erreur réseau: ${err.message}\n`);
    return null;
  }
}

/**
 * TEST 3 : Upload une image
 */
async function testUploadImage(equipmentId) {
  console.log('\n🧪 TEST 3 : Upload image équipement');
  console.log('=====================================\n');

  if (!equipmentId) {
    console.log('⚠️ Pas d\'équipement cible\n');
    return;
  }

  try {
    // Créer une image test simple (PNG 1x1)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const formData = new FormData();
    formData.append('image', new Blob([pngBuffer], { type: 'image/png' }), 'test-image.png');
    formData.append('sortOrder', '0');
    formData.append('isMain', 'true');

    const res = await fetch(`${API_BASE}/api/equipments/${equipmentId}/images`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    console.log(`✅ Status: ${res.status}`);
    console.log('📦 Response:', JSON.stringify(data, null, 2));

    if (res.ok) {
      console.log(`\n✅ Image uploadée avec succès\n`);
      return true;
    } else {
      console.error(`\n❌ Erreur: ${data.error || data.message}\n`);
      return false;
    }
  } catch (err) {
    console.error(`\n❌ Erreur réseau: ${err.message}\n`);
    return false;
  }
}

/**
 * TEST 4 : Vérifier que l'image est bien attachée
 */
async function testGetEquipmentImages(equipmentId) {
  console.log('\n🧪 TEST 4 : Récupérer images équipement');
  console.log('=====================================\n');

  if (!equipmentId) {
    console.log('⚠️ Pas d\'équipement cible\n');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/equipments/${equipmentId}/images`);
    const data = await res.json();

    console.log(`✅ Status: ${res.status}`);
    console.log('📦 Response:', JSON.stringify(data, null, 2));

    if (res.ok) {
      console.log(`\n✅ ${data.data?.length || 0} image(s) trouvée(s)\n`);
      return data.data;
    } else {
      console.error(`\n❌ Erreur: ${data.error}\n`);
      return [];
    }
  } catch (err) {
    console.error(`\n❌ Erreur réseau: ${err.message}\n`);
    return [];
  }
}

/**
 * TEST 5 : Récupérer catégories pour obtenir les UUIDs réels
 */
async function testGetCategories() {
  console.log('\n🧪 TEST 5 : Récupérer catégories');
  console.log('=====================================\n');

  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    const data = await res.json();

    console.log(`✅ Status: ${res.status}`);
    console.log('📦 Catégories:');
    data.forEach(cat => {
      console.log(`   ${cat.icon} ${cat.name} (${cat.slug}): ${cat.id}`);
    });

    return data;
  } catch (err) {
    console.error(`\n❌ Erreur réseau: ${err.message}\n`);
    return [];
  }
}

/**
 * EXÉCUTER TOUS LES TESTS DANS L'ORDRE
 */
async function runAllTests() {
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   🧪 TEST FLUX COMPLET PUBLICATION       ║');
  console.log('╚═══════════════════════════════════════════╝');

  // 1. Récupérer les catégories
  const categories = await testGetCategories();
  
  // 2. Publier un équipement
  const equipmentId = await testPublishEquipment();

  // 3. Récupérer les détails (WITH JOINS)
  const equipment = await testGetEquipmentDetail(equipmentId);

  // 4. Upload une image
  const imageUploaded = await testUploadImage(equipmentId);

  // 5. Récupérer les images
  const images = await testGetEquipmentImages(equipmentId);

  // ✅ RÉSUMÉ FINAL
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║          ✅ TESTS TERMINÉS               ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  console.log('📊 RÉSUMÉ:');
  console.log(`   ✅ Équipement créé: ${equipmentId ? 'OUI' : 'NON'}`);
  console.log(`   ✅ Propriétaire visible: ${equipment?.owner_name && equipment.owner_name !== 'Propriétaire inconnu' ? 'OUI' : 'NON'}`);
  console.log(`   ✅ Catégorie visible: ${equipment?.category_name && equipment.category_name !== 'Sans catégorie' ? 'OUI' : 'NON'}`);
  console.log(`   ✅ Image uploadée: ${imageUploaded ? 'OUI' : 'NON'}`);
  console.log(`   ✅ Images récupérées: ${images?.length || 0} image(s)\n`);
}

// Exécuter
runAllTests().catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
