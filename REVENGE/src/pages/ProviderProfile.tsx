import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Heart, MessageSquare, Calendar } from 'lucide-react';
import { getProviderBySlug, getProviderServices, getProviderExperiences } from '../services/providers';
import { listReviewsForProvider } from '../services/reviews';
import { isProviderSaved, toggleSaveProvider } from '../services/savedProviders';
import { createEnquiry, createBooking } from '../services/bookings';
import { Rating, VerificationBadge } from '../components/badges/Badges';
import { PlaceholderImage } from '../components/ui/PlaceholderImage';
import { Button, Textarea, Input } from '../components/ui/primitives';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { ReviewCard } from '../components/cards/Cards';
import { LoadingState, EmptyState } from '../components/ui/states';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import type { ProviderProfile, Service, Experience, Review } from '../types';

export function ProviderProfilePage() {
  const { slug } = useParams();
  const { profile } = useAuth();
  const { show } = useToast();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState<'enquiry' | 'booking' | null>(null);
  const [msg, setMsg] = useState('');
  const [budget, setBudget] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProviderBySlug(slug).then(async (p) => {
      setProvider(p);
      if (p) {
        const [s, e, r] = await Promise.all([getProviderServices(p.id), getProviderExperiences(p.id), listReviewsForProvider(p.id)]);
        setServices(s); setExperiences(e); setReviews(r);
        if (profile) setSaved(await isProviderSaved(profile.id, p.id));
      }
      setLoading(false);
    });
  }, [slug, profile]);

  if (loading) return <LoadingState label="Loading provider…" />;
  if (!provider) return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState title="Provider not found" description="This profile may have been removed." /></div>;

  const handleSave = async () => {
    if (!profile) return show('Log in to save providers.', 'info');
    setSaved(await toggleSaveProvider(profile.id, provider.id));
  };

  const submitEnquiry = async () => {
    if (!profile) return show('Log in to send an enquiry.', 'info');
    setSubmitting(true);
    try {
      await createEnquiry({ customer_id: profile.id, provider_id: provider.id, message: msg, budget: budget ? Number(budget) : undefined, preferred_date: date || undefined });
      show('Enquiry sent!', 'success');
      setModal(null); setMsg(''); setBudget(''); setDate('');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Something went wrong.', 'error');
    } finally { setSubmitting(false); }
  };

  const submitBooking = async () => {
    if (!profile) return show('Log in to book.', 'info');
    if (!date) return show('Choose a date.', 'error');
    setSubmitting(true);
    try {
      await createBooking({ customer_id: profile.id, provider_id: provider.id, booking_date: date, booking_time: '10:00', message: msg, budget: budget ? Number(budget) : undefined });
      show('Booking request sent!', 'success');
      setModal(null); setMsg(''); setBudget(''); setDate('');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Something went wrong.', 'error');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <PlaceholderImage seed={provider.cover_image ?? provider.id} className="h-48 w-full sm:h-64" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[--radius-md] border-4 border-[--color-paper] bg-[--color-indigo] font-display text-2xl text-[--color-paper] shadow-md">
              {provider.business_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl text-[--color-ink] sm:text-3xl">{provider.business_name}</h1>
                <VerificationBadge verified={provider.is_verified} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[--color-ink-soft]">
                <Rating value={provider.rating_avg} count={provider.rating_count} />
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {provider.city}, {provider.state}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave}><Heart className={`h-4 w-4 ${saved ? 'fill-[--color-madder] text-[--color-madder]' : ''}`} /> {saved ? 'Saved' : 'Save'}</Button>
            <Button variant="outline" onClick={() => setModal('enquiry')}><MessageSquare className="h-4 w-4" /> Enquire</Button>
            <Button onClick={() => setModal('booking')}><Calendar className="h-4 w-4" /> Book</Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <Tabs
              tabs={[
                {
                  id: 'about', label: 'About', content: (
                    <div className="space-y-4">
                      <p className="text-[--color-ink-soft]">{provider.description}</p>
                      {provider.bio && <p className="text-sm text-[--color-ink-soft]">{provider.bio}</p>}
                      <div className="rounded-[--radius-md] border border-[--color-line] bg-white/50 p-4">
                        <h3 className="mb-2 font-display text-base text-[--color-ink]">Trust & verification</h3>
                        <p className="text-sm text-[--color-ink-soft]">
                          {provider.is_verified
                            ? 'This provider has completed identity and business verification with our admin team.'
                            : 'This provider has not completed verification yet. Proceed with the usual care you would with any new local service.'}
                        </p>
                      </div>
                    </div>
                  ),
                },
                {
                  id: 'services', label: 'Services', content: services.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {services.map((s) => (
                        <div key={s.id} className="rounded-[--radius-md] border border-[--color-line] bg-white/50 p-4">
                          <h4 className="font-medium text-[--color-ink]">{s.name}</h4>
                          <p className="mt-1 text-sm text-[--color-ink-soft]">{s.description}</p>
                          <p className="mt-2 text-sm font-medium text-[--color-indigo]">₹{s.price.toLocaleString('en-IN')}{s.price_type === 'hourly' ? '/hr' : s.price_type === 'starting_at' ? '+' : ''}</p>
                        </div>
                      ))}
                    </div>
                  ) : <EmptyState title="No services listed yet" />,
                },
                {
                  id: 'reviews', label: `Reviews (${reviews.length})`, content: reviews.length ? (
                    <div className="space-y-3">{reviews.map((r) => <ReviewCard key={r.id} review={r} />)}</div>
                  ) : <EmptyState title="No reviews yet" description="Be the first to complete a booking and leave a review." />,
                },
                {
                  id: 'location', label: 'Location', content: (
                    <div className="space-y-2 text-sm text-[--color-ink-soft]">
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {provider.address}, {provider.city}, {provider.state} {provider.pincode}</p>
                      <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {provider.phone}</p>
                      <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {provider.email}</p>
                      {provider.website && <p className="flex items-center gap-2"><Globe className="h-4 w-4" /> {provider.website}</p>}
                    </div>
                  ),
                },
              ]}
            />
          </div>

          <aside className="space-y-4">
            <div className="rounded-[--radius-md] border border-[--color-line] bg-white/50 p-4">
              <h3 className="mb-1 font-display text-base text-[--color-ink]">Price range</h3>
              <p className="text-lg font-medium text-[--color-indigo]">₹{provider.price_min.toLocaleString('en-IN')} – ₹{provider.price_max.toLocaleString('en-IN')}</p>
            </div>
            {experiences.length > 0 && (
              <div className="rounded-[--radius-md] border border-[--color-line] bg-white/50 p-4">
                <h3 className="mb-2 font-display text-base text-[--color-ink]">Experiences offered</h3>
                {experiences.map((e) => (
                  <Link key={e.id} to={`/experience/${e.id}`} className="block py-1.5 text-sm text-[--color-indigo] hover:underline">{e.title}</Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      <Modal open={modal === 'enquiry'} onClose={() => setModal(null)} title="Send an enquiry">
        <div className="space-y-3">
          <Textarea label="Message" value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="What do you need?" />
          <Input label="Budget (optional)" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <Input label="Preferred date (optional)" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button className="w-full" loading={submitting} onClick={submitEnquiry}>Send enquiry</Button>
        </div>
      </Modal>

      <Modal open={modal === 'booking'} onClose={() => setModal(null)} title="Request a booking">
        <div className="space-y-3">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <Textarea label="Message (optional)" value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} />
          <Input label="Budget (optional)" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <Button className="w-full" loading={submitting} onClick={submitBooking}>Request booking</Button>
        </div>
      </Modal>
    </div>
  );
}
