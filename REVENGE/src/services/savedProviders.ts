import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { savedProviders as mockSaved } from './mockData';
import type { SavedProvider } from '../types';

let localSaved = [...mockSaved];

export async function listSavedProviders(customerId: string): Promise<SavedProvider[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('saved_providers').select('*').eq('customer_id', customerId);
    if (error) throw error;
    return data as SavedProvider[];
  }
  return localSaved.filter((s) => s.customer_id === customerId);
}

export async function isProviderSaved(customerId: string, providerId: string): Promise<boolean> {
  const saved = await listSavedProviders(customerId);
  return saved.some((s) => s.provider_id === providerId);
}

export async function toggleSaveProvider(customerId: string, providerId: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const existing = await supabase
      .from('saved_providers')
      .select('id')
      .eq('customer_id', customerId)
      .eq('provider_id', providerId)
      .maybeSingle();
    if (existing.data) {
      await supabase.from('saved_providers').delete().eq('id', existing.data.id);
      return false;
    }
    await supabase.from('saved_providers').insert({ customer_id: customerId, provider_id: providerId });
    return true;
  }

  const already = localSaved.find((s) => s.customer_id === customerId && s.provider_id === providerId);
  if (already) {
    localSaved = localSaved.filter((s) => s.id !== already.id);
    return false;
  }
  localSaved = [...localSaved, { id: `sp-${Date.now()}`, customer_id: customerId, provider_id: providerId, created_at: new Date().toISOString() }];
  return true;
}
