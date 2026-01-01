/**
 * Script de seed data pour Supabase
 * Crée 10 utilisateurs de test avec 10 équipements
 * Lance avec : node scripts/seed-data.js
 */

import '../src/config/env.js';
import supabase from '../src/infra/database/supabaseClient.js';
import bcryptjs from 'bcryptjs';

const CATEGORIES = ['electroportatif', 'jardinage', 'construction', 'nettoyage', 'soudure'];

const usersData = [
  {
    email: 'jean.martin@test.com',
    password: 'jean1pass',
    first_name: 'Jean',
    last_name: 'Martin',
    phone: '06 12 34 56 78',
    address: 'Paris, 75001',
    is_pro: false,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jean'
  },
  {
    email: 'marie.dupont@test.com',
    password: 'marie1pass',
    first_name: 'Marie',
    last_name: 'Dupont',
    phone: '06 98 76 54 32',
    address: 'Lyon, 69000',
    is_pro: true,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie'
  },
  {
    email: 'pierre.bernard@test.com',
    password: 'pierre1pass',
    first_name: 'Pierre',
    last_name: 'Bernard',
    phone: '07 11 22 33 44',
    address: 'Marseille, 13000',
    is_pro: false,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pierre'
  },
  {
    email: 'sophie.robert@test.com',
    password: 'sophie1pass',
    first_name: 'Sophie',
    last_name: 'Robert',
    phone: '07 55 66 77 88',
    address: 'Toulouse, 31000',
    is_pro: true,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie'
  },
  {
    email: 'luc.thomas@test.com',
    password: 'luc1pass',
    first_name: 'Luc',
    last_name: 'Thomas',
    phone: '06 44 55 66 77',
    address: 'Bordeaux, 33000',
    is_pro: false,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luc'
  },
  {
    email: 'anne.richard@test.com',
    password: 'anne1pass',
    first_name: 'Anne',
    last_name: 'Richard',
    phone: '07 22 33 44 55',
    address: 'Nice, 06000',
    is_pro: true,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anne'
  },
  {
    email: 'marc.petit@test.com',
    password: 'marc1pass',
    first_name: 'Marc',
    last_name: 'Petit',
    phone: '06 77 88 99 00',
    address: 'Nantes, 44000',
    is_pro: false,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marc'
  },
  {
    email: 'isabelle.moreau@test.com',
    password: 'isabelle1pass',
    first_name: 'Isabelle',
    last_name: 'Moreau',
    phone: '07 99 88 77 66',
    address: 'Strasbourg, 67000',
    is_pro: true,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=isabelle'
  },
  {
    email: 'claude.durand@test.com',
    password: 'claude1pass',
    first_name: 'Claude',
    last_name: 'Durand',
    phone: '06 33 44 55 66',
    address: 'Montpellier, 34000',
    is_pro: false,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=claude'
  },
  {
    email: 'valerie.lefevre@test.com',
    password: 'valerie1pass',
    first_name: 'Valérie',
    last_name: 'Lefèvre',
    phone: '07 66 77 88 99',
    address: 'Lille, 59000',
    is_pro: true,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=valerie'
  }
];

const equipmentsData = [
  {
    title: 'Perceuse électrique 18V Makita',
    description: 'Perceuse professionnelle avec batterie et chargeur. État excellent, très peu utilisée. Parfait pour les travaux de bricolage.',
    daily_price: 25.99,
    caution_deposit: 80,
    location: 'Paris, 75001',
    condition: 'excellent',
    category: 'electroportatif'
  },
  {
    title: 'Tondeuse à gazon essence MTD',
    description: 'Tondeuse puissante avec moteur essence 4 temps. Idéale pour les petits et moyens jardins. Bien entretenue.',
    daily_price: 35.50,
    caution_deposit: 150,
    location: 'Lyon, 69000',
    condition: 'bon',
    category: 'jardinage'
  },
  {
    title: 'Scie circulaire DeWalt 230V',
    description: 'Scie circulaire professionnelle 2400W. Parfait pour découper bois, PVC, etc. Comme neuve.',
    daily_price: 45.00,
    caution_deposit: 200,
    location: 'Marseille, 13000',
    condition: 'neuf',
    category: 'electroportatif'
  },
  {
    title: 'Nettoyeur haute pression Kärcher',
    description: 'Nettoyeur haute pression 2500W. Accessoires compris. Parfait pour terrasse, voiture, façade.',
    daily_price: 30.00,
    caution_deposit: 120,
    location: 'Toulouse, 31000',
    condition: 'excellent',
    category: 'nettoyage'
  },
  {
    title: 'Compresseur d\'air Michelin 50L',
    description: 'Compresseur air comprimé 2.5 kW. Réservoir 50L. Idéal pour pneumatique et outils.',
    daily_price: 28.99,
    caution_deposit: 110,
    location: 'Bordeaux, 33000',
    condition: 'bon',
    category: 'electroportatif'
  },
  {
    title: 'Bétonnière électrique 230V',
    description: 'Bétonnière robuste 160L. Moteur électrique 230V. État comme neuve, peu utilisée.',
    daily_price: 55.00,
    caution_deposit: 250,
    location: 'Nice, 06000',
    condition: 'neuf',
    category: 'construction'
  },
  {
    title: 'Débroussailleuse thermique Stihl',
    description: 'Débroussailleuse puissante avec moteur 2 temps. Lames et fil inclus. Très performante.',
    daily_price: 32.50,
    caution_deposit: 130,
    location: 'Nantes, 44000',
    condition: 'excellent',
    category: 'jardinage'
  },
  {
    title: 'Poste à souder inverseur 200A',
    description: 'Poste à souder MMA/TIG 200A. Excellent pour soudage acier et inox. Complet et fonctionnel.',
    daily_price: 65.00,
    caution_deposit: 300,
    location: 'Strasbourg, 67000',
    condition: 'bon',
    category: 'soudure'
  },
  {
    title: 'Ponceuse orbitale Bosch 230V',
    description: 'Ponceuse orbitale professionnelle 450W. Système poussière. État neuf.',
    daily_price: 22.99,
    caution_deposit: 90,
    location: 'Montpellier, 34000',
    condition: 'neuf',
    category: 'electroportatif'
  },
  {
    title: 'Tarière électrique Powercraft',
    description: 'Tarière électrique 850W pour forage sol. Avec mèches. Parfait pour plantation arbres.',
    daily_price: 38.00,
    caution_deposit: 140,
    location: 'Lille, 59000',
    condition: 'excellent',
    category: 'jardinage'
  }
];

