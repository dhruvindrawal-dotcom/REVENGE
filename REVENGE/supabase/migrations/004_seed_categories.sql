-- ============================================================================
-- LocalConnect — 004_seed_categories.sql
-- Seeds categories only — safe to run directly in the SQL editor since it has
-- no foreign key dependency on auth.users.
--
-- Provider/experience/booking/review demo data depends on real auth.users
-- rows (Supabase Auth doesn't allow inserting into auth.users via plain SQL
-- in a supported way). Use `node scripts/seed.mjs` instead — it creates the
-- demo auth users via the Admin API and then seeds everything else. See
-- README "Seed data" section.
-- ============================================================================

insert into categories (name, slug, icon, is_active) values
  ('Home Services', 'home-services', 'Hammer', true),
  ('Food & Restaurants', 'food-restaurants', 'UtensilsCrossed', true),
  ('Beauty & Wellness', 'beauty-wellness', 'Sparkles', true),
  ('Repair & Maintenance', 'repair-maintenance', 'Wrench', true),
  ('Photographers', 'photographers', 'Camera', true),
  ('Handicrafts', 'handicrafts', 'Palette', true),
  ('Tutors', 'tutors', 'BookOpen', true),
  ('Events & Weddings', 'events-weddings', 'PartyPopper', true),
  ('Local Experiences', 'local-experiences', 'Compass', true),
  ('Artisans', 'artisans', 'Brush', true)
on conflict (slug) do nothing;
