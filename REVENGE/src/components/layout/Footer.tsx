import { Link, NavLink } from 'react-router-dom';
import { Home, Compass, Heart, Calendar, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[--color-line] pb-20 pt-10 md:pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-display text-lg text-[--color-ink]">
              <span className="flex h-7 w-7 items-center justify-center rounded-[--radius-sm] bg-[--color-indigo] text-[--color-paper]">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              LocalConnect
            </Link>
            <p className="mt-2 max-w-xs text-sm text-[--color-ink-soft]">Connecting local talent with the people who need them, one conversation at a time.</p>
          </div>
          <FooterCol title="Discover" links={[['/search', 'Search'], ['/experiences', 'Experiences'], ['/categories', 'Categories'], ['/map', 'Map']]} />
          <FooterCol title="Providers" links={[['/providers/register', 'Join as a provider'], ['/provider/dashboard', 'Provider dashboard']]} />
          <FooterCol title="Company" links={[['/about', 'About'], ['/login', 'Log in'], ['/signup', 'Sign up']]} />
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-[--color-line] pt-6 text-xs text-[--color-ink]/50 sm:flex-row sm:items-center sm:justify-between">
          <p>Built for Smart India Hackathon 2025.</p>
          <p>© {new Date().getFullYear()} LocalConnect. Demo application.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-2.5 text-sm font-medium text-[--color-ink]">{title}</h4>
      <ul className="space-y-2">
        {links.map(([to, label]) => (
          <li key={to}><Link to={to} className="text-sm text-[--color-ink-soft] hover:text-[--color-ink]">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export function MobileBottomNav() {
  const { profile } = useAuth();
  const dashboardPath = profile?.role === 'provider' ? '/provider/dashboard' : profile?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
  const items: [string, string, typeof Home][] = [
    ['/', 'Home', Home],
    ['/discover', 'Discover', Compass],
    ['/saved', 'Saved', Heart],
    ['/bookings', 'Bookings', Calendar],
    [profile ? dashboardPath : '/login', 'Profile', User],
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[--color-line] bg-[--color-paper]/95 py-1.5 backdrop-blur md:hidden">
      {items.map(([to, label, Icon]) => (
        <NavLink key={label} to={to} className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] ${isActive ? 'text-[--color-indigo]' : 'text-[--color-ink]/50'}`}>
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
