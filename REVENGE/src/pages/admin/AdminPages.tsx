import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Flag, Star, FolderTree, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listProviders, listCategories } from '../../services/providers';
import { listPendingVerifications, reviewVerification, listReports, updateReportStatus } from '../../services/verification';
import { Card, Badge, Button } from '../../components/ui/primitives';
import { EmptyState, LoadingState } from '../../components/ui/states';
import { useToast } from '../../components/ui/Toast';
import type { ProviderProfile, VerificationRequest, Report, Category } from '../../types';

const NAV = [
  ['/admin/dashboard', 'Dashboard', LayoutDashboard],
  ['/admin/providers', 'Providers', Users],
  ['/admin/reports', 'Reports', Flag],
  ['/admin/reviews', 'Reviews', Star],
  ['/admin/categories', 'Categories', FolderTree],
] as const;

export function AdminLayout() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex shrink-0 items-center gap-2.5 rounded-[--radius-sm] px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-[--color-indigo] text-[--color-paper]' : 'text-[--color-ink-soft] hover:bg-[--color-ink]/5'}`}>
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <Card className="p-4"><p className="text-xs text-[--color-ink-soft]">{label}</p><p className="mt-1 font-display text-2xl text-[--color-ink]">{value}</p></Card>;
}

export function AdminDashboardPage() {
  const [providers, setProviders] = useState<ProviderProfile[] | null>(null);
  const [pending, setPending] = useState<VerificationRequest[] | null>(null);
  const [reports, setReports] = useState<Report[] | null>(null);

  useEffect(() => {
    listProviders().then(setProviders);
    listPendingVerifications().then(setPending);
    listReports().then(setReports);
  }, []);

  if (!providers || !pending || !reports) return <LoadingState />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-[--color-ink]">Admin dashboard</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total providers" value={providers.length} />
        <Stat label="Verified" value={providers.filter((p) => p.is_verified).length} />
        <Stat label="Pending verification" value={pending.length} />
        <Stat label="Open reports" value={reports.filter((r) => r.status === 'pending').length} />
      </div>
      <Card className="p-4">
        <h3 className="mb-3 font-display text-base text-[--color-ink]">Verification queue</h3>
        {pending.length ? (
          <div className="space-y-2">
            {pending.map((v) => {
              const provider = providers.find((p) => p.id === v.provider_id);
              return (
                <div key={v.id} className="flex items-center justify-between rounded-[--radius-sm] border border-[--color-line] p-3">
                  <span className="text-sm text-[--color-ink]">{provider?.business_name ?? v.provider_id}</span>
                  <Badge tone="pending">{v.document_type}</Badge>
                </div>
              );
            })}
          </div>
        ) : <EmptyState title="Queue is empty" />}
      </Card>
    </div>
  );
}

export function AdminProvidersPage() {
  const { profile } = useAuth();
  const [providers, setProviders] = useState<ProviderProfile[] | null>(null);
  const [pending, setPending] = useState<VerificationRequest[]>([]);
  const { show } = useToast();

  const load = () => {
    listProviders().then(setProviders);
    listPendingVerifications().then(setPending);
  };
  useEffect(load, []);

  const decide = async (vrId: string, decision: 'approved' | 'rejected') => {
    await reviewVerification(vrId, decision, profile?.id ?? 'admin');
    show(`Provider ${decision}.`, decision === 'approved' ? 'success' : 'info');
    load();
  };

  if (!providers) return <LoadingState />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-[--color-ink]">Providers</h1>

      {pending.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-3 font-display text-base text-[--color-ink]">Pending verification</h3>
          <div className="space-y-2">
            {pending.map((v) => {
              const provider = providers.find((p) => p.id === v.provider_id);
              return (
                <div key={v.id} className="flex flex-col gap-2 rounded-[--radius-sm] border border-[--color-line] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-[--color-ink]">{provider?.business_name ?? v.provider_id} — {v.document_type}</span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => decide(v.id, 'approved')}><CheckCircle2 className="h-3.5 w-3.5" /> Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => decide(v.id, 'rejected')}><XCircle className="h-3.5 w-3.5" /> Reject</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {providers.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-[--color-ink]">{p.business_name}</h4>
              <Badge tone={p.is_verified ? 'verified' : 'pending'}>{p.verification_status}</Badge>
            </div>
            <p className="mt-1 text-xs text-[--color-ink-soft]">{p.city}, {p.state}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminReportsPage() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const { show } = useToast();

  const load = () => { listReports().then(setReports); };
  useEffect(load, []);

  const act = async (id: string, status: Report['status']) => {
    await updateReportStatus(id, status);
    show(`Report ${status}.`, 'success');
    load();
  };

  if (!reports) return <LoadingState />;
  if (!reports.length) return <EmptyState title="No reports" />;

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl text-[--color-ink]">Reports</h1>
      {reports.map((r) => (
        <Card key={r.id} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium capitalize text-[--color-ink]">{r.reason.replace(/_/g, ' ')}</p>
              {r.description && <p className="mt-1 text-sm text-[--color-ink-soft]">{r.description}</p>}
            </div>
            <Badge tone={r.status === 'pending' ? 'pending' : r.status === 'resolved' ? 'verified' : 'neutral'}>{r.status}</Badge>
          </div>
          {r.status === 'pending' && (
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => act(r.id, 'reviewing')}>Start review</Button>
              <Button size="sm" variant="outline" onClick={() => act(r.id, 'resolved')}>Resolve</Button>
              <Button size="sm" variant="ghost" onClick={() => act(r.id, 'dismissed')}>Dismiss</Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export function AdminReviewsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-[--color-ink]">Reviews</h1>
      <EmptyState title="Moderate flagged reviews here" description="Reviews reported by users appear in the Reports queue and can be hidden from there." />
    </div>
  );
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  useEffect(() => { listCategories().then(setCategories); }, []);
  if (!categories) return <LoadingState />;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-[--color-ink]">Categories</h1>
        <Button size="sm" variant="outline">Add category</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {categories.map((c) => (
          <Card key={c.id} className="flex items-center justify-between p-3">
            <span className="text-sm text-[--color-ink]">{c.name}</span>
            <Badge tone={c.is_active ? 'verified' : 'neutral'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
