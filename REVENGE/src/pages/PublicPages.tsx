import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Users, Calendar } from 'lucide-react';
import { listExperiences, getExperienceById, listCategories, listProviders } from '../services/providers';
import { ExperienceCard, CategoryCard, ProviderCard } from '../components/cards/Cards';
import { LoadingState, EmptyState } from '../components/ui/states';
import { Skeleton, Button, Textarea, Input } from '../components/ui/primitives';
import { Rating } from '../components/badges/Badges';
import { PlaceholderImage } from '../components/ui/PlaceholderImage';
import { Modal } from '../components/ui/Modal';
import { MapView } from '../components/search/FilterAndMap';
import { createBooking } from '../services/bookings';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import type { Experience, Category, ProviderProfile } from '../types';

export function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[] | null>(null);
  useEffect(() => { listExperiences().then(setExperiences); }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-[--color-ink]">Local experiences</h1>
      <p className="mt-1.5 max-w-xl text-[--color-ink-soft]">Handicraft workshops, food trails, cultural tours and more, hosted by local artisans.</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experiences ? experiences.map((e) => <ExperienceCard key={e.id} experience={e} />) : Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
      </div>
    </div>
  );
}

export function ExperienceDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { show } = useToast();
  const [exp, setExp] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getExperienceById(id).then((e) => { setExp(e); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState label="Loading experience…" />;
  if (!exp) return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState title="Experience not found" /></div>;

  const submit = async () => {
    if (!profile) return show('Log in to book this experience.', 'info');
    if (!date) return show('Choose a date.', 'error');
    setSubmitting(true);
    try {
      await createBooking({ customer_id: profile.id, provider_id: exp.provider_id, experience_id: exp.id, booking_date: date, booking_time: '10:00', message: msg });
      show('Booking request sent!', 'success');
      setModal(false); setDate(''); setMsg('');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Something went wrong.', 'error');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PlaceholderImage seed={exp.cover_image} className="h-56 w-full sm:h-80" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl text-[--color-ink]">{exp.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[--color-ink-soft]">
          <Rating value={exp.rating_avg} count={exp.rating_count} />
          <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {exp.location}, {exp.city}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {exp.duration}</span>
          <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> Up to {exp.max_people}</span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <p className="text-[--color-ink-soft]">{exp.description}</p>
            {exp.images && (
              <div className="grid grid-cols-3 gap-2">
                {exp.images.map((img) => <PlaceholderImage key={img} seed={img} className="h-24 rounded-[--radius-sm]" />)}
              </div>
            )}
            <div className="h-56"><MapView pins={[{ id: exp.id, name: exp.title, lat: exp.latitude, lng: exp.longitude }]} center={{ lat: exp.latitude, lng: exp.longitude }} /></div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-[--radius-md] border border-[--color-line] bg-white/50 p-4">
              <p className="text-lg font-medium text-[--color-indigo]">₹{exp.price.toLocaleString('en-IN')} <span className="text-sm text-[--color-ink-soft]">/ person</span></p>
              <p className="mt-1 text-xs text-[--color-ink-soft]">{exp.availability}</p>
              <Button className="mt-3 w-full" onClick={() => setModal(true)}><Calendar className="h-4 w-4" /> Book this experience</Button>
            </div>
          </aside>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Book this experience">
        <div className="space-y-3">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Textarea label="Message (optional)" value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} />
          <Button className="w-full" loading={submitting} onClick={submit}>Request booking</Button>
        </div>
      </Modal>
    </div>
  );
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  useEffect(() => { listCategories().then(setCategories); }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-[--color-ink]">Browse categories</h1>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {categories ? categories.map((c) => <CategoryCard key={c.id} category={c} />) : Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    </div>
  );
}

export function CategoryDetailPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [providers, setProviders] = useState<ProviderProfile[] | null>(null);

  useEffect(() => {
    if (!slug) return;
    listCategories().then((cats) => setCategory(cats.find((c) => c.slug === slug) ?? null));
    listProviders({ categorySlug: slug }).then(setProviders);
  }, [slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-[--color-ink]">{category?.name ?? 'Category'}</h1>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers ? (
          providers.length ? providers.map((p) => <ProviderCard key={p.id} provider={p} />) : <EmptyState title="No providers in this category yet" />
        ) : Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
      </div>
    </div>
  );
}

export function MapPage() {
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  useEffect(() => { listProviders().then(setProviders); }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-5 font-display text-3xl text-[--color-ink]">Map</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="h-[60vh]">
          <MapView pins={providers.map((p) => ({ id: p.id, name: p.business_name, lat: p.latitude, lng: p.longitude }))} />
        </div>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {providers.map((p) => <ProviderCard key={p.id} provider={p} />)}
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl text-[--color-ink]">About LocalConnect</h1>
      <p className="mt-4 text-[--color-ink-soft]">
        LocalConnect is a Smart India Hackathon 2025 project connecting local businesses, skilled service providers and artisans
        with the customers and tourists searching for them. Local talent often lacks digital visibility, and customers struggle
        to discover reliable services nearby — we bridge that gap with natural-language AI search, location-aware discovery,
        and a trust layer built on verification and reviews.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['Discover', 'Find the right local provider through a single, plain-language search.'],
          ['Trust', 'Verification badges and genuine, booking-linked reviews.'],
          ['Local', 'Skills, businesses and experiences rooted in your own neighborhood.'],
        ].map(([t, d]) => (
          <div key={t} className="rounded-[--radius-md] border border-[--color-line] bg-white/50 p-4">
            <h3 className="font-display text-lg text-[--color-ink]">{t}</h3>
            <p className="mt-1 text-sm text-[--color-ink-soft]">{d}</p>
          </div>
        ))}
      </div>
      <Link to="/providers/register" className="mt-8 inline-block text-sm font-medium text-[--color-indigo]">Join as a provider →</Link>
    </div>
  );
}
