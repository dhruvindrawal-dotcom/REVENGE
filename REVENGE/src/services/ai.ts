import { z } from 'zod';
import type { ParsedSearchIntent } from '../types';
import { categories, cityCoords } from './mockData';

export const isGeminiConfigured = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

const ParsedIntentSchema = z.object({
  intent: z.enum(['find_provider', 'find_experience', 'unknown']),
  category: z.string().nullable(),
  service_keywords: z.array(z.string()),
  location: z.string().nullable(),
  date_range: z.string().nullable(),
  time_of_day: z.string().nullable(),
  budget_max: z.number().nullable(),
  people: z.number().nullable(),
  keywords: z.array(z.string()),
});

const SYSTEM_PROMPT = `You convert a natural-language local-services search query into structured JSON.
Return ONLY JSON matching this shape, no prose, no markdown fences:
{
  "intent": "find_provider" | "find_experience" | "unknown",
  "category": string | null,       // best-guess category name, e.g. "electrician", "pottery workshop"
  "service_keywords": string[],    // specific services/skills mentioned
  "location": string | null,       // city or area mentioned
  "date_range": string | null,     // e.g. "tomorrow", "this weekend"
  "time_of_day": string | null,    // e.g. "evening", "morning"
  "budget_max": number | null,     // in INR, null if not mentioned
  "people": number | null,         // group size if relevant (experiences)
  "keywords": string[]             // other useful descriptive keywords
}`;

/**
 * Parses a natural-language query into structured search intent.
 * - AI mode: calls Gemini (only if VITE_GEMINI_API_KEY is set) and validates
 *   the response with Zod before ever using it — raw model output never
 *   touches the database layer directly.
 * - Fallback mode: deterministic keyword/city matching. Always available,
 *   so the app never breaks without an API key.
 */
export async function parseSearchQuery(query: string): Promise<ParsedSearchIntent> {
  if (isGeminiConfigured) {
    try {
      const parsed = await callGemini(query);
      if (parsed) return { ...parsed, source: 'ai', raw_query: query };
    } catch {
      // fall through to deterministic fallback — AI must never hard-fail the search
    }
  }
  return { ...fallbackParse(query), source: 'fallback', raw_query: query };
}

async function callGemini(query: string): Promise<Omit<ParsedSearchIntent, 'source' | 'raw_query'> | null> {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nQuery: "${query}"` }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  const cleaned = text.replace(/```json|```/g, '').trim();
  const json = JSON.parse(cleaned);
  const result = ParsedIntentSchema.safeParse(json);
  if (!result.success) return null;
  return result.data;
}

// ---- Deterministic fallback parser -----------------------------------

const CATEGORY_SYNONYMS: Record<string, string[]> = {
  'home-services': ['home service', 'carpenter', 'furniture'],
  'repair-maintenance': ['electrician', 'plumber', 'repair', 'wiring', 'ac repair', 'fix'],
  'photographers': ['photographer', 'photography', 'wedding photo', 'portrait'],
  'handicrafts': ['handicraft', 'craft', 'handloom', 'weaving', 'wood carving', 'woodwork'],
  'beauty-wellness': ['salon', 'beauty', 'makeup', 'spa', 'wellness', 'haircut'],
  'tutors': ['tutor', 'tuition', 'teacher', 'coaching'],
  'events-weddings': ['wedding', 'event', 'decorator', 'catering'],
  'local-experiences': ['workshop', 'experience', 'tour', 'food walk', 'pottery', 'cooking class'],
  'artisans': ['artisan', 'inlay', 'sculptor', 'potter'],
  'food-restaurants': ['restaurant', 'food', 'cafe', 'dhaba'],
};

const TIME_WORDS = ['morning', 'afternoon', 'evening', 'night', 'tonight'];
const DATE_WORDS = ['today', 'tomorrow', 'this weekend', 'next week', 'this week', 'weekend'];

function fallbackParse(rawQuery: string): Omit<ParsedSearchIntent, 'source' | 'raw_query'> {
  const q = rawQuery.toLowerCase();

  let category: string | null = null;
  const serviceKeywords: string[] = [];
  for (const [slug, words] of Object.entries(CATEGORY_SYNONYMS)) {
    for (const w of words) {
      if (q.includes(w)) {
        if (!category) category = categories.find((c) => c.slug === slug)?.name ?? slug;
        serviceKeywords.push(w);
      }
    }
  }

  let location: string | null = null;
  for (const city of Object.keys(cityCoords)) {
    if (q.includes(city.toLowerCase())) {
      location = city;
      break;
    }
  }
  if (!location && (q.includes('near me') || q.includes('nearby'))) {
    location = 'near me';
  }

  const dateRange = DATE_WORDS.find((w) => q.includes(w)) ?? null;
  const timeOfDay = TIME_WORDS.find((w) => q.includes(w)) ?? null;

  const budgetMatch = q.match(/(?:under|below|less than)\s*(?:₹|rs\.?|inr)?\s*(\d{2,7})/i) ??
    q.match(/(?:₹|rs\.?)\s*(\d{2,7})/i);
  const budgetMax = budgetMatch ? Number(budgetMatch[1]) : null;

  const peopleMatch = q.match(/(\d+)\s*(?:people|person|persons|pax|guests)/i) ??
    (q.includes('for two') ? ['', '2'] : q.includes('for couple') ? ['', '2'] : null);
  const people = peopleMatch ? Number(peopleMatch[1]) : null;

  const intent: ParsedSearchIntent['intent'] =
    q.includes('workshop') || q.includes('experience') || q.includes('tour') || q.includes('class')
      ? 'find_experience'
      : category || serviceKeywords.length
      ? 'find_provider'
      : 'unknown';

  const stopwords = new Set(['i', 'need', 'a', 'for', 'the', 'near', 'me', 'find', 'want', 'this', 'an', 'to', 'of', 'in']);
  const keywords = Array.from(
    new Set(
      q
        .replace(/[^\w\s₹]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopwords.has(w))
    )
  );

  return {
    intent,
    category,
    service_keywords: Array.from(new Set(serviceKeywords)),
    location,
    date_range: dateRange,
    time_of_day: timeOfDay,
    budget_max: budgetMax,
    people,
    keywords,
  };
}
