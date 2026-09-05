import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { FilterPanel, MapView } from '../components/search/FilterAndMap';
import { ProviderCard } from '../components/cards/Cards';
import { EmptyState, LoadingState } from '../components/ui/states';
import { Input } from '../components/ui/primitives';
import { listCategories } from '../services/providers';
import { searchProviders } from '../services/search';
import type { Category, SearchFilters, ParsedSearchIntent } from '../types';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({ categorySlug: params.get('category') ?? undefined });
  const [keyword, setKeyword] = useState(params.get('q') ?? '');
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchProviders>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { listCategories().then(setCategories); }, []);

  useEffect(() => {
    setLoading(true);
    const intent: ParsedSearchIntent = {
      intent: 'find_provider', category: null, service_keywords: keyword ? [keyword] : [],
      location: null, date_range: null, time_of_day: null, budget_max: filters.maxPrice ?? null,
      people: null, keywords: keyword ? keyword.toLowerCase().split(/\s+/) : [], source: 'fallback', raw_query: keyword,
    };
    searchProviders(intent, filters).then((r) => { setResults(r); setLoading(false); });
  }, [filters, keyword]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setParams((p) => { p.set('q', e.target.value); return p; }); }}
            placeholder="Search by name, service, or keyword…"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_320px]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <FilterPanel filters={filters} onChange={setFilters} categories={categories} />
        </aside>

        <main>
          {loading && <LoadingState label="Searching…" />}
          {!loading && results.length === 0 && (
            <EmptyState icon={<SearchIcon className="h-10 w-10" />} title="No providers found" description="Try expanding your search area or removing a filter." />
          )}
          {!loading && results.length > 0 && (
            <>
              <p className="mb-3 text-sm text-[--color-ink-soft]">{results.length} providers found</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {results.map((p) => <ProviderCard key={p.id} provider={p} distanceKm={p._distanceKm} />)}
              </div>
            </>
          )}
        </main>

        <aside className="hidden h-[calc(100vh-6rem)] lg:sticky lg:top-20 lg:block lg:self-start">
          <MapView pins={results.map((p) => ({ id: p.id, name: p.business_name, lat: p.latitude, lng: p.longitude }))} />
        </aside>
      </div>
    </div>
  );
}
