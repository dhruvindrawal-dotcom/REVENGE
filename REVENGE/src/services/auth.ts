import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile, Role } from '../types';

const DEMO_STORAGE_KEY = 'localconnect_demo_session';

/**
 * Seed demo accounts for local development / hackathon demos ONLY.
 * These are not real credentials and this path is never used when a real
 * Supabase project is configured — see isSupabaseConfigured.
 */
export const DEMO_ACCOUNTS: Record<Role, Profile & { password: string }> = {
  customer: {
    id: 'user-c1', user_id: 'user-c1', full_name: 'Ananya Sharma', email: 'customer@demo.localconnect.app',
    role: 'customer', city: 'Delhi', state: 'Delhi', country: 'India', password: 'demo1234',
    created_at: '2025-01-01', updated_at: '2025-01-01',
  },
  provider: {
    id: 'user-p6', user_id: 'user-p6', full_name: 'Suresh (Jaipur Pottery House)', email: 'provider@demo.localconnect.app',
    role: 'provider', city: 'Jaipur', state: 'Rajasthan', country: 'India', password: 'demo1234',
    created_at: '2025-01-01', updated_at: '2025-01-01',
  },
  admin: {
    id: 'user-admin', user_id: 'user-admin', full_name: 'Platform Admin', email: 'admin@demo.localconnect.app',
    role: 'admin', country: 'India', password: 'demo1234',
    created_at: '2025-01-01', updated_at: '2025-01-01',
  },
};

export async function signUp(email: string, password: string, fullName: string, role: Role): Promise<Profile> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, role } } });
    if (error) throw error;
    const profile: Partial<Profile> = { user_id: data.user!.id, full_name: fullName, email, role };
    const { data: prof, error: profErr } = await supabase.from('profiles').insert(profile).select().single();
    if (profErr) throw profErr;
    return prof as Profile;
  }
  const profile: Profile = {
    id: `user-${Date.now()}`, user_id: `user-${Date.now()}`, full_name: fullName, email, role,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export async function signIn(email: string, password: string): Promise<Profile> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data: prof, error: profErr } = await supabase.from('profiles').select('*').eq('user_id', data.user!.id).single();
    if (profErr) throw profErr;
    return prof as Profile;
  }
  const match = Object.values(DEMO_ACCOUNTS).find((a) => a.email === email && a.password === password);
  if (!match) throw new Error('Invalid demo credentials. Use one of the demo accounts below.');
  const { password: _pw, ...profile } = match;
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
    return;
  }
  localStorage.removeItem(DEMO_STORAGE_KEY);
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (isSupabaseConfigured) {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return null;
    const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', sessionData.session.user.id).single();
    return (prof as Profile) ?? null;
  }
  const raw = localStorage.getItem(DEMO_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Profile) : null;
}
