import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Ne pas throw immédiatement, logger un avertissement
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('⚠️  Variables Supabase non définies. Les opérations Supabase échoueront.');
}

let supabase;

try {
  supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceRoleKey || 'placeholder-key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
} catch (err) {
  console.error('❌ Erreur initialisation Supabase:', err.message);
  supabase = null;
}

export default supabase;
