import { createClient } from '@supabase/supabase-js';

// Utilisation des variables d'environnement natives de Vite via import.meta.env
// On utilise (import.meta as any) pour éviter les erreurs TS si les types ne sont pas définis
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

let client;

// Vérification
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.warn("⚠️ SUPABASE: Configuration manquante. Mode Hors Ligne activé.");
  // Client factice pour éviter le crash complet
  client = createClient('https://placeholder.supabase.co', 'placeholder');
} else {
  // console.log("🔌 Initialisation Supabase...");
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;