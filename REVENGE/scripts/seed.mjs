// scripts/seed.mjs
//
// Seeds a fresh Supabase project with demo data for LocalConnect.
// Run AFTER applying the migrations in supabase/migrations/ (in order).
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs
//
// This uses the service role key (server-only, never in the browser) because
// creating auth users and bypassing RLS for seeding requires elevated
// privileges. Do not commit your service role key.

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function upsertUser(email, password, fullName, role, extra = {}) {
  const { data: existing } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  let user = existing?.users?.find((u) => u.email === email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: fullName, role },
    });
    if (error) throw error;
    user = data.user;
  }
  await supabase.from('profiles').upsert(
    { user_id: user.id, full_name: fullName, email, role, ...extra },
    { onConflict: 'user_id' }
  );
  return user.id;
}

async function main() {
  console.log('Creating demo accounts...');
  const customerId = await upsertUser('customer@demo.localconnect.app', 'demo1234', 'Ananya Sharma', 'customer', { city: 'Delhi', state: 'Delhi' });
  const providerUserId = await upsertUser('provider@demo.localconnect.app', 'demo1234', 'Suresh Kumar', 'provider', { city: 'Jaipur', state: 'Rajasthan' });
  await upsertUser('admin@demo.localconnect.app', 'demo1234', 'Platform Admin', 'admin');

  console.log('Fetching categories...');
  const { data: categories } = await supabase.from('categories').select('id, slug');
  const catId = (slug) => categories.find((c) => c.slug === slug)?.id;

  console.log('Seeding demo provider...');
  const { data: provider, error: provErr } = await supabase
    .from('provider_profiles')
    .upsert(
      {
        user_id: providerUserId,
        business_name: 'Jaipur Pottery House',
        slug: 'jaipur-pottery-house',
        category_id: catId('local-experiences'),
        description: 'Blue pottery workshops for individuals, couples and small groups.',
        bio: 'Fourth-generation blue pottery artisans.',
        experience_years: 30,
        phone: '+91 94141 55667',
        email: 'provider@demo.localconnect.app',
        address: 'Amer Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302002',
        latitude: 26.9855,
        longitude: 75.8513,
        price_min: 900,
        price_max: 3500,
        is_verified: true,
        verification_status: 'approved',
        is_active: true,
      },
      { onConflict: 'slug' }
    )
    .select()
    .single();
  if (provErr) throw provErr;

  console.log('Seeding an experience + a completed booking + a review...');
  const { data: experience } = await supabase
    .from('experiences')
    .upsert(
      {
        provider_id: provider.id,
        title: 'Blue Pottery Workshop for Two',
        description: 'Learn the 400-year-old Jaipur blue pottery technique.',
        category_id: catId('local-experiences'),
        location: 'Amer Road Studio', city: 'Jaipur', state: 'Rajasthan',
        latitude: 26.9855, longitude: 75.8513,
        duration: '2.5 hours', price: 1800, max_people: 2, availability: 'Daily, 10am-6pm', is_active: true,
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  const { data: booking } = await supabase
    .from('bookings')
    .insert({
      customer_id: customerId, provider_id: provider.id, experience_id: experience?.id,
      booking_date: '2026-08-01', booking_time: '11:00', status: 'completed',
    })
    .select()
    .single();

  if (booking) {
    await supabase.from('reviews').insert({
      customer_id: customerId, provider_id: provider.id, booking_id: booking.id,
      rating: 5, review_text: 'Wonderful experience, our host was patient and the piece turned out beautifully.',
    });
  }

  console.log('Done. Demo accounts (password "demo1234"):');
  console.log('  customer@demo.localconnect.app');
  console.log('  provider@demo.localconnect.app');
  console.log('  admin@demo.localconnect.app');
}

main().catch((err) => { console.error(err); process.exit(1); });
