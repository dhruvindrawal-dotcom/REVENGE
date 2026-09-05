import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { bookings as mockBookings, enquiries as mockEnquiries } from './mockData';
import type { Booking, BookingStatus, Enquiry, EnquiryStatus } from '../types';
import { pushNotification } from './notifications';

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
let localBookings = [...mockBookings];
let localEnquiries = [...mockEnquiries];

export async function listBookingsForCustomer(customerId: string): Promise<Booking[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('bookings').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
    if (error) throw error;
    return data as Booking[];
  }
  await delay();
  return localBookings.filter((b) => b.customer_id === customerId);
}

export async function listBookingsForProvider(providerId: string): Promise<Booking[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('bookings').select('*').eq('provider_id', providerId).order('created_at', { ascending: false });
    if (error) throw error;
    return data as Booking[];
  }
  await delay();
  return localBookings.filter((b) => b.provider_id === providerId);
}

export async function createBooking(payload: Omit<Booking, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Booking> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('bookings').insert({ ...payload, status: 'pending' }).select().single();
    if (error) throw error;
    return data as Booking;
  }
  await delay(300);
  const booking: Booking = {
    ...payload,
    id: `bk-${Date.now()}`,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localBookings = [booking, ...localBookings];
  pushNotification({
    userId: payload.provider_id,
    type: 'new_booking',
    title: 'New booking request',
    message: `A customer requested a booking for ${payload.booking_date}.`,
    relatedId: booking.id,
  });
  return booking;
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data as Booking;
  }
  await delay(200);
  localBookings = localBookings.map((b) => (b.id === id ? { ...b, status, updated_at: new Date().toISOString() } : b));
  const updated = localBookings.find((b) => b.id === id)!;
  pushNotification({
    userId: updated.customer_id,
    type: `booking_${status}`,
    title: `Booking ${status}`,
    message: `Your booking on ${updated.booking_date} was ${status}.`,
    relatedId: id,
  });
  return updated;
}

// ---- Enquiries ----

export async function listEnquiriesForProvider(providerId: string): Promise<Enquiry[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('enquiries').select('*').eq('provider_id', providerId).order('created_at', { ascending: false });
    if (error) throw error;
    return data as Enquiry[];
  }
  await delay();
  return localEnquiries.filter((e) => e.provider_id === providerId);
}

export async function listEnquiriesForCustomer(customerId: string): Promise<Enquiry[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('enquiries').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
    if (error) throw error;
    return data as Enquiry[];
  }
  await delay();
  return localEnquiries.filter((e) => e.customer_id === customerId);
}

export async function createEnquiry(payload: Omit<Enquiry, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Enquiry> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('enquiries').insert({ ...payload, status: 'pending' }).select().single();
    if (error) throw error;
    return data as Enquiry;
  }
  await delay(300);
  const enquiry: Enquiry = {
    ...payload,
    id: `enq-${Date.now()}`,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localEnquiries = [enquiry, ...localEnquiries];
  pushNotification({
    userId: payload.provider_id,
    type: 'new_enquiry',
    title: 'New enquiry',
    message: payload.message.slice(0, 80),
    relatedId: enquiry.id,
  });
  return enquiry;
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<Enquiry> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('enquiries').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data as Enquiry;
  }
  await delay(200);
  localEnquiries = localEnquiries.map((e) => (e.id === id ? { ...e, status, updated_at: new Date().toISOString() } : e));
  return localEnquiries.find((e) => e.id === id)!;
}
