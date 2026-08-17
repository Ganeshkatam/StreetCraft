/**
 * StreetCraft Supabase Client Initialization & Typed Client
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const getEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return '';
};

const SUPABASE_URL =
  getEnv('NEXT_PUBLIC_SUPABASE_URL') ||
  getEnv('VITE_SUPABASE_URL') ||
  '';

const SUPABASE_ANON_KEY =
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  getEnv('VITE_SUPABASE_ANON_KEY') ||
  '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY !== 'your-supabase-anon-key'
);

export const isGoogleOAuthEnabled = Boolean(
  isSupabaseConfigured &&
    (getEnv('NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH') === 'true' ||
      getEnv('VITE_ENABLE_GOOGLE_OAUTH') === 'true')
);

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder'
);
