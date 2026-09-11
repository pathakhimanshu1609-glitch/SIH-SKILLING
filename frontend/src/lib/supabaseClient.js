import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-project') &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your-supabase-anon-key')
  );
};

if (!isSupabaseConfigured()) {
  console.warn('⚠️ Supabase credentials not set in frontend .env. Interactive Demo Mode active for role-based authentication testing.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
