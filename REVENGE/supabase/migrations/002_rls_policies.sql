-- ============================================================================
-- LocalConnect — 002_rls_policies.sql
-- Row Level Security. Principle: customers only touch their own private
-- data; providers only modify their own provider resources; admins get
-- moderation access; everyone can read public provider/category/experience
-- data. Verification documents are never publicly readable.
-- ============================================================================

-- helper: is the current user an admin?
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where user_id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- helper: does the current user own this provider_profiles row?
create or replace function owns_provider(p_provider_id uuid) returns boolean as $$
  select exists (
    select 1 from provider_profiles where id = p_provider_id and user_id = auth.uid()
  );
$$ language sql stable security definer;

alter table profiles enable row level security;
alter table categories enable row level security;
alter table provider_profiles enable row level security;
alter table services enable row level security;
alter table provider_portfolio enable row level security;
alter table experiences enable row level security;
alter table experience_images enable row level security;
alter table bookings enable row level security;
alter table enquiries enable row level security;
alter table reviews enable row level security;
alter table saved_providers enable row level security;
alter table reports enable row level security;
alter table verification_requests enable row level security;
alter table notifications enable row level security;
alter table search_history enable row level security;
alter table provider_analytics enable row level security;

-- ---- profiles ----
create policy "profiles_select_own_or_admin" on profiles for select
  using (user_id = auth.uid() or is_admin());
create policy "profiles_insert_own" on profiles for insert
  with check (user_id = auth.uid());
create policy "profiles_update_own" on profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- categories: public read, admin write ----
create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for all
  using (is_admin()) with check (is_admin());

-- ---- provider_profiles: public read of active profiles, owner/admin write ----
create policy "providers_public_read_active" on provider_profiles for select
  using (is_active or user_id = auth.uid() or is_admin());
create policy "providers_owner_insert" on provider_profiles for insert
  with check (user_id = auth.uid());
create policy "providers_owner_update" on provider_profiles for update
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());
create policy "providers_owner_delete" on provider_profiles for delete
  using (user_id = auth.uid() or is_admin());

-- ---- services: public read, provider owner write ----
create policy "services_public_read" on services for select using (true);
create policy "services_owner_write" on services for all
  using (owns_provider(provider_id) or is_admin())
  with check (owns_provider(provider_id) or is_admin());

-- ---- provider_portfolio ----
create policy "portfolio_public_read" on provider_portfolio for select using (true);
create policy "portfolio_owner_write" on provider_portfolio for all
  using (owns_provider(provider_id) or is_admin())
  with check (owns_provider(provider_id) or is_admin());

-- ---- experiences ----
create policy "experiences_public_read_active" on experiences for select
  using (is_active or owns_provider(provider_id) or is_admin());
create policy "experiences_owner_write" on experiences for all
  using (owns_provider(provider_id) or is_admin())
  with check (owns_provider(provider_id) or is_admin());

create policy "experience_images_public_read" on experience_images for select using (true);
create policy "experience_images_owner_write" on experience_images for all
  using (exists (select 1 from experiences e where e.id = experience_id and (owns_provider(e.provider_id) or is_admin())))
  with check (exists (select 1 from experiences e where e.id = experience_id and (owns_provider(e.provider_id) or is_admin())));

-- ---- bookings: customer sees own, provider sees their bookings, admin sees all ----
create policy "bookings_select_participant" on bookings for select
  using (customer_id = auth.uid() or owns_provider(provider_id) or is_admin());
create policy "bookings_customer_insert" on bookings for insert
  with check (customer_id = auth.uid());
create policy "bookings_participant_update" on bookings for update
  using (customer_id = auth.uid() or owns_provider(provider_id) or is_admin())
  with check (customer_id = auth.uid() or owns_provider(provider_id) or is_admin());

-- ---- enquiries: same pattern as bookings ----
create policy "enquiries_select_participant" on enquiries for select
  using (customer_id = auth.uid() or owns_provider(provider_id) or is_admin());
create policy "enquiries_customer_insert" on enquiries for insert
  with check (customer_id = auth.uid());
create policy "enquiries_participant_update" on enquiries for update
  using (customer_id = auth.uid() or owns_provider(provider_id) or is_admin())
  with check (customer_id = auth.uid() or owns_provider(provider_id) or is_admin());

-- ---- reviews: public read of visible reviews; only the reviewing customer,
-- with a completed booking, may insert; no direct update of rating/text by
-- anyone except the admin (moderation uses is_visible) ----
create policy "reviews_public_read_visible" on reviews for select
  using (is_visible or customer_id = auth.uid() or is_admin());
create policy "reviews_customer_insert" on reviews for insert
  with check (
    customer_id = auth.uid()
    and exists (
      select 1 from bookings b
      where b.id = booking_id
        and b.customer_id = auth.uid()
        and b.provider_id = reviews.provider_id
        and b.status = 'completed'
    )
  );
create policy "reviews_admin_moderate" on reviews for update
  using (is_admin()) with check (is_admin());

-- ---- saved_providers: customer's own only ----
create policy "saved_select_own" on saved_providers for select using (customer_id = auth.uid());
create policy "saved_insert_own" on saved_providers for insert with check (customer_id = auth.uid());
create policy "saved_delete_own" on saved_providers for delete using (customer_id = auth.uid());

-- ---- reports: reporter can create/see own, provider/admin can see reports
-- about them, admin has full access ----
create policy "reports_select_own_or_target_or_admin" on reports for select
  using (reported_by = auth.uid() or (provider_id is not null and owns_provider(provider_id)) or is_admin());
create policy "reports_insert_own" on reports for insert with check (reported_by = auth.uid());
create policy "reports_admin_update" on reports for update using (is_admin()) with check (is_admin());

-- ---- verification_requests: NEVER publicly readable; owner + admin only ----
create policy "verification_owner_or_admin_read" on verification_requests for select
  using (owns_provider(provider_id) or is_admin());
create policy "verification_owner_insert" on verification_requests for insert
  with check (owns_provider(provider_id));
create policy "verification_admin_update" on verification_requests for update
  using (is_admin()) with check (is_admin());

-- ---- notifications: strictly own ----
create policy "notifications_select_own" on notifications for select using (user_id = auth.uid());
create policy "notifications_update_own" on notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
-- inserts happen via service role / triggers only (no public insert policy)

-- ---- search_history: own only ----
create policy "search_history_select_own" on search_history for select using (user_id = auth.uid());
create policy "search_history_insert_own" on search_history for insert
  with check (user_id = auth.uid() or user_id is null);

-- ---- provider_analytics: owner + admin only (never public) ----
create policy "analytics_owner_or_admin_read" on provider_analytics for select
  using (owns_provider(provider_id) or is_admin());
