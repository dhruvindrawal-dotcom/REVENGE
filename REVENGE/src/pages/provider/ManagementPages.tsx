import { useEffect, useState } from 'react';
import { ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listEnquiriesForProvider, updateEnquiryStatus, listBookingsForProvider, updateBookingStatus } from '../../services/bookings';
import { listReviewsForProvider } from '../../services/reviews';
import { listProviders, getProviderServices } from '../../services/providers';
import { EmptyState, LoadingState } from '../../components/ui/states';
import { Card, Badge, Button, Input, Textarea } from '../../components/ui/primitives';
import { ReviewCard } from '../../components/cards/Cards';
import { useToast } from '../../components/ui/Toast';
import type { Enquiry, Booking, Review, ProviderProfile, Service } from '../../types';

function useMyProviderId() {
  const { profile } = useAuth();
  const [providerId, setProviderId] = useState<string | null>(null);
  useEffect(() => {
    if (!profile) return;
    listProviders().then((all) => setProviderId(all.find((p) => p.user_id === profile.id)?.id ?? all[5]?.id ?? null));
  }, [profile]);
  return providerId;
}

export function ProviderEnquiries() {
  const providerId = useMyProviderId();
  const [items, setItems] = useState<Enquiry[] | null>(null);
  const { show } = useToast();

  useEffect(() => { if (providerId) listEnquiriesForProvider(providerId).then(setItems); }, [providerId]);

  const respond = async (id: string, status: Enquiry['status']) => {
    await updateEnquiryStatus(id, status);
    setItems((cur) => cur!.map((e) => (e.id === id ? { ...e, status } : e)));
    show('Enquiry updated.', 'success');
  };

  if (!items) return <LoadingState />;
  if (!items.length) return <EmptyState title="No enquiries yet" description="Enquiries from customers will show up here." />;

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl text-[--color-ink]">Enquiries</h1>
      {items.map((e) => (
        <Card key={e.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[--color-ink]">{e.message}</p>
            <p className="mt-1 text-xs text-[--color-ink-soft]">{e.budget ? `Budget ₹${e.budget.toLocaleString('en-IN')} · ` : ''}{new Date(e.created_at).toLocaleDateString('en-IN')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={e.status === 'pending' ? 'pending' : 'verified'}>{e.status}</Badge>
            {e.status === 'pending' && (
              <>
                <Button size="sm" variant="outline" onClick={() => respond(e.id, 'responded')}>Mark responded</Button>
                <Button size="sm" variant="ghost" onClick={() => respond(e.id, 'closed')}>Close</Button>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProviderBookings() {
  const providerId = useMyProviderId();
  const [items, setItems] = useState<Booking[] | null>(null);
  const { show } = useToast();

  useEffect(() => { if (providerId) listBookingsForProvider(providerId).then(setItems); }, [providerId]);

  const act = async (id: string, status: Booking['status']) => {
    await updateBookingStatus(id, status);
    setItems((cur) => cur!.map((b) => (b.id === id ? { ...b, status } : b)));
    show(`Booking ${status}.`, 'success');
  };

  if (!items) return <LoadingState />;
  if (!items.length) return <EmptyState title="No bookings yet" />;

  const statusTone: Record<Booking['status'], any> = { pending: 'pending', accepted: 'verified', rejected: 'danger', cancelled: 'danger', completed: 'neutral' };

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl text-[--color-ink]">Bookings</h1>
      {items.map((b) => (
        <Card key={b.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-[--color-ink]"><Clock className="h-3.5 w-3.5" /> {b.booking_date} at {b.booking_time}</p>
            {b.message && <p className="mt-1 text-xs text-[--color-ink-soft]">{b.message}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={statusTone[b.status]}>{b.status}</Badge>
            {b.status === 'pending' && (
              <>
                <Button size="sm" onClick={() => act(b.id, 'accepted')}><CheckCircle2 className="h-3.5 w-3.5" /> Accept</Button>
                <Button size="sm" variant="danger" onClick={() => act(b.id, 'rejected')}><XCircle className="h-3.5 w-3.5" /> Reject</Button>
              </>
            )}
            {b.status === 'accepted' && <Button size="sm" variant="outline" onClick={() => act(b.id, 'completed')}>Mark completed</Button>}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProviderReviews() {
  const providerId = useMyProviderId();
  const [items, setItems] = useState<Review[] | null>(null);
  useEffect(() => { if (providerId) listReviewsForProvider(providerId).then(setItems); }, [providerId]);
  if (!items) return <LoadingState />;
  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl text-[--color-ink]">Reviews</h1>
      {items.length ? items.map((r) => <ReviewCard key={r.id} review={r} />) : <EmptyState title="No reviews yet" />}
    </div>
  );
}

export function ProviderVerificationPage() {
  const providerId = useMyProviderId();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  useEffect(() => { listProviders().then((all) => setProvider(all.find((p) => p.id === providerId) ?? null)); }, [providerId]);

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="font-display text-2xl text-[--color-ink]">Verification</h1>
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className={`h-5 w-5 ${provider?.is_verified ? 'text-[--color-paisley]' : 'text-[--color-ink]/30'}`} />
          <span className="font-medium text-[--color-ink]">Status: </span>
          <Badge tone={provider?.verification_status === 'approved' ? 'verified' : provider?.verification_status === 'rejected' ? 'danger' : 'pending'}>
            {provider?.verification_status ?? 'unverified'}
          </Badge>
        </div>
        <p className="text-sm text-[--color-ink-soft]">
          Verified providers get a trust badge shown across the platform and rank higher in search results.
          Submit your business documents from the "Set up your provider profile" flow if you haven't already.
        </p>
      </Card>
    </div>
  );
}

export function ProviderServicesPage() {
  const providerId = useMyProviderId();
  const [services, setServices] = useState<Service[] | null>(null);
  useEffect(() => { if (providerId) getProviderServices(providerId).then(setServices); }, [providerId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-[--color-ink]">Services</h1>
        <Button size="sm" variant="outline">Add service</Button>
      </div>
      {!services ? <LoadingState /> : services.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-[--color-ink]">{s.name}</h4>
                <Badge tone={s.is_available ? 'verified' : 'neutral'}>{s.is_available ? 'Active' : 'Paused'}</Badge>
              </div>
              <p className="mt-1 text-sm text-[--color-ink-soft]">{s.description}</p>
              <p className="mt-2 text-sm font-medium text-[--color-indigo]">₹{s.price.toLocaleString('en-IN')}</p>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="No services yet" description="Add the services you offer so customers know what to book." action={<Button size="sm">Add your first service</Button>} />}
    </div>
  );
}

export function ProviderProfileSettings() {
  const providerId = useMyProviderId();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const { show } = useToast();
  useEffect(() => { listProviders().then((all) => setProvider(all.find((p) => p.id === providerId) ?? null)); }, [providerId]);

  if (!provider) return <LoadingState />;

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="font-display text-2xl text-[--color-ink]">Profile</h1>
      <Input label="Business name" defaultValue={provider.business_name} />
      <Textarea label="Description" defaultValue={provider.description} rows={4} />
      <Input label="Phone" defaultValue={provider.phone} />
      <Input label="Email" defaultValue={provider.email} />
      <Button onClick={() => show('Profile updated (demo mode — not persisted).', 'success')}>Save changes</Button>
    </div>
  );
}

export function ProviderPortfolioPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-[--color-ink]">Portfolio</h1>
      <EmptyState title="No portfolio images yet" description="Upload photos of your past work — this demo build doesn't have storage wired up, but the UI is ready for it." action={<Button size="sm" variant="outline">Upload photo</Button>} />
    </div>
  );
}

export function ProviderExperiencesManagePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-[--color-ink]">Experiences</h1>
        <Button size="sm" variant="outline">Add experience</Button>
      </div>
      <EmptyState title="Manage the workshops and experiences you host" description="Create an experience listing to appear on /experiences and in AI search results." />
    </div>
  );
}

export function ProviderSettingsPage() {
  const { show } = useToast();
  return (
    <div className="max-w-lg space-y-4">
      <h1 className="font-display text-2xl text-[--color-ink]">Settings</h1>
      <Card className="space-y-3 p-4">
        <label className="flex items-center justify-between text-sm text-[--color-ink]">
          Email notifications
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </label>
        <label className="flex items-center justify-between text-sm text-[--color-ink]">
          Profile visible in search
          <input type="checkbox" defaultChecked className="h-4 w-4" />
        </label>
      </Card>
      <Button variant="danger" onClick={() => show('Account deactivation is disabled in demo mode.', 'info')}>Deactivate account</Button>
    </div>
  );
}
