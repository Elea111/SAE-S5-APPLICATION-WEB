-- ============================================
-- 🔒 UPDATE RLS POLICIES - items TABLE
-- ============================================
-- IMPORTANT: Exécuter ce script dans Supabase SQL Editor
-- Pour mettre à jour les policies existantes

-- ============================================
-- 2️⃣ TABLE: items (Équipements) - UPDATE
-- ============================================

-- ✅ Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can create items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;

-- ✅ Créer les nouvelles policies avec service_role support
CREATE POLICY "Users can create items"
ON items FOR INSERT
WITH CHECK (
  auth.uid()::text = user_id::text 
  OR current_user = 'service_role'
);

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

-- ✅ Vérification
SELECT policyname, tablename FROM pg_policies 
WHERE tablename = 'items' AND policyname IN ('Users can create items', 'Users can update own items')
ORDER BY policyname;
