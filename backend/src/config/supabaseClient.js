import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-supabase-project')) {
  console.warn('⚠️ SUPABASE_URL in backend .env is using default template. Supabase operations will run with fallback handling.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
