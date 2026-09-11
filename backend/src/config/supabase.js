import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-supabase-project')) {
  console.warn('⚠️ SUPABASE_URL is missing or using default template. Backend will use mock/fallback auth mode when needed.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
