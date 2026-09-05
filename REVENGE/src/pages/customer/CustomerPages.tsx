import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, MessageSquare, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listSavedProviders, toggleSaveProvider } from '../../services/savedProviders';
import { listBookingsForCustomer, listEnquiriesForCustomer } from '../../services/bookings';
import { listNotifications } from '../../services/notifications';
import { listProviders } from '../../services/providers';
import { ProviderCard } from '../../components/cards/Cards';
import { EmptyState, LoadingState } from '../../components/ui/states';
import { Card, Badge, Button } from '../../components/ui/primitives';
import { useToast } from '../../components/ui/Toast';
import type { ProviderProfile, Booking, Enquiry, AppNotification } from '../../types';

export function CustomerDashboard() {
  const { profile } = useAuth();
  const [saved, setSaved] = useState<ProviderProfile[] | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [notifs, setNotifs] = useState<AppNotification[] | null>(null);

  useEffect(() => {
    if (!profile) return;
    Promise.all([listSavedProviders(profile.id), listProviders()]).then(([sp, all]) => setSaved(all.filter((p) => sp.some((s) => s.provider_id === p.id))));
    listBookingsForCustomer(profile.id).then(setBookings);
    listNotifications(profile.id).then(setNotifs);
  }, [profile]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl text-[--color-ink]">Welcome back{profile ? `, ${profile.full_name.split(' ')[0]}` : ''}</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-[--color-ink]"><Calendar className="h-4 w-4" /> Upcoming bookings</h2>
          {!bookings ? <LoadingState /> : bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled').length ? (
            <div className="space-y-2">
              {bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled').map((b) => (
                <Card key={b.id} className="flex items-center justify-between p-3">
                  <span className="text-sm text-[--color-ink]">{b.booking_date} at {b.booking_time}</span>
                  <Badge tone={b.status === 'accepted' ? 'verified' : 'pending'}>{b.status}</Badge>
                </Card>
              ))}
            </div>
          ) : <EmptyState title="No upcoming bookings" />}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-[--color-ink]"><Heart className="h-4 w-4" /> Saved providers</h2>
          {!saved ? <LoadingState /> : saved.length ? (
            <div className="grid gap-3 sm:grid-cols-2">{saved.slice(0, 4).map((p) => <ProviderCard key={p.id} provider={p} />)}</div>
          ) : <EmptyState title="Nothing saved yet" description="Tap the heart on a provider to save them here." />}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-[--color-ink]"><Bell className="h-4 w-4" /> Recent notifications</h2>
          {!notifs ? <LoadingState /> : notifs.length ? (
            <div className="space-y-2">{notifs.slice(0, 5).map((n) => (
              <Card key={n.id} className="p-3">
                <p className="text-sm font-medium text-[--color-ink]">{n.title}</p>
                <p className="text-xs text-[--color-ink-soft]">{n.message}</p>
              </Card>
            ))}</div>
          ) : <EmptyState title="No notifications" />}
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg text-[--color-ink]">Recommended for you</h2>
          <Link to="/discover" className="inline-block rounded-[--radius-md] border border-dashed border-[--color-line] px-4 py-6 text-center text-sm text-[--color-ink-soft] hover:border-[--color-indigo]/40">
            Try a natural-language search to get personalized picks →
          </Link>
        </section>
      </div>
    </div>
  );
}

export function SavedPage() {
  const { profile } = useAuth();
  const [saved, setSaved] = useState<ProviderProfile[] | null>(null);
  const { show } = useToast();

  const load = () => {
    if (!profile) return;
    Promise.all([listSavedProviders(profile.id), listProviders()]).then(([sp, all]) => setSaved(all.filter((p) => sp.some((s) => s.provider_id === p.id))));
  };
  useEffect(load, [profile]);

  if (!profile) return <div className="mx-auto max-w-md px-4 py-16 text-center"><EmptyState title="Log in to see your saved providers" action={<Link to="/login"><Button size="sm">Log in</Button></Link>} /></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 font-display text-2xl text-[--color-ink]">Saved providers</h1>
      {!saved ? <LoadingState /> : saved.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((p) => (
            <div key={p.id} className="relative">
              <ProviderCard provider={p} />
              <button
                onClick={async () => { await toggleSaveProvider(profile.id, p.id); show('Removed from saved.', 'info'); load(); }}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 shadow"
                aria-label="Remove from saved"
              >
                <Heart className="h-4 w-4 fill-[--color-madder] text-[--color-madder]" />
              </button>
            </div>
          ))}
        </div>
      ) : <EmptyState title="Nothing saved yet" description="Tap the heart on any provider to save them here." />}
    </div>
  );
}

export function CustomerBookingsPage() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null);

  useEffect(() => {
    if (!profile) return;
    listBookingsForCustomer(profile.id).then(setBookings);
    listEnquiriesForCustomer(profile.id).then(setEnquiries);
  }, [profile]);

  if (!profile) return <div className="mx-auto max-w-md px-4 py-16 text-center"><EmptyState title="Log in to see your bookings" action={<Link to="/login"><Button size="sm">Log in</Button></Link>} /></div>;

  const statusTone: Record<string, any> = { pending: 'pending', accepted: 'verified', responded: 'verified', rejected: 'danger', cancelled: 'danger', completed: 'neutral', closed: 'neutral' };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 font-display text-2xl text-[--color-ink]">Bookings & enquiries</h1>

      <h2 className="mb-2 flex items-center gap-2 font-display text-lg text-[--color-ink]"><Calendar className="h-4 w-4" /> Bookings</h2>
      <div className="mb-8 space-y-2">
        {!bookings ? <LoadingState /> : bookings.length ? bookings.map((b) => (
          <Card key={b.id} className="flex items-center justify-between p-3">
            <span className="text-sm text-[--color-ink]">{b.booking_date} at {b.booking_time}</span>
            <Badge tone={statusTone[b.status]}>{b.status}</Badge>
          </Card>
        )) : <EmptyState title="No bookings yet" />}
      </div>

      <h2 className="mb-2 flex items-center gap-2 font-display text-lg text-[--color-ink]"><MessageSquare className="h-4 w-4" /> Enquiries</h2>
      <div className="space-y-2">
        {!enquiries ? <LoadingState /> : enquiries.length ? enquiries.map((e) => (
          <Card key={e.id} className="flex items-center justify-between p-3">
            <span className="text-sm text-[--color-ink]">{e.message}</span>
            <Badge tone={statusTone[e.status]}>{e.status}</Badge>
          </Card>
        )) : <EmptyState title="No enquiries yet" />}
      </div>
    </div>
  );
}
