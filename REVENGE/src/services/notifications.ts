import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { notifications as mockNotifications } from './mockData';
import type { AppNotification } from '../types';

let localNotifications = [...mockNotifications];
const listeners = new Set<() => void>();

export function subscribeNotifications(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export async function listNotifications(userId: string): Promise<AppNotification[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data as AppNotification[];
  }
  return localNotifications.filter((n) => n.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function markNotificationRead(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    return;
  }
  localNotifications = localNotifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
  listeners.forEach((cb) => cb());
}

export function pushNotification(input: { userId: string; type: string; title: string; message: string; relatedId?: string }) {
  const notif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    related_id: input.relatedId,
    is_read: false,
    created_at: new Date().toISOString(),
  };
  if (!isSupabaseConfigured) {
    localNotifications = [notif, ...localNotifications];
    listeners.forEach((cb) => cb());
  } else {
    supabase.from('notifications').insert(notif).then();
  }
  return notif;
}
