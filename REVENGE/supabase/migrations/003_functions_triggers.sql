-- ============================================================================
-- LocalConnect — 003_functions_triggers.sql
-- updated_at triggers, rating aggregation, nearby-search RPC, storage buckets.
-- ============================================================================

-- ---- generic updated_at trigger ----
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['provider_profiles','services','experiences','bookings','enquiries','reviews','reports']
  loop
    execute format('drop trigger if exists trg_set_updated_at on %I;', t);
    execute format('create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ---- keep provider_profiles.rating_avg / rating_count in sync with reviews ----
create or replace function refresh_provider_rating() returns trigger as $$
declare
  target_provider uuid := coalesce(new.provider_id, old.provider_id);
begin
  update provider_profiles p
  set rating_avg = coalesce((select round(avg(rating)::numeric, 1) from reviews where provider_id = target_provider and is_visible), 0),
      rating_count = coalesce((select count(*) from reviews where provider_id = target_provider and is_visible), 0)
  where p.id = target_provider;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_refresh_rating_ins on reviews;
create trigger trg_refresh_rating_ins after insert on reviews
  for each row execute function refresh_provider_rating();

drop trigger if exists trg_refresh_rating_upd on reviews;
create trigger trg_refresh_rating_upd after update of rating, is_visible on reviews
  for each row execute function refresh_provider_rating();

drop trigger if exists trg_refresh_rating_del on reviews;
create trigger trg_refresh_rating_del after delete on reviews
  for each row execute function refresh_provider_rating();

-- ---- same, for experiences (rating derived from reviews on bookings tied to that experience) ----
create or replace function refresh_experience_rating() returns trigger as $$
declare
  target_experience uuid;
begin
  select b.experience_id into target_experience
  from bookings b where b.id = coalesce(new.booking_id, old.booking_id);

  if target_experience is not null then
    update experiences e
    set rating_avg = coalesce((
          select round(avg(r.rating)::numeric, 1) from reviews r
          join bookings b on b.id = r.booking_id
          where b.experience_id = target_experience and r.is_visible
        ), 0),
        rating_count = coalesce((
          select count(*) from reviews r
          join bookings b on b.id = r.booking_id
          where b.experience_id = target_experience and r.is_visible
        ), 0)
    where e.id = target_experience;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_refresh_exp_rating on reviews;
create trigger trg_refresh_exp_rating after insert or update or delete on reviews
  for each row execute function refresh_experience_rating();

-- ---- nearby providers RPC: efficient geospatial search using PostGIS index,
-- avoids pulling the whole table into application code ----
create or replace function nearby_providers(
  origin_lat double precision,
  origin_lng double precision,
  radius_km double precision default 25,
  category_slug text default null,
  verified_only boolean default false,
  min_rating numeric default null,
  max_price numeric default null,
  limit_count integer default 50
)
returns table (
  id uuid,
  business_name text,
  slug text,
  city text,
  distance_km double precision,
  rating_avg numeric,
  rating_count integer,
  is_verified boolean,
  price_min numeric,
  price_max numeric
) as $$
  select
    p.id, p.business_name, p.slug, p.city,
    st_distance(p.location, st_setsrid(st_makepoint(origin_lng, origin_lat), 4326)::geography) / 1000.0 as distance_km,
    p.rating_avg, p.rating_count, p.is_verified, p.price_min, p.price_max
  from provider_profiles p
  left join categories c on c.id = p.category_id
  where p.is_active
    and st_dwithin(p.location, st_setsrid(st_makepoint(origin_lng, origin_lat), 4326)::geography, radius_km * 1000)
    and (category_slug is null or c.slug = category_slug)
    and (not verified_only or p.is_verified)
    and (min_rating is null or p.rating_avg >= min_rating)
    and (max_price is null or p.price_min <= max_price)
  order by distance_km asc
  limit limit_count;
$$ language sql stable;

-- ---- storage buckets ----
insert into storage.buckets (id, name, public)
values
  ('provider-avatars', 'provider-avatars', true),
  ('provider-portfolio', 'provider-portfolio', true),
  ('experience-images', 'experience-images', true),
  ('verification-documents', 'verification-documents', false)
on conflict (id) do nothing;

-- Public buckets: anyone can read, only the owning provider can write.
create policy "avatars_public_read" on storage.objects for select
  using (bucket_id = 'provider-avatars');
create policy "avatars_owner_write" on storage.objects for insert
  with check (bucket_id = 'provider-avatars' and owner = auth.uid());

create policy "portfolio_public_read" on storage.objects for select
  using (bucket_id = 'provider-portfolio');
create policy "portfolio_owner_write" on storage.objects for insert
  with check (bucket_id = 'provider-portfolio' and owner = auth.uid());

create policy "experience_images_public_read" on storage.objects for select
  using (bucket_id = 'experience-images');
create policy "experience_images_owner_write" on storage.objects for insert
  with check (bucket_id = 'experience-images' and owner = auth.uid());

-- Verification documents: never public. Only the uploading provider and
-- admins (via service role in the admin review UI) may read.
create policy "verification_docs_owner_read" on storage.objects for select
  using (bucket_id = 'verification-documents' and owner = auth.uid());
create policy "verification_docs_owner_write" on storage.objects for insert
  with check (bucket_id = 'verification-documents' and owner = auth.uid());
