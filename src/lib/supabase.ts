/**
 * StreetCraft Supabase Client Initialization & Typed Client
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Direct static property accesses required for Next.js compiler inlining in browser client bundles
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_URL : '') ||
  '';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_ANON_KEY : '') ||
  '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY !== 'your-supabase-anon-key'
);

export const isGoogleOAuthEnabled = Boolean(
  isSupabaseConfigured &&
    (process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH === 'true' ||
      (typeof process !== 'undefined' && process.env ? process.env.VITE_ENABLE_GOOGLE_OAUTH === 'true' : false))
);

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder'
);
