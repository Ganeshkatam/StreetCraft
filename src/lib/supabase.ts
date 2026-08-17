/**
 * StreetCraft Supabase Client Initialization & Typed Client
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://iodwiyfjwzdvqtrczttb.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key-placeholder';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'public-anon-key-placeholder'
);

export const isGoogleOAuthEnabled = Boolean(
  isSupabaseConfigured && import.meta.env.VITE_ENABLE_GOOGLE_OAUTH === 'true'
);

export const supabase: SupabaseClient<Database> = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
