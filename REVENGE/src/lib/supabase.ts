import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Whether a real Supabase project is configured. When false, every service
 * in src/services/* transparently falls back to the in-memory mock data
 * layer (src/services/mockData.ts) so the app stays fully demoable without
 * any backend provisioned.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

// A client is always created (pointing at a harmless placeholder URL if
// unconfigured) so imports never crash; callers should still check
// isSupabaseConfigured before relying on real network calls.
export const supabase: SupabaseClient = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
