-- ============================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- IMPORTANT: Exécuter ce script dans Supabase SQL Editor
-- Les noms de colonnes correspondent à 001_create_all_tables.sql

-- ============================================
-- ⚠️ SUPPRIMER TOUTES LES ANCIENNES POLICIES D'ABORD
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view public items" ON items;
DROP POLICY IF EXISTS "Users can create items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Users can delete own items" ON items;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can create payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can create messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Anyone can view item photos" ON item_photos;
DROP POLICY IF EXISTS "Users can create item photos" ON item_photos;
DROP POLICY IF EXISTS "Users can update own item photos" ON item_photos;
DROP POLICY IF EXISTS "Users can delete own item photos" ON item_photos;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view item categories" ON item_categories;
DROP POLICY IF EXISTS "Users can create item categories" ON item_categories;
DROP POLICY IF EXISTS "Only moderators can view moderation" ON admin_moderation;

-- ============================================
-- 1️⃣ TABLE: users
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = id::text OR id IS NULL);

-- Policy 2: Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- ============================================
-- 2️⃣ TABLE: items (Équipements)
-- ============================================
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Policy 1: Tous les utilisateurs peuvent lire les équipements publics
CREATE POLICY "Anyone can view public items"
ON items FOR SELECT
USING (true);

-- Policy 2: Les propriétaires peuvent créer des équipements
-- ✅ MODIFIER : Accepter aussi le service_role (backend)
CREATE POLICY "Users can create items"
ON items FOR INSERT
WITH CHECK (
  auth.uid()::text = user_id::text 
  OR current_user = 'service_role'
);

-- Policy 3: Les propriétaires peuvent modifier leurs équipements
-- ✅ MODIFIER : Accepter aussi le service_role (backend)
CREATE POLICY "Users can update own items"
ON items FOR UPDATE
USING (
  auth.uid()::text = user_id::text 
  OR current_user = 'service_role'
)
WITH CHECK (
  auth.uid()::text = user_id::text 
  OR current_user = 'service_role'
);

-- Policy 4: Les propriétaires peuvent supprimer leurs équipements
CREATE POLICY "Users can delete own items"
ON items FOR DELETE
USING (auth.uid()::text = user_id::text);

-- ============================================
-- 3️⃣ TABLE: bookings (Réservations)
-- ============================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Les utilisateurs concernés peuvent voir les réservations
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (
  auth.uid()::text = borrower_id::text 
  OR auth.uid()::text = (
    SELECT user_id FROM items WHERE id = bookings.item_id
  )::text
);

-- Policy 2: Les emprunteurs peuvent créer des réservations
CREATE POLICY "Users can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid()::text = borrower_id::text);

-- Policy 3: Les emprunteurs et propriétaires peuvent modifier les réservations
CREATE POLICY "Users can update own bookings"
ON bookings FOR UPDATE
USING (
  auth.uid()::text = borrower_id::text 
  OR auth.uid()::text = (
    SELECT user_id FROM items WHERE id = bookings.item_id
  )::text
)
WITH CHECK (
  auth.uid()::text = borrower_id::text 
  OR auth.uid()::text = (
    SELECT user_id FROM items WHERE id = bookings.item_id
  )::text
);

-- Policy 4: Les emprunteurs peuvent supprimer leurs réservations
CREATE POLICY "Users can delete own bookings"
ON bookings FOR DELETE
USING (auth.uid()::text = borrower_id::text);

-- ============================================
-- 4️⃣ TABLE: payments (Paiements)
-- ============================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Les utilisateurs peuvent voir leurs propres paiements
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (
  auth.uid()::text = user_id::text 
  OR auth.uid()::text = (
    SELECT borrower_id FROM bookings WHERE id = payments.booking_id
  )::text
);

