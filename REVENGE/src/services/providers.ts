import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { providers as mockProviders, categories as mockCategories, services as mockServices, experiences as mockExperiences } from './mockData';
import type { ProviderProfile, Category, Service, Experience } from '../types';

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function listCategories(): Promise<Category[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('name');
    if (error) throw error;
    return data as Category[];
  }
  await delay(100);
  return mockCategories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const cats = await listCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}

export async function listProviders(filter?: { categorySlug?: string; city?: string }): Promise<ProviderProfile[]> {
  if (isSupabaseConfigured) {
    let query = supabase.from('provider_profiles').select('*').eq('is_active', true);
    if (filter?.city) query = query.ilike('city', `%${filter.city}%`);
    const { data, error } = await query;
    if (error) throw error;
    let rows = data as ProviderProfile[];
    if (filter?.categorySlug) {
      const cat = await getCategoryBySlug(filter.categorySlug);
      rows = rows.filter((p) => p.category_id === cat?.id);
    }
    return rows;
  }
  await delay(150);
  let rows = mockProviders.filter((p) => p.is_active);
  if (filter?.city) rows = rows.filter((p) => p.city.toLowerCase().includes(filter.city!.toLowerCase()));
  if (filter?.categorySlug) {
    const cat = mockCategories.find((c) => c.slug === filter.categorySlug);
    rows = rows.filter((p) => p.category_id === cat?.id);
  }
  return rows;
}

export async function getProviderBySlug(slug: string): Promise<ProviderProfile | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('provider_profiles').select('*').eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data as ProviderProfile | null;
  }
  await delay(150);
  return mockProviders.find((p) => p.slug === slug) ?? null;
}

export async function getProviderServices(providerId: string): Promise<Service[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('services').select('*').eq('provider_id', providerId).eq('is_available', true);
    if (error) throw error;
    return data as Service[];
  }
  await delay(100);
  return mockServices.filter((s) => s.provider_id === providerId);
}

export async function getProviderExperiences(providerId: string): Promise<Experience[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('experiences').select('*').eq('provider_id', providerId).eq('is_active', true);
    if (error) throw error;
    return data as Experience[];
  }
  await delay(100);
  return mockExperiences.filter((e) => e.provider_id === providerId);
}

export async function listExperiences(): Promise<Experience[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('experiences').select('*').eq('is_active', true);
    if (error) throw error;
    return data as Experience[];
  }
  await delay(150);
  return mockExperiences;
}

export async function getExperienceById(id: string): Promise<Experience | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('experiences').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Experience | null;
  }
  await delay(100);
  return mockExperiences.find((e) => e.id === id) ?? null;
}

export async function createOrUpdateProvider(payload: Partial<ProviderProfile>): Promise<ProviderProfile> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('provider_profiles').upsert(payload).select().single();
    if (error) throw error;
    return data as ProviderProfile;
  }
  await delay(300);
  // demo-mode: pretend to persist
  return { ...mockProviders[0], ...payload } as ProviderProfile;
}
