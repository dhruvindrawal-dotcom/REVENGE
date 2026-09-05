import { MapPin, ExternalLink } from 'lucide-react';
import { Select } from '../ui/primitives';
import { RADIUS_OPTIONS_KM, isGoogleMapsConfigured } from '../../services/maps';
import type { SearchFilters } from '../../types';

export function FilterPanel({ filters, onChange, categories }: {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  categories: { slug: string; name: string }[];
}) {
  return (
    <div className="space-y-5 rounded-[--radius-lg] border border-[--color-line] bg-white/60 p-4">
      <h3 className="font-display text-base text-[--color-ink]">Filters</h3>

      <Select label="Category" value={filters.categorySlug ?? ''} onChange={(e) => onChange({ ...filters, categorySlug: e.target.value || undefined })}>
        <option value="">All categories</option>
        {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </Select>

      <Select label="Distance" value={filters.distanceKm ?? ''} onChange={(e) => onChange({ ...filters, distanceKm: e.target.value ? Number(e.target.value) : undefined })}>
        <option value="">Any distance</option>
        {RADIUS_OPTIONS_KM.map((r) => <option key={r} value={r}>Within {r} km</option>)}
      </Select>

      <Select label="Minimum rating" value={filters.minRating ?? ''} onChange={(e) => onChange({ ...filters, minRating: e.target.value ? Number(e.target.value) : undefined })}>
        <option value="">Any rating</option>
        {[4.5, 4, 3.5, 3].map((r) => <option key={r} value={r}>{r}+ stars</option>)}
      </Select>

      <label className="flex items-center gap-2 text-sm text-[--color-ink]">
        <input type="checkbox" checked={!!filters.verifiedOnly} onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })} className="h-4 w-4 rounded border-[--color-ink]/30" />
        Verified only
      </label>

      <Select label="Sort by" value={filters.sort ?? 'recommended'} onChange={(e) => onChange({ ...filters, sort: e.target.value as SearchFilters['sort'] })}>
        <option value="recommended">Recommended</option>
        <option value="closest">Closest</option>
        <option value="rating">Highest rated</option>
        <option value="popular">Most popular</option>
      </Select>
    </div>
  );
}

interface MapPin { id: string; name: string; lat: number; lng: number; }

/** Static, dependency-free map fallback. Swaps for a real Google Map when VITE_GOOGLE_MAPS_API_KEY is set. */
export function MapView({ pins, center }: { pins: MapPin[]; center?: { lat: number; lng: number } }) {
  if (!isGoogleMapsConfigured) {
    return (
      <div className="relative h-full min-h-[280px] overflow-hidden rounded-[--radius-lg] border border-[--color-line] bg-[--color-paper-dim]">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'radial-gradient(circle, var(--color-ink) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }} />
        <div className="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <MapPin className="h-7 w-7 text-[--color-indigo]/50" />
          <p className="max-w-xs text-sm text-[--color-ink-soft]">
            Map preview (development mode — add <code className="font-mono text-xs">VITE_GOOGLE_MAPS_API_KEY</code> for a live map)
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {pins.slice(0, 6).map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1 rounded-full border border-[--color-line] bg-white px-2.5 py-1 text-xs text-[--color-ink-soft]">
                <MapPin className="h-3 w-3 text-[--color-madder]" /> {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Real mode: embed via Maps Embed API using the first pin / center as focus (no JS SDK needed for a simple embed).
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const focus = center ?? pins[0];
  const src = focus
    ? `https://www.google.com/maps/embed/v1/view?key=${key}&center=${focus.lat},${focus.lng}&zoom=12`
    : undefined;
  return (
    <div className="h-full min-h-[280px] overflow-hidden rounded-[--radius-lg] border border-[--color-line]">
      {src ? (
        <iframe title="Map" src={src} className="h-full w-full" loading="lazy" />
      ) : (
        <div className="flex h-full items-center justify-center gap-2 text-sm text-[--color-ink-soft]">
          <ExternalLink className="h-4 w-4" /> No location to display
        </div>
      )}
    </div>
  );
}
