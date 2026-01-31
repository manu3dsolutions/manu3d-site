import { createClient } from '@supabase/supabase-js';

// Récupération sécurisée des variables
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

let client;

// Vérification basique : une clé Supabase valide est un JWT qui commence par "ey"
const isKeyValid = supabaseAnonKey && supabaseAnonKey.startsWith('ey');
const isUrlValid = supabaseUrl && supabaseUrl.includes('supabase.co');

if (isUrlValid && isKeyValid) {
  console.log("✅ Supabase Client : Configuration trouvée.");
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("⚠️ Supabase Client : Configuration manquante ou invalide. Mode 'Démo' activé.");
  client = createClient('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = client;