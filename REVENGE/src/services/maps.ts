import { cityCoords } from './mockData';

export const isGoogleMapsConfigured = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

/** Haversine distance in km between two lat/lng points. */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolve a free-text location string to coordinates.
 * Real mode: would call Google Geocoding API.
 * Fallback: matches against the known city list (case-insensitive substring).
 */
export async function geocode(locationText: string): Promise<{ lat: number; lng: number; city: string } | null> {
  if (isGoogleMapsConfigured) {
    try {
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationText)}&key=${key}`
      );
      const data = await res.json();
      const loc = data?.results?.[0]?.geometry?.location;
      if (loc) return { lat: loc.lat, lng: loc.lng, city: data.results[0].address_components?.[0]?.long_name ?? locationText };
    } catch {
      // fall through to fallback below
    }
  }
  const needle = locationText.trim().toLowerCase();
  const match = Object.entries(cityCoords).find(([city]) => city.toLowerCase().includes(needle) || needle.includes(city.toLowerCase()));
  if (match) return { lat: match[1][0], lng: match[1][1], city: match[0] };
  return null;
}

/** Best-effort reverse geocode; falls back to nearest known city center. */
export function reverseGeocodeFallback(lat: number, lng: number): string {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const [city, [clat, clng]] of Object.entries(cityCoords)) {
    const d = distanceKm(lat, lng, clat, clng);
    if (d < bestDist) {
      bestDist = d;
      best = city;
    }
  }
  return best ?? 'Unknown location';
}

export function getBrowserLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}

export const RADIUS_OPTIONS_KM = [1, 5, 10, 25, 50] as const;
