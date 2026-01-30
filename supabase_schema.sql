-- ==============================================================================
-- SCHEMA SUPABASE - MANU3D (V2.2 - Mise à jour Filtres Livraison)
-- ==============================================================================

-- ... (LES TABLES PRECEDENTES RESTENT INCHANGEES) ...

-- 12. AJOUTER LES LIMITES DE POIDS A LA TABLE SHIPPING
-- Copiez ces lignes dans l'éditeur SQL de Supabase si la table existe déjà

alter table shipping_methods 
add column if not exists min_weight int default 0,
add column if not exists max_weight int default 999999;

-- Exemple de mise à jour pour des données réalistes :
-- Lettre Suivie : Max 250g
-- Colissimo : Max 30kg
-- update shipping_methods set max_weight = 250 where name like '%Lettre%';
-- update shipping_methods set max_weight = 30000 where name like '%Colissimo%';

-- ==============================================================================