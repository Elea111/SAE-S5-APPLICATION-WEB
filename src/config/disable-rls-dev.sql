-- ============================================
-- ⚠️ DÉSACTIVER RLS EN DÉVELOPPEMENT
-- ============================================
-- IMPORTANT: À réactiver EN PRODUCTION !
-- Exécuter ce script dans Supabase SQL Editor

-- Désactiver RLS sur la table items pour le développement
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- ✅ AUSSI désactiver RLS sur item_photos
ALTER TABLE item_photos DISABLE ROW LEVEL SECURITY;

-- Vérifier que RLS est désactivé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('items', 'item_photos') AND schemaname = 'public';

-- Résultat attendu : rowsecurity = false
