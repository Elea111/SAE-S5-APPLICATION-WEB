import fetch from 'cross-fetch';

const API_BASE = 'http://localhost:4000';

// ✅ DONNÉES DE TEST
const TEST_USER_ID = 'edb42c72-c6e1-4de0-bb7a-3363290a07b6';
const TEST_TOKEN = 'test-jwt-token'; // À remplacer par un vrai token

const TEST_EQUIPMENT = {
  title: '🧪 Perceuse électrique 18V - TEST',
  description: 'Ceci est une perceuse de test pour vérifier la publication d\'équipements.',
  daily_price: 25.99,
  caution_deposit: 100,
  location: 'Paris, 75001',
  condition: 'bon',
  category_id: 'electroportatif'
};

// ✅ TEST 1 : Publier un équipement sans images
async function testPublishEquipment() {
  console.log('\n🧪 TEST 1 : Publier un équipement');
  console.log('=====================================\n');

  try {
    const res = await fetch(`${API_BASE}/api/equipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify(TEST_EQUIPMENT)
    });

    const data = await res.json();

    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (res.ok && data.id) {
      console.log(`✅ Équipement créé avec l'ID: ${data.id}\n`);
      return data.id;
    } else {
      console.error(`❌ Erreur création équipement: ${data.message || data.error}\n`);
      return null;
    }
  } catch (err) {
    console.error(`❌ Erreur réseau: ${err.message}\n`);
    return null;
  }
}

// ✅ TEST 2 : Récupérer l'équipement créé
async function testGetEquipment(equipmentId) {
  console.log('\n🧪 TEST 2 : Récupérer l\'équipement');
  console.log('=====================================\n');

  if (!equipmentId) {
    console.log('⚠️ Pas d\'équipement à récupérer (TEST 1 a échoué)\n');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/equipments/${equipmentId}`);
    const data = await res.json();

    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (res.ok) {
      console.log(`✅ Équipement récupéré avec succès\n`);
    } else {
      console.error(`❌ Erreur récupération: ${data.message}\n`);
    }
  } catch (err) {
    console.error(`❌ Erreur réseau: ${err.message}\n`);
  }
}

// ✅ TEST 3 : Uploader une image pour l'équipement
async function testUploadImage(equipmentId) {
  console.log('\n🧪 TEST 3 : Uploader une image');
  console.log('=====================================\n');

  if (!equipmentId) {
    console.log('⚠️ Pas d\'équipement cible (TEST 1 a échoué)\n');
    return;
  }

  try {
    // Créer une image test (simple PNG 1x1)
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

    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (res.ok) {
      console.log(`✅ Image uploadée avec succès\n`);
    } else {
      console.error(`❌ Erreur upload: ${data.error || data.message}\n`);
    }
  } catch (err) {
    console.error(`❌ Erreur réseau: ${err.message}\n`);
  }
}

// ✅ TEST 4 : Récupérer les images de l'équipement
async function testGetEquipmentImages(equipmentId) {
  console.log('\n🧪 TEST 4 : Récupérer les images');
  console.log('=====================================\n');

  if (!equipmentId) {
    console.log('⚠️ Pas d\'équipement cible (TEST 1 a échoué)\n');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/equipments/${equipmentId}/images`);
    const data = await res.json();

    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (res.ok) {
      console.log(`✅ ${data.data?.length || 0} image(s) trouvée(s)\n`);
    } else {
      console.error(`❌ Erreur récupération: ${data.error}\n`);
    }
  } catch (err) {
    console.error(`❌ Erreur réseau: ${err.message}\n`);
  }
}

// ✅ TEST 5 : Lister tous les équipements
async function testListEquipments() {
  console.log('\n🧪 TEST 5 : Lister tous les équipements');
  console.log('=====================================\n');

  try {
    const res = await fetch(`${API_BASE}/api/equipments`);
    const data = await res.json();

    console.log(`Status: ${res.status}`);
    console.log(`Nombre d'équipements: ${Array.isArray(data) ? data.length : 0}`);
    console.log(`Premier équipement:`, JSON.stringify(data[0], null, 2));

    if (res.ok) {
      console.log(`✅ Équipements listés avec succès\n`);
    } else {
      console.error(`❌ Erreur listage\n`);
    }
  } catch (err) {
    console.error(`❌ Erreur réseau: ${err.message}\n`);
  }
}

// ✅ EXÉCUTER TOUS LES TESTS
async function runAllTests() {
  console.log('\n\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🧪 TESTS DE PUBLICATION ÉQUIPEMENT   ║');
  console.log('╚════════════════════════════════════════╝');

  const equipmentId = await testPublishEquipment();
  await testGetEquipment(equipmentId);
  await testUploadImage(equipmentId);
  await testGetEquipmentImages(equipmentId);
  await testListEquipments();

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║           ✅ TESTS TERMINÉS            ║');
  console.log('╚════════════════════════════════════════╝\n');
}

// Exécuter
runAllTests().catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
