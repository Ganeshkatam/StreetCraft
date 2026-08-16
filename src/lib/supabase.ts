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

export const supabase: SupabaseClient<Database> = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
