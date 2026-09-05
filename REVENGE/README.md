# LocalConnect

A Smart India Hackathon 2025 MVP connecting local businesses, skilled service providers and artisans with the customers and tourists searching for them — powered by natural-language AI search, location-aware discovery, and a trust layer built on verification and reviews.

**Core idea:** "Tell us what you need, and we help you find the right local person."

## Status

This is a working, buildable frontend + service-layer scaffold. It runs immediately with **zero configuration** using in-memory demo data, a deterministic AI-search fallback parser, and a static map view. Every service (`src/services/*`) is written so that adding real credentials (Supabase, Gemini, Google Maps) switches it to live data with no code changes — see [Environment variables](#environment-variables).

**What's fully wired and working today (demo mode):**
- Natural-language search with a real fallback parser (category/location/date/budget/people extraction from plain text)
- Search ranking (relevance + distance + verification + rating + review volume, not rating-only)
- Provider profiles, services, experiences, reviews, bookings, enquiries, saved providers, notifications
- Auth (demo accounts, role-aware routing/guards for customer/provider/admin)
- Provider dashboard (overview + chart, enquiries, bookings, reviews, verification status, services)
- Admin dashboard (verification queue, provider list, reports)
- Multi-step provider onboarding with an AI-assisted profile-description step
- Full responsive layout incl. mobile bottom nav, loading/empty/error states throughout

**What needs your credentials to go live:** real user accounts & persistence (Supabase), live natural-language parsing (Gemini), and a real interactive map (Google Maps). See below.

**What's stubbed for a next pass:** file/image uploads (portfolio, verification documents, avatars) — the UI and Supabase Storage buckets/policies are ready (see migration 003), but the browser upload flow isn't wired up yet.

## Tech stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, React Router, Lucide icons, Recharts
- **Backend:** Supabase (Postgres + Auth + Storage), SQL migrations in `supabase/migrations/`
- **AI:** Gemini API for query parsing, with a deterministic keyword/city-matching fallback
- **Maps:** Google Maps Embed + Geocoding API, with a static dependency-free fallback
- **Validation:** Zod (used to validate AI JSON output before it ever reaches the database layer)

## Folder structure

```
src/
  components/
    ui/          Button, Input, Select, Modal, Toast, Tabs, Dropdown, Skeleton, states...
    layout/       Navbar, Footer, MobileBottomNav
    search/       AISearchBox, FilterPanel, MapView
    cards/        ProviderCard, CategoryCard, ExperienceCard, ReviewCard
    badges/       Rating, VerificationBadge
  context/         AuthContext
  services/        one file per domain (auth, providers, search, ai, maps, bookings, reviews, ...)
                    — each checks isSupabaseConfigured and transparently swaps
                      between Supabase calls and the in-memory mock layer
  pages/           route-level components, grouped by area (provider/, customer/, admin/)
  routes/          RequireAuth route guard
  types/           shared TypeScript types mirroring the DB schema
supabase/
  migrations/      001 schema, 002 RLS policies, 003 functions/triggers/storage, 004 category seed
scripts/
  seed.mjs         creates demo auth users + seeds a provider/experience/booking/review
```

## Setup

```bash
npm install
cp .env.example .env      # fill in whichever keys you have — all are optional
npm run dev
```

The app opens fully functional with demo data even with an empty `.env`.

### Environment variables

| Variable | Where | Effect when unset |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | frontend (`.env`) | Uses in-memory mock data + demo auth (localStorage) instead of Postgres |
| `VITE_GEMINI_API_KEY` | frontend (`.env`) | Uses the deterministic fallback search parser instead of live Gemini |
| `VITE_GOOGLE_MAPS_API_KEY` | frontend (`.env`) | Renders a static development map instead of a live Google Map |
| `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY` | server-only | Used by `scripts/seed.mjs` and would be used by Supabase Edge Functions in a production deploy — never put these in frontend code |

**Security note on the Gemini key:** this scaffold calls Gemini directly from the browser for simplicity/demo speed, which means `VITE_GEMINI_API_KEY` is exposed to the client. For a real deployment, move `src/services/ai.ts`'s `callGemini` into a Supabase Edge Function and call that instead — the fallback/Zod-validation logic can move over unchanged.

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the migrations in order:
   - `supabase/migrations/001_init_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_functions_triggers.sql`
   - `supabase/migrations/004_seed_categories.sql`
3. Copy your Project URL and anon key into `.env` as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
4. Seed demo accounts + a sample provider (needs the service role key, kept out of the frontend):
   ```bash
   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxxx npm run seed
   ```

### Gemini configuration

Get a key at [ai.google.dev](https://ai.google.dev), add it as `VITE_GEMINI_API_KEY`. `src/services/ai.ts` will start calling the live model; on any failure it silently falls back to the deterministic parser, so a bad/missing key never breaks search.

### Google Maps configuration

Enable the **Maps Embed API** and **Geocoding API** on a Google Cloud project, add the key as `VITE_GOOGLE_MAPS_API_KEY`. `src/services/maps.ts` and `MapView` switch to live geocoding/embeds automatically.

## Running locally

```bash
npm run dev       # dev server, http://localhost:5173
npm run build      # tsc -b && vite build — type-checks then builds
npm run preview    # preview the production build
npm run lint       # oxlint
```

## Demo accounts

With no Supabase project connected, use these on the login page (also shown inline on `/login`):

| Role | Email | Password |
|---|---|---|
| Customer | `customer@demo.localconnect.app` | `demo1234` |
| Provider | `provider@demo.localconnect.app` | `demo1234` |
| Admin | `admin@demo.localconnect.app` | `demo1234` |

With a real Supabase project, run `npm run seed` to create the same three accounts as real Supabase Auth users.

## Testing

No automated test suite is included yet (`npm run build` runs a full TypeScript check, which currently passes clean). Recommended next additions: Vitest + React Testing Library for the `services/search.ts` ranking logic and `services/ai.ts` fallback parser (both are pure functions and straightforward to unit test), plus Playwright for the core customer/provider/admin journeys.

## Deployment

- **Frontend:** any static host that supports Vite output (Vercel, Netlify, Cloudflare Pages). Set the `VITE_*` env vars in the host's dashboard.
- **Database/Auth/Storage:** Supabase (already configured via migrations).
- **AI parsing (production hardening):** move to a Supabase Edge Function so the Gemini key isn't shipped to the browser.

## Security

- RLS is enabled on every table (`002_rls_policies.sql`); customers only see their own bookings/enquiries/saved providers, providers only manage their own resources, verification documents and analytics are never publicly readable, and only admins can approve verification or moderate reports.
- No secrets are read from `import.meta.env` except the `VITE_`-prefixed, frontend-safe ones.
- Reviews require a `completed` booking tied to the same provider, enforced both client-side (fast feedback) and via the RLS insert policy (the real gate).

## Known limitations

- Image/file uploads (portfolio, avatars, verification documents) are UI-only — Storage buckets and policies exist (migration 003) but the upload flow isn't implemented yet.
- Gemini calls run client-side in this scaffold (see security note above) — fine for a hackathon demo, should move server-side before any real launch.
- Analytics are demo-generated (deterministic pseudo-random per provider) until real event tracking is wired into `provider_analytics`.
- No automated test suite yet.