-- Policy 2: Les utilisateurs peuvent créer des paiements
CREATE POLICY "Users can create payments"
ON payments FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- Policy 3: Les utilisateurs peuvent modifier leurs paiements
CREATE POLICY "Users can update own payments"
ON payments FOR UPDATE
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- ============================================
-- 5️⃣ TABLE: reviews (Avis)
-- ============================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy 1: Tous les utilisateurs peuvent lire les avis
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT
USING (true);

-- Policy 2: Les utilisateurs peuvent créer des avis
CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid()::text = author_id::text);

-- Policy 3: Les créateurs d'avis peuvent les modifier
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
USING (auth.uid()::text = author_id::text)
WITH CHECK (auth.uid()::text = author_id::text);

-- Policy 4: Les créateurs d'avis peuvent les supprimer
CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
USING (auth.uid()::text = author_id::text);

-- ============================================
-- 6️⃣ TABLE: messages (Messages)
-- ============================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy 1: Les utilisateurs peuvent voir leurs propres messages
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
USING (
  auth.uid()::text = sender_id::text 
  OR auth.uid()::text = receiver_id::text
);

-- Policy 2: Les utilisateurs peuvent créer des messages
CREATE POLICY "Users can create messages"
ON messages FOR INSERT
WITH CHECK (auth.uid()::text = sender_id::text);

-- Policy 3: Le destinataire peut marquer le message comme lu
CREATE POLICY "Users can update own messages"
ON messages FOR UPDATE
USING (auth.uid()::text = receiver_id::text)
WITH CHECK (auth.uid()::text = receiver_id::text);

-- ============================================
-- 7️⃣ TABLE: item_photos (Photos équipements)
-- ============================================
ALTER TABLE item_photos ENABLE ROW LEVEL SECURITY;

-- Policy 1: Tout le monde peut voir les photos publiques
CREATE POLICY "Anyone can view item photos"
ON item_photos FOR SELECT
USING (true);

-- Policy 2: Le propriétaire peut ajouter des photos
CREATE POLICY "Users can create item photos"
ON item_photos FOR INSERT
WITH CHECK (
  auth.uid()::text = (
    SELECT user_id FROM items WHERE id = item_photos.item_id
  )::text
);

-- Policy 3: Le propriétaire peut modifier ses photos
CREATE POLICY "Users can update own item photos"
ON item_photos FOR UPDATE
USING (
  auth.uid()::text = (
    SELECT user_id FROM items WHERE id = item_photos.item_id
  )::text
)
WITH CHECK (
  auth.uid()::text = (
    SELECT user_id FROM items WHERE id = item_photos.item_id
  )::text
);

-- Policy 4: Le propriétaire peut supprimer ses photos
CREATE POLICY "Users can delete own item photos"
ON item_photos FOR DELETE
USING (
  auth.uid()::text = (
    SELECT user_id FROM items WHERE id = item_photos.item_id
  )::text
);

-- ============================================
-- 8️⃣ TABLE: categories (Catégories)
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy 1: Tout le monde peut lire les catégories
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (true);

-- ============================================
-- 9️⃣ TABLE: item_categories
-- ============================================
ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;

-- Policy 1: Tout le monde peut lire les associations item-catégorie
CREATE POLICY "Anyone can view item categories"
ON item_categories FOR SELECT
USING (true);

-- Policy 2: Le propriétaire de l'item peut créer des associations
CREATE POLICY "Users can create item categories"
ON item_categories FOR INSERT
WITH CHECK (
  auth.uid()::text = (
    SELECT user_id FROM items WHERE id = item_categories.item_id
  )::text
);

-- ============================================
-- 🔟 TABLE: admin_moderation
-- ============================================
ALTER TABLE admin_moderation ENABLE ROW LEVEL SECURITY;

-- Policy 1: Seuls les admins (moderator) peuvent voir la modération
CREATE POLICY "Only moderators can view moderation"
ON admin_moderation FOR SELECT
USING (
  auth.uid()::text = moderator_id::text
);

-- ============================================
-- ✅ VÉRIFICATION
-- ============================================
-- Voir toutes les policies créées:
-- SELECT policyname, tablename FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
