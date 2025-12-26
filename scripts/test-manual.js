import fetch from 'cross-fetch';

const API_BASE = 'http://localhost:4000';
let token;
let userId;

async function apiCall(method, endpoint, data = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  return { status: res.status, data: await res.json() };
}

async function test() {
  console.log('🧪 Démarrage des tests...\n');

  // Register
  console.log('1️⃣  Inscription...');
  let res = await apiCall('POST', '/api/register', {
    firstName: 'John',
    lastName: 'Doe',
    email: `test-${Date.now()}@example.com`,
    password: 'SecurePass123'
  });
  console.log('✅ Status:', res.status);
  console.log('📦 Response:', JSON.stringify(res.data, null, 2));
  token = res.data.token;
  userId = res.data.id;

  // Get User
  console.log('\n2️⃣  Récupération du profil...');
  res = await apiCall('GET', `/api/users/${userId}`);
  console.log('✅ Status:', res.status);
  console.log('📦 Response:', JSON.stringify(res.data, null, 2));

  // Publish Equipment
  console.log('\n3️⃣  Publication d\'un équipement...');
  res = await apiCall('POST', '/api/equipments', {
    title: 'Perceuse électrique 18V',
    description: 'Perceuse professionnelle avec batterie et chargeur inclus. État neuf.',
    daily_price: 25.99,
    location: 'Paris'
  });
  console.log('✅ Status:', res.status);
  console.log('📦 Response:', JSON.stringify(res.data, null, 2));

  // Test Validation Error
  console.log('\n4️⃣  Test validation (email invalide)...');
  res = await apiCall('POST', '/api/register', {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'invalid-email',
    password: 'pass'
  });
  console.log('✅ Status:', res.status);
  console.log('📦 Errors:', JSON.stringify(res.data.errors, null, 2));

  console.log('\n✅ Tests terminés!');
}

test().catch(err => console.error('❌ Erreur:', err));
