import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, User, Wrench, Image, Compass, MessageSquare, Calendar, Star, BarChart3, ShieldCheck, Settings } from 'lucide-react';

const NAV = [
  ['/provider/dashboard', 'Overview', LayoutDashboard],
  ['/provider/profile', 'Profile', User],
  ['/provider/services', 'Services', Wrench],
  ['/provider/portfolio', 'Portfolio', Image],
  ['/provider/experiences', 'Experiences', Compass],
  ['/provider/enquiries', 'Enquiries', MessageSquare],
  ['/provider/bookings', 'Bookings', Calendar],
  ['/provider/reviews', 'Reviews', Star],
  ['/provider/analytics', 'Analytics', BarChart3],
  ['/provider/verification', 'Verification', ShieldCheck],
  ['/provider/settings', 'Settings', Settings],
] as const;

export function ProviderDashboardLayout() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/provider/dashboard'}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-[--radius-sm] px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-[--color-indigo] text-[--color-paper]' : 'text-[--color-ink-soft] hover:bg-[--color-ink]/5'}`
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
