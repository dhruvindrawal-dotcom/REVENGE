import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { verificationRequests as mockVR, reports as mockReports, providers as mockProviders } from './mockData';
import type { VerificationRequest, Report, ProviderAnalyticsDay } from '../types';
import { pushNotification } from './notifications';

let localVR = [...mockVR];
let localReports = [...mockReports];

// ---- Verification ----

export async function listPendingVerifications(): Promise<VerificationRequest[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('verification_requests').select('*').eq('status', 'pending');
    if (error) throw error;
    return data as VerificationRequest[];
  }
  return localVR.filter((v) => v.status === 'pending');
}

export async function submitVerification(payload: { providerId: string; documentType: string; documentUrl: string }): Promise<VerificationRequest> {
  const vr: VerificationRequest = {
    id: `vr-${Date.now()}`,
    provider_id: payload.providerId,
    document_type: payload.documentType,
    document_url: payload.documentUrl,
    status: 'pending',
    submitted_at: new Date().toISOString(),
  };
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('verification_requests').insert(vr).select().single();
    if (error) throw error;
    return data as VerificationRequest;
  }
  localVR = [vr, ...localVR];
  return vr;
}

export async function reviewVerification(id: string, decision: 'approved' | 'rejected', adminId: string, notes?: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('verification_requests').update({ status: decision, reviewed_by: adminId, reviewed_at: new Date().toISOString(), notes }).eq('id', id);
    return;
  }
  const vr = localVR.find((v) => v.id === id);
  localVR = localVR.map((v) => (v.id === id ? { ...v, status: decision, reviewed_at: new Date().toISOString(), reviewed_by: adminId, notes } : v));
  if (vr) {
    const provider = mockProviders.find((p) => p.id === vr.provider_id);
    if (provider) {
      provider.is_verified = decision === 'approved';
      provider.verification_status = decision;
    }
    pushNotification({
      userId: vr.provider_id,
      type: `verification_${decision}`,
      title: `Verification ${decision}`,
      message: decision === 'approved' ? 'Your provider profile is now verified.' : `Your verification was rejected. ${notes ?? ''}`,
    });
  }
}

// ---- Reports ----

export async function createReport(payload: Omit<Report, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Report> {
  const report: Report = { ...payload, id: `rep-${Date.now()}`, status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('reports').insert(report).select().single();
    if (error) throw error;
    return data as Report;
  }
  localReports = [report, ...localReports];
  return report;
}

export async function listReports(): Promise<Report[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Report[];
  }
  return localReports;
}

export async function updateReportStatus(id: string, status: Report['status'], adminNotes?: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('reports').update({ status, admin_notes: adminNotes }).eq('id', id);
    return;
  }
  localReports = localReports.map((r) => (r.id === id ? { ...r, status, admin_notes: adminNotes, updated_at: new Date().toISOString() } : r));
}

// ---- Analytics ----

/** Deterministic demo analytics generator, seeded off the provider id so it's stable across renders. */
export async function getProviderAnalytics(providerId: string, days = 14): Promise<ProviderAnalyticsDay[]> {
  if (isSupabaseConfigured) {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data, error } = await supabase.from('provider_analytics').select('*').eq('provider_id', providerId).gte('date', since).order('date');
    if (error) throw error;
    return data as ProviderAnalyticsDay[];
  }
  let seed = providerId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const out: ProviderAnalyticsDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const views = Math.round(8 + rand() * 40);
    out.push({
      provider_id: providerId,
      date,
      profile_views: views,
      search_impressions: Math.round(views * (2 + rand() * 2)),
      enquiries: Math.round(rand() * 4),
      bookings: Math.round(rand() * 2),
      favorites: Math.round(rand() * 3),
    });
  }
  return out;
}
