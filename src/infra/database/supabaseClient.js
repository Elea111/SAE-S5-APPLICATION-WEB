import { createClient } from '@supabase/supabase-js';

// ✅ Vérifier que les variables sont présentes
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERREUR : Variables Supabase manquantes dans .env');
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl);
  console.error('REACT_APP_SUPABASE_ANON_KEY:', supabaseKey);
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export default supabase;
