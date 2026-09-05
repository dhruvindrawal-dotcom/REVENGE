import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Sparkles, MapPin, Handshake, ArrowRight } from 'lucide-react';
import { AISearchBox } from '../components/search/AISearchBox';
import { CategoryCard, ProviderCard } from '../components/cards/Cards';
import { Skeleton } from '../components/ui/primitives';
import { listCategories, listProviders } from '../services/providers';
import type { Category, ProviderProfile } from '../types';

const HOW_IT_WORKS = [
  { icon: MessageSquare, title: 'Tell us what you need', text: 'Describe it in plain language, no filters to configure.' },
  { icon: Sparkles, title: 'AI understands', text: 'We parse category, location, timing and budget automatically.' },
  { icon: MapPin, title: 'Discover trusted providers', text: 'Ranked by relevance, distance, verification and rating.' },
  { icon: Handshake, title: 'Connect and get things done', text: 'Message, enquire or book directly, no middlemen.' },
];

export function Home() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [providers, setProviders] = useState<ProviderProfile[] | null>(null);

  useEffect(() => {
    listCategories().then(setCategories);
    listProviders().then((p) => setProviders(p.slice(0, 6)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-20">
        <div className="max-w-2xl animate-rise-in">
          <h1 className="font-display text-4xl leading-[1.08] text-[--color-ink] sm:text-6xl">
            Discover local talent. Find exactly what you need.
          </h1>
          <p className="mt-5 max-w-lg text-base text-[--color-ink-soft] sm:text-lg">
            Find trusted local businesses, skilled professionals, artisans and authentic experiences near you — simply describe what you need.
          </p>
        </div>
        <div className="mt-8 max-w-2xl">
          <AISearchBox />
        </div>
      </section>

      {/* Popular Categories */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl text-[--color-ink]">Popular categories</h2>
          <Link to="/categories" className="flex items-center gap-1 text-sm font-medium text-[--color-indigo]">All categories <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {categories ? categories.map((c) => <CategoryCard key={c.id} category={c} />) : Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </section>

      {/* Nearby & Recommended */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl text-[--color-ink]">Nearby & recommended</h2>
          <Link to="/search" className="flex items-center gap-1 text-sm font-medium text-[--color-indigo]">See all <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers ? providers.map((p) => <ProviderCard key={p.id} provider={p} />) : Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </section>

      {/* Local Stories */}
      <section className="border-y border-[--color-line] bg-[--color-paper-dim]/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <span className="text-sm font-medium text-[--color-marigold]">Local stories</span>
              <h2 className="mt-2 font-display text-3xl text-[--color-ink]">Traditional skills, kept alive by the people who practice them.</h2>
              <p className="mt-3 max-w-md text-[--color-ink-soft]">
                From blue pottery in Jaipur to marble inlay in Agra, artisans across India are digitizing generations of craft knowledge — one profile at a time.
              </p>
              <Link to="/experiences" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[--color-indigo]">
                Explore local experiences <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['wood-carving-workshop', 'pottery-workshop', 'handloom-weaving', 'marble-inlay-craft'].map((seed) => (
                <div key={seed} className="h-32 overflow-hidden rounded-[--radius-md]">
                  <div className="h-full w-full" style={{ background: 'linear-gradient(135deg, #223A54, #D98E1B)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="mb-8 font-display text-2xl text-[--color-ink]">How it works</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={s.title} className="relative rounded-[--radius-lg] border border-[--color-line] bg-white/60 p-5">
              <span className="font-display text-3xl text-[--color-ink]/10">{i + 1}</span>
              <s.icon className="mb-2 mt-1 h-6 w-6 text-[--color-indigo]" />
              <h3 className="font-display text-base text-[--color-ink]">{s.title}</h3>
              <p className="mt-1 text-sm text-[--color-ink-soft]">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Provider CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col items-start gap-5 rounded-[--radius-lg] bg-[--color-indigo] px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <h2 className="font-display text-2xl text-[--color-paper] sm:text-3xl">Your skills deserve to be discovered.</h2>
            <p className="mt-2 max-w-md text-[--color-paper]/70">Set up a free profile, get discovered by nearby customers, and manage bookings in one place.</p>
          </div>
          <Link to="/providers/register" className="shrink-0 rounded-[--radius-sm] bg-[--color-marigold] px-6 py-3 text-sm font-medium text-[--color-ink] hover:bg-[--color-marigold-dim]">
            Join as a Provider
          </Link>
        </div>
      </section>
    </div>
  );
}
