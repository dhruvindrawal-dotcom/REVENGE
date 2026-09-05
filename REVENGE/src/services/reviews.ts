import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { reviews as mockReviews, bookings as mockBookings } from './mockData';
import type { Review } from '../types';

let localReviews = [...mockReviews];

export async function listReviewsForProvider(providerId: string): Promise<Review[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Review[];
  }
  return localReviews.filter((r) => r.provider_id === providerId && r.is_visible);
}

export class ReviewError extends Error {}

/**
 * Enforces: only customers with a completed booking may review, and only once
 * per booking. RLS mirrors this server-side (see 002_rls_policies.sql) — this
 * client-side check exists for immediate UX feedback, not as the real gate.
 */
export async function createReview(payload: {
  customerId: string;
  providerId: string;
  bookingId: string;
  rating: number;
  reviewText: string;
  customerName?: string;
}): Promise<Review> {
  if (payload.rating < 1 || payload.rating > 5) throw new ReviewError('Rating must be between 1 and 5.');

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        customer_id: payload.customerId,
        provider_id: payload.providerId,
        booking_id: payload.bookingId,
        rating: payload.rating,
        review_text: payload.reviewText,
        is_visible: true,
      })
      .select()
      .single();
    if (error) throw new ReviewError(error.message);
    return data as Review;
  }

  const booking = mockBookings.find((b) => b.id === payload.bookingId);
  if (!booking || booking.status !== 'completed') {
    throw new ReviewError('You can only review a completed booking.');
  }
  if (localReviews.some((r) => r.booking_id === payload.bookingId)) {
    throw new ReviewError('You already reviewed this booking.');
  }
  const review: Review = {
    id: `rev-${Date.now()}`,
    customer_id: payload.customerId,
    provider_id: payload.providerId,
    booking_id: payload.bookingId,
    rating: payload.rating,
    review_text: payload.reviewText,
    is_visible: true,
    customer_name: payload.customerName ?? 'Customer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localReviews = [review, ...localReviews];
  return review;
}
