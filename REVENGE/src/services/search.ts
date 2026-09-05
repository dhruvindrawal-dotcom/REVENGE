import type { ProviderProfile, Experience, ParsedSearchIntent, SearchFilters, Category } from '../types';
import { listProviders, listExperiences, listCategories } from './providers';
import { geocode, distanceKm } from './maps';

export interface RankedProvider extends ProviderProfile {
  _distanceKm: number | null;
  _score: number;
}

export interface RankedExperience extends Experience {
  _distanceKm: number | null;
  _score: number;
}

/**
 * Ranking blends: category/keyword relevance, distance, verification,
 * rating, review count. Deliberately not rating-only — see spec section 15.
 */
function scoreProvider(
  p: ProviderProfile,
  cats: Category[],
  intent: ParsedSearchIntent,
  origin: { lat: number; lng: number } | null
): { score: number; distKm: number | null } {
  let score = 0;
  const cat = cats.find((c) => c.id === p.category_id);

  if (intent.category && cat && cat.name.toLowerCase().includes(intent.category.toLowerCase())) score += 40;
  const haystack = `${p.business_name} ${p.description} ${p.bio ?? ''}`.toLowerCase();
  for (const kw of [...intent.service_keywords, ...intent.keywords]) {
    if (kw.length > 2 && haystack.includes(kw.toLowerCase())) score += 6;
  }

  let distKm: number | null = null;
  if (origin) {
    distKm = distanceKm(origin.lat, origin.lng, p.latitude, p.longitude);
    score += Math.max(0, 30 - distKm); // closer = more points, tapers past ~30km
  }

  if (p.is_verified) score += 15;
  score += Math.min(p.rating_avg * 4, 20); // rating contributes, capped
  score += Math.min(p.rating_count / 20, 10); // review volume, capped

  if (intent.budget_max && p.price_min > intent.budget_max) score -= 25;

  return { score, distKm };
}

export async function searchProviders(intent: ParsedSearchIntent, filters?: SearchFilters): Promise<RankedProvider[]> {
  const [all, cats] = await Promise.all([listProviders(), listCategories()]);

  let origin: { lat: number; lng: number } | null = null;
  if (filters?.originLat != null && filters?.originLng != null) {
    origin = { lat: filters.originLat, lng: filters.originLng };
  } else if (intent.location && intent.location !== 'near me') {
    const geo = await geocode(intent.location);
    if (geo) origin = { lat: geo.lat, lng: geo.lng };
  }

  let rows = all.map((p) => {
    const { score, distKm } = scoreProvider(p, cats, intent, origin);
    return { ...p, _distanceKm: distKm, _score: score } as RankedProvider;
  });

  if (filters?.verifiedOnly) rows = rows.filter((r) => r.is_verified);
  if (filters?.minRating) rows = rows.filter((r) => r.rating_avg >= filters.minRating!);
  if (filters?.maxPrice) rows = rows.filter((r) => r.price_min <= filters.maxPrice!);
  if (filters?.categorySlug) {
    const cat = cats.find((c) => c.slug === filters.categorySlug);
    if (cat) rows = rows.filter((r) => r.category_id === cat.id);
  }
  if (filters?.distanceKm && origin) rows = rows.filter((r) => r._distanceKm === null || r._distanceKm <= filters.distanceKm!);

  const sort = filters?.sort ?? 'recommended';
  if (sort === 'closest') rows.sort((a, b) => (a._distanceKm ?? Infinity) - (b._distanceKm ?? Infinity));
  else if (sort === 'rating') rows.sort((a, b) => b.rating_avg - a.rating_avg);
  else if (sort === 'popular') rows.sort((a, b) => b.rating_count - a.rating_count);
  else rows.sort((a, b) => b._score - a._score);

  return rows;
}

export async function searchExperiences(intent: ParsedSearchIntent): Promise<RankedExperience[]> {
  const all = await listExperiences();
  let origin: { lat: number; lng: number } | null = null;
  if (intent.location) {
    const geo = await geocode(intent.location);
    if (geo) origin = { lat: geo.lat, lng: geo.lng };
  }

  const rows = all.map((e) => {
    let score = 0;
    const haystack = `${e.title} ${e.description}`.toLowerCase();
    for (const kw of [...intent.service_keywords, ...intent.keywords]) {
      if (kw.length > 2 && haystack.includes(kw.toLowerCase())) score += 8;
    }
    let distKm: number | null = null;
    if (origin) {
      distKm = distanceKm(origin.lat, origin.lng, e.latitude, e.longitude);
      score += Math.max(0, 30 - distKm);
    }
    if (intent.people && e.max_people >= intent.people) score += 10;
    score += Math.min(e.rating_avg * 4, 20);
    if (intent.budget_max && e.price > intent.budget_max) score -= 20;
    return { ...e, _distanceKm: distKm, _score: score } as RankedExperience;
  });

  rows.sort((a, b) => b._score - a._score);
  return rows;
}