async function seedData() {
  console.log('\n' + '='.repeat(60));
  console.log('🌱 SEED DATA - Insertion de 10 utilisateurs et 10 équipements');
  console.log('='.repeat(60));

  try {
    // 1️⃣ Insérer les utilisateurs
    console.log('\n👥 Création des 10 utilisateurs...');
    
    const userIds = [];
    
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      
      // Hash le mot de passe
      const hashedPassword = await bcryptjs.hash(userData.password, 10);
      
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          password_hash: hashedPassword,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          address: userData.address,
          is_pro: userData.is_pro,
          avatar_url: userData.avatar_url,
          email_verified: true,
          rating: Math.random() * 4 + 1,
          review_count: Math.floor(Math.random() * 10) + 1,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.log(`❌ Erreur création utilisateur ${userData.first_name}:`, error.message);
      } else {
        const userId = data[0].id;
        userIds.push(userId);
        console.log(`✅ ${userData.first_name} ${userData.last_name} (${userData.email}) créé`);
      }
    }

    // 2️⃣ Insérer les équipements
    console.log('\n📦 Création des 10 équipements...');
    
    for (let i = 0; i < equipmentsData.length; i++) {
      const equipmentData = equipmentsData[i];
      const userId = userIds[i];

      if (!userId) {
        console.log(`❌ Pas d'utilisateur pour l'équipement ${equipmentData.title}`);
        continue;
      }

      const { data, error } = await supabase
        .from('items')
        .insert([{
          user_id: userId,
          title: equipmentData.title,
          description: equipmentData.description,
          daily_price: equipmentData.daily_price,
          caution_deposit: equipmentData.caution_deposit,
          location: equipmentData.location,
          condition: equipmentData.condition,
          category_id: equipmentData.category,  // ← Utiliser category_id
          is_available: true,
          is_approved: true,
          view_count: Math.floor(Math.random() * 50),
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.log(`❌ Erreur création équipement "${equipmentData.title}":`, error.message);
      } else {
        console.log(`✅ "${equipmentData.title}" publié par ${usersData[i].first_name}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ SEED DATA TERMINÉ AVEC SUCCÈS');
    console.log('='.repeat(60));
    console.log('\n📝 Utilisateurs de test créés:\n');
    
    usersData.forEach((user, idx) => {
      console.log(`${idx + 1}. Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Nom: ${user.first_name} ${user.last_name}`);
      console.log(`   Statut: ${user.is_pro ? 'Professionnel' : 'Particulier'}\n`);
    });

    console.log('🔍 Tu peux maintenant:\n');
    console.log('1. Aller à http://localhost:3000/connexion');
    console.log('2. Te connecter avec un compte de test (ex: jean.martin@test.com / jean1pass)');
    console.log('3. Chercher les équipements sur http://localhost:3000/search');
    console.log('4. Cliquer sur un équipement pour voir les détails');
    console.log('5. Voir le profil du propriétaire');
    console.log('6. Réserver l\'équipement');
    console.log('7. Envoyer un message au propriétaire\n');

  } catch (err) {
    console.error('💥 Erreur critique:', err);
    process.exit(1);
  }
}

seedData();
