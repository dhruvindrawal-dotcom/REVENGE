import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Code2 } from 'lucide-react';
import { AISearchBox } from '../components/search/AISearchBox';
import { ProviderCard, ExperienceCard } from '../components/cards/Cards';
import { EmptyState, LoadingState } from '../components/ui/states';
import { Badge } from '../components/ui/primitives';
import { parseSearchQuery } from '../services/ai';
import { searchProviders, searchExperiences, type RankedProvider, type RankedExperience } from '../services/search';
import type { ParsedSearchIntent } from '../types';

export function Discover() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const [intent, setIntent] = useState<ParsedSearchIntent | null>(null);
  const [providers, setProviders] = useState<RankedProvider[]>([]);
  const [experiences, setExperiences] = useState<RankedExperience[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    parseSearchQuery(q).then(async (parsed) => {
      setIntent(parsed);
      if (parsed.intent === 'find_experience') {
        setExperiences(await searchExperiences(parsed));
        setProviders([]);
      } else {
        setProviders(await searchProviders(parsed));
        setExperiences([]);
      }
      setLoading(false);
    });
  }, [q]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-[--color-ink]">Discover</h1>
      <p className="mt-1.5 text-[--color-ink-soft]">Describe what you need in your own words.</p>
      <div className="mt-6">
        <AISearchBox />
      </div>

      {!q && (
        <div className="mt-10">
          <EmptyState
            icon={<Sparkles className="h-10 w-10" />}
            title="Start by describing what you need"
            description='Try something like "I want a traditional pottery workshop for two people near Jaipur this weekend."'
          />
        </div>
      )}

      {q && loading && <div className="mt-10"><LoadingState label="Understanding your request…" /></div>}

      {q && !loading && intent && (
        <div className="mt-8">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge tone="marigold"><Sparkles className="h-3 w-3" /> {intent.source === 'ai' ? 'AI parsed' : 'Fallback parsed'}</Badge>
            {intent.category && <Badge>{intent.category}</Badge>}
            {intent.location && <Badge>{intent.location}</Badge>}
            {intent.date_range && <Badge>{intent.date_range}</Badge>}
            {intent.budget_max && <Badge>Under ₹{intent.budget_max.toLocaleString('en-IN')}</Badge>}
            {intent.people && <Badge>{intent.people} people</Badge>}
            <button onClick={() => setShowDebug((v) => !v)} className="ml-auto flex items-center gap-1 text-xs text-[--color-ink]/40 hover:text-[--color-ink]">
              <Code2 className="h-3.5 w-3.5" /> {showDebug ? 'Hide' : 'Show'} parsed query
            </button>
          </div>

          {showDebug && (
            <pre className="mb-6 overflow-x-auto rounded-[--radius-md] bg-[--color-ink] p-4 font-mono text-xs text-[--color-paper]/80">
              {JSON.stringify(intent, null, 2)}
            </pre>
          )}

          {providers.length === 0 && experiences.length === 0 && (
            <EmptyState title="No exact match found" description="Try expanding your search area or rephrasing your request." />
          )}

          {providers.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {providers.map((p) => <ProviderCard key={p.id} provider={p} distanceKm={p._distanceKm} />)}
            </div>
          )}
          {experiences.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {experiences.map((e) => <ExperienceCard key={e.id} experience={e} />)}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-[--color-ink-soft]">
            Not quite right? <Link to="/search" className="font-medium text-[--color-indigo]">Try manual search with filters</Link>
          </p>
        </div>
      )}
    </div>
  );
}
