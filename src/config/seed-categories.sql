-- ============================================
-- 🌱 SEED CATEGORIES TABLE
-- ============================================
-- Exécuter ce script dans Supabase SQL Editor

INSERT INTO categories (name, slug, description, icon) VALUES
('Électroportatif', 'electroportatif', 'Outils électriques et perceuses', '🔌'),
('Jardinage', 'jardinage', 'Outils de jardin et tondeuses', '🌱'),
('Construction', 'construction', 'Matériel de construction et bricolage', '🔨'),
('Nettoyage', 'nettoyage', 'Machines et produits de nettoyage', '🧹'),
('Soudure', 'soudure', 'Équipement de soudure et découpe', '⚡'),
('Mesure', 'mesure', 'Instruments de mesure et niveau', '📏'),
('Peinture', 'peinture', 'Matériel de peinture et revêtement', '🎨'),
('Autre', 'autre', 'Autres outils et équipements', '📦');

-- Vérifier les catégories créées
SELECT id, slug, name FROM categories ORDER BY name;
