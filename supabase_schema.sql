-- ==============================================================================
-- SCHEMA SUPABASE - MANU3D (V3.2 - Ultimate CMS Edition)
-- Script Robuste (Idempotent)
-- ==============================================================================

-- [Tables précédentes inchangées pour concision, on se concentre sur les POLITIQUES]
-- Si tu n'as pas encore créé les tables, copie tout le bloc précédent. 
-- Ici, j'ajoute UNIQUEMENT les permissions d'écriture pour l'Admin Tool.

-- ------------------------------------------------------------------------------
-- 7. PERMISSIONS D'ÉCRITURE POUR LE CMS (ADMIN TOOL)
-- ------------------------------------------------------------------------------
-- ATTENTION : Comme l'Admin Tool est client-side avec un mot de passe simple,
-- nous devons autoriser l'écriture publique sur ces tables spécifiques.
-- La sécurité repose sur le fait que l'URL Supabase et la clé ANON ne sont pas "devinables" facilement
-- ET que le front-end bloque l'accès si le mot de passe est faux.
-- Pour une sécurité militaire, il faudrait utiliser Supabase Auth (Login Email/Pass).

-- Autoriser la modification de la config du site
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_config' AND policyname = 'Public update config') THEN
    CREATE POLICY "Public update config" ON site_config FOR INSERT WITH CHECK (true);
    CREATE POLICY "Public update config 2" ON site_config FOR UPDATE USING (true);
  END IF;
END $$;

-- Autoriser la modification des prix matériaux
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'printing_materials' AND policyname = 'Public update materials') THEN
    CREATE POLICY "Public update materials" ON printing_materials FOR UPDATE USING (true);
  END IF;
END $$;

-- Autoriser la création/suppression de coupons
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Public manage coupons') THEN
    CREATE POLICY "Public manage coupons" ON coupons FOR ALL USING (true);
  END IF;
END $$;

-- ==============================================================================