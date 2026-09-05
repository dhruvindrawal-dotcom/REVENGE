-- ============================================================================
-- LocalConnect — 001_init_schema.sql
-- Core tables, foreign keys, check constraints, and indexes.
-- Run in order: 001 -> 002 (RLS) -> 003 (functions/triggers) -> 004 (seed).
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists postgis; -- for geography() distance queries

-- ---------------------------------------------------------------------------
-- profiles: one row per authenticated user, mirrors auth.users
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  role text not null check (role in ('customer', 'provider', 'admin')),
  city text,
  state text,
  country text default 'India',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_profiles_role on profiles(role);

-- ---------------------------------------------------------------------------
-- categories (hierarchical)
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  icon text not null default 'Sparkles',
  image_url text,
  parent_id uuid references categories(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_categories_parent on categories(parent_id);
create index if not exists idx_categories_slug on categories(slug);

-- ---------------------------------------------------------------------------
-- provider_profiles
-- ---------------------------------------------------------------------------
create table if not exists provider_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text not null,
  slug text not null unique,
  category_id uuid references categories(id) on delete set null,
  description text not null default '',
  bio text,
  experience_years integer not null default 0 check (experience_years >= 0),
  phone text not null,
  email text not null,
  website text,
  address text not null default '',
  city text not null,
  state text not null default '',
  pincode text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  location geography(point, 4326) generated always as (
    st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
  ) stored,
  price_min numeric(10,2) not null default 0 check (price_min >= 0),
  price_max numeric(10,2) not null default 0 check (price_max >= price_min),
  is_verified boolean not null default false,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'approved', 'rejected', 'suspended')),
  verification_notes text,
  is_active boolean not null default true,
  cover_image text,
  avatar_url text,
  rating_avg numeric(2,1) not null default 0 check (rating_avg between 0 and 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_providers_category on provider_profiles(category_id);
create index if not exists idx_providers_city on provider_profiles(city);
create index if not exists idx_providers_active on provider_profiles(is_active) where is_active;
create index if not exists idx_providers_location on provider_profiles using gist(location);
create index if not exists idx_providers_slug on provider_profiles(slug);

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0 check (price >= 0),
  price_type text not null default 'fixed' check (price_type in ('fixed', 'hourly', 'starting_at', 'quote')),
  duration text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_services_provider on services(provider_id);

-- ---------------------------------------------------------------------------
-- provider_portfolio
-- ---------------------------------------------------------------------------
create table if not exists provider_portfolio (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  image_url text not null,
  title text not null default '',
  description text,
  created_at timestamptz not null default now()
);
create index if not exists idx_portfolio_provider on provider_portfolio(provider_id);

-- ---------------------------------------------------------------------------
-- experiences
-- ---------------------------------------------------------------------------
create table if not exists experiences (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  category_id uuid references categories(id) on delete set null,
  location text not null default '',
  city text not null,
  state text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  geo_location geography(point, 4326) generated always as (
    st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
  ) stored,
  duration text,
  price numeric(10,2) not null default 0 check (price >= 0),
  max_people integer not null default 1 check (max_people >= 1),
  availability text,
  cover_image text,
  is_active boolean not null default true,
  rating_avg numeric(2,1) not null default 0 check (rating_avg between 0 and 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_experiences_provider on experiences(provider_id);
create index if not exists idx_experiences_location on experiences using gist(geo_location);

create table if not exists experience_images (
  id uuid primary key default uuid_generate_v4(),
  experience_id uuid not null references experiences(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_exp_images_experience on experience_images(experience_id);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  experience_id uuid references experiences(id) on delete set null,
  booking_date date not null,
  booking_time text not null,
  location text,
  message text,
  budget numeric(10,2),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_target_check check (service_id is not null or experience_id is not null)
);
create index if not exists idx_bookings_customer on bookings(customer_id);
create index if not exists idx_bookings_provider on bookings(provider_id);
create index if not exists idx_bookings_status on bookings(status);

-- ---------------------------------------------------------------------------
-- enquiries
-- ---------------------------------------------------------------------------
create table if not exists enquiries (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  message text not null,
  budget numeric(10,2),
  preferred_date date,
  preferred_time text,
  status text not null default 'pending' check (status in ('pending', 'responded', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_enquiries_customer on enquiries(customer_id);
create index if not exists idx_enquiries_provider on enquiries(provider_id);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  booking_id uuid not null references bookings(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review_text text not null default '',
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_id) -- one review per booking
);
create index if not exists idx_reviews_provider on reviews(provider_id) where is_visible;

-- ---------------------------------------------------------------------------
-- saved_providers
-- ---------------------------------------------------------------------------
create table if not exists saved_providers (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, provider_id)
);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  reported_by uuid not null references auth.users(id) on delete cascade,
  provider_id uuid references provider_profiles(id) on delete cascade,
  review_id uuid references reviews(id) on delete cascade,
  reason text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint report_target_check check (provider_id is not null or review_id is not null)
);
create index if not exists idx_reports_status on reports(status);

-- ---------------------------------------------------------------------------
-- verification_requests
-- ---------------------------------------------------------------------------
create table if not exists verification_requests (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  document_type text not null,
  document_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  notes text
);
create index if not exists idx_verification_provider on verification_requests(provider_id);
create index if not exists idx_verification_status on verification_requests(status);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  related_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications(user_id, is_read);

-- ---------------------------------------------------------------------------
-- search_history
-- ---------------------------------------------------------------------------
create table if not exists search_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  query text not null,
  parsed_category text,
  parsed_location text,
  latitude double precision,
  longitude double precision,
  filters jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_search_history_user on search_history(user_id);

-- ---------------------------------------------------------------------------
-- provider_analytics (one row per provider per day)
-- ---------------------------------------------------------------------------
create table if not exists provider_analytics (
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  date date not null,
  profile_views integer not null default 0,
  search_impressions integer not null default 0,
  enquiries integer not null default 0,
  bookings integer not null default 0,
  favorites integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (provider_id, date)
);
