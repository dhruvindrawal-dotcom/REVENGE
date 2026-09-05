import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Compass, Heart, Calendar, Bell, User, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Dropdown } from '../ui/Dropdown';
import { Button } from '../ui/primitives';
import { listNotifications, markNotificationRead, subscribeNotifications } from '../../services/notifications';
import type { AppNotification } from '../../types';

export function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!profile) return;
    const load = () => listNotifications(profile.id).then(setNotifs);
    load();
    return subscribeNotifications(load);
  }, [profile]);

  const unread = notifs.filter((n) => !n.is_read).length;

  const dashboardPath = profile?.role === 'provider' ? '/provider/dashboard' : profile?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';

  return (
    <header className="sticky top-0 z-40 border-b border-[--color-line] bg-[--color-paper]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg text-[--color-ink]">
          <span className="flex h-8 w-8 items-center justify-center rounded-[--radius-sm] bg-[--color-indigo] text-[--color-paper]">
            <Sparkles className="h-4 w-4" />
          </span>
          LocalConnect
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            ['/discover', 'Discover'],
            ['/search', 'Search'],
            ['/experiences', 'Experiences'],
            ['/categories', 'Categories'],
            ['/about', 'About'],
          ].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-[--radius-sm] px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-[--color-indigo]' : 'text-[--color-ink-soft] hover:text-[--color-ink]'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {profile ? (
            <>
              <Link to="/saved" className="hidden rounded-full p-2 text-[--color-ink-soft] hover:bg-[--color-ink]/5 sm:block" aria-label="Saved providers">
                <Heart className="h-5 w-5" />
              </Link>
              <Link to="/bookings" className="hidden rounded-full p-2 text-[--color-ink-soft] hover:bg-[--color-ink]/5 sm:block" aria-label="Bookings">
                <Calendar className="h-5 w-5" />
              </Link>
              <Dropdown
                trigger={
                  <span className="relative flex rounded-full p-2 text-[--color-ink-soft] hover:bg-[--color-ink]/5" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[--color-madder]" />}
                  </span>
                }
              >
                <div className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 && <p className="p-3 text-sm text-[--color-ink-soft]">No notifications yet.</p>}
                  {notifs.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`block w-full rounded-[--radius-sm] p-2.5 text-left text-sm hover:bg-[--color-ink]/5 ${!n.is_read ? 'bg-[--color-marigold]/8' : ''}`}
                    >
                      <p className="font-medium text-[--color-ink]">{n.title}</p>
                      <p className="text-xs text-[--color-ink-soft]">{n.message}</p>
                    </button>
                  ))}
                </div>
              </Dropdown>
              <Dropdown trigger={<span className="flex h-9 w-9 items-center justify-center rounded-full bg-[--color-indigo] text-sm font-medium text-[--color-paper]">{profile.full_name[0]}</span>}>
                <Link to={dashboardPath} className="flex items-center gap-2 rounded-[--radius-sm] px-3 py-2 text-sm text-[--color-ink] hover:bg-[--color-ink]/5">
                  <User className="h-4 w-4" /> Dashboard
                </Link>
                <button
                  onClick={async () => { await signOut(); navigate('/'); }}
                  className="flex w-full items-center gap-2 rounded-[--radius-sm] px-3 py-2 text-left text-sm text-[--color-madder] hover:bg-[--color-madder]/8"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </Dropdown>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm font-medium text-[--color-ink-soft] hover:text-[--color-ink] sm:block">Log in</Link>
              <Button size="sm" onClick={() => navigate('/signup')}>Sign up</Button>
            </>
          )}
          <button className="rounded-full p-2 text-[--color-ink-soft] hover:bg-[--color-ink]/5 md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-[--color-line] px-4 py-3 md:hidden">
          {[
            ['/discover', 'Discover'],
            ['/search', 'Search'],
            ['/experiences', 'Experiences'],
            ['/categories', 'Categories'],
            ['/providers/register', 'Join as a Provider'],
            ['/about', 'About'],
          ].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-[--radius-sm] px-2 py-2.5 text-sm text-[--color-ink] hover:bg-[--color-ink]/5">
              <Compass className="h-4 w-4 text-[--color-ink]/40" /> {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
