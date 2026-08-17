/**
 * StreetCraft Supabase Client Initialization & Typed Client
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY !== 'your-supabase-anon-key'
);

export const isGoogleOAuthEnabled = Boolean(
  isSupabaseConfigured && import.meta.env.VITE_ENABLE_GOOGLE_OAUTH === 'true'
);

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder'
);
