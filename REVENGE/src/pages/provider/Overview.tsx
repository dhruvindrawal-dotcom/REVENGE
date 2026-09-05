import { useEffect, useState } from 'react';
import { Eye, Search, MessageSquare, Calendar as CalIcon, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getProviderAnalytics } from '../../services/verification';
import { listProviders } from '../../services/providers';
import { Card, Skeleton } from '../../components/ui/primitives';
import type { ProviderAnalyticsDay, ProviderProfile } from '../../types';

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-[--color-ink-soft]"><Icon className="h-4 w-4" /> <span className="text-xs">{label}</span></div>
      <p className="mt-2 font-display text-2xl text-[--color-ink]">{value}</p>
    </Card>
  );
}

export function ProviderOverview() {
  const { profile } = useAuth();
  const [data, setData] = useState<ProviderAnalyticsDay[] | null>(null);
  const [me, setMe] = useState<ProviderProfile | null>(null);

  useEffect(() => {
    if (!profile) return;
    getProviderAnalytics(profile.id).then(setData);
    listProviders().then((all) => setMe(all.find((p) => p.user_id === profile.id) ?? all[5] ?? null));
  }, [profile]);

  const totals = data?.reduce((acc, d) => ({
    views: acc.views + d.profile_views, impressions: acc.impressions + d.search_impressions,
    enquiries: acc.enquiries + d.enquiries, bookings: acc.bookings + d.bookings,
  }), { views: 0, impressions: 0, enquiries: 0, bookings: 0 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-[--color-ink]">Overview</h1>
        <p className="text-sm text-[--color-ink-soft]">Welcome back{me ? `, ${me.business_name}` : ''}.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data ? (
          <>
            <MetricCard icon={Eye} label="Profile views (14d)" value={totals!.views} />
            <MetricCard icon={Search} label="Search appearances" value={totals!.impressions} />
            <MetricCard icon={MessageSquare} label="Enquiries" value={totals!.enquiries} />
            <MetricCard icon={CalIcon} label="Bookings" value={totals!.bookings} />
          </>
        ) : Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>

      <Card className="p-4">
        <h3 className="mb-3 font-display text-base text-[--color-ink]">Profile views, last 14 days</h3>
        {data ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
              <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 11 }} stroke="var(--color-ink-soft)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-ink-soft)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--color-line)' }} />
              <Line type="monotone" dataKey="profile_views" stroke="var(--color-indigo)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : <Skeleton className="h-56" />}
      </Card>

      {me && (
        <Card className="p-4">
          <h3 className="mb-2 font-display text-base text-[--color-ink]">Suggestions</h3>
          <ul className="space-y-1.5 text-sm text-[--color-ink-soft]">
            {!me.is_verified && <li className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-[--color-marigold]" /> Submit verification documents to earn the trust badge and rank higher in search.</li>}
            {me.price_max === 0 && <li className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-[--color-marigold]" /> Add pricing to your services so customers know what to expect.</li>}
            <li className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-[--color-marigold]" /> Add portfolio photos — profiles with photos get more enquiries.</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
