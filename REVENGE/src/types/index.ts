// Shared domain types. These mirror the Postgres schema in /supabase/migrations
// so the frontend, the AI parser, and the mock data layer all agree on shape.

export type Role = 'customer' | 'provider' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: Role;
  city?: string;
  state?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  image_url?: string;
  parent_id?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  category_id: string;
  description: string;
  bio?: string;
  experience_years: number;
  phone: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  price_min: number;
  price_max: number;
  is_verified: boolean;
  verification_status: VerificationStatus;
  verification_notes?: string;
  is_active: boolean;
  cover_image?: string;
  avatar_url?: string;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export type PriceType = 'fixed' | 'hourly' | 'starting_at' | 'quote';

export interface Service {
  id: string;
  provider_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  price_type: PriceType;
  duration?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  provider_id: string;
  image_url: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface Experience {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  category_id: string;
  location: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  duration: string;
  price: number;
  max_people: number;
  availability: string;
  cover_image: string;
  images?: string[];
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id?: string;
  experience_id?: string;
  booking_date: string;
  booking_time: string;
  location?: string;
  message?: string;
  budget?: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export type EnquiryStatus = 'pending' | 'responded' | 'closed';

export interface Enquiry {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id?: string;
  message: string;
  budget?: number;
  preferred_date?: string;
  preferred_time?: string;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  customer_id: string;
  provider_id: string;
  booking_id: string;
  rating: number;
  review_text: string;
  is_visible: boolean;
  customer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedProvider {
  id: string;
  customer_id: string;
  provider_id: string;
  created_at: string;
}

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reported_by: string;
  provider_id?: string;
  review_id?: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequest {
  id: string;
  provider_id: string;
  document_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface SearchHistoryEntry {
  id: string;
  user_id?: string;
  query: string;
  parsed_category?: string;
  parsed_location?: string;
  latitude?: number;
  longitude?: number;
  filters?: Record<string, unknown>;
  created_at: string;
}

export interface ProviderAnalyticsDay {
  provider_id: string;
  date: string;
  profile_views: number;
  search_impressions: number;
  enquiries: number;
  bookings: number;
  favorites: number;
}

// ---- AI search contract ----
export interface ParsedSearchIntent {
  intent: 'find_provider' | 'find_experience' | 'unknown';
  category: string | null;
  service_keywords: string[];
  location: string | null;
  date_range: string | null;
  time_of_day: string | null;
  budget_max: number | null;
  people: number | null;
  keywords: string[];
  source: 'ai' | 'fallback';
  raw_query: string;
}

export interface SearchFilters {
  distanceKm?: number;
  minRating?: number;
  maxPrice?: number;
  categorySlug?: string;
  verifiedOnly?: boolean;
  sort?: 'recommended' | 'closest' | 'rating' | 'popular';
  originLat?: number;
  originLng?: number;
}
