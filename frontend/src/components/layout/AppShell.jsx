import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Search, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Mock Interviews', path: '/mock-interviews' },
  { label: 'My Performance', path: '/performance' },
  { label: 'Feedback', path: '/feedback' },
  { label: 'Question Bank', path: '/question-bank' },
  { label: 'Profile', path: '/profile' },
  { label: 'Settings', path: '/settings' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    function onMouseDown(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  function handleLogout() {
    setAccountMenuOpen(false);
    logout();
    navigate('/auth/login');
  }

  function goTo(path) {
    setAccountMenuOpen(false);
    navigate(path);
  }

  return (
    <div className="min-h-screen bg-[transparent] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside className="card-glass hidden w-[280px] flex-col rounded-[28px] p-5 lg:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-extrabold">AI Interview Bot</div>
              <div className="text-xs text-slate-500">Semester project dashboard</div>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  'flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition',
                  isActive ? 'bg-brand-600 text-white shadow-soft' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700',
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => {
              logout();
              navigate('/auth/login');
            }}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="card-glass relative z-40 flex flex-wrap items-center justify-between gap-4 overflow-visible rounded-[28px] px-5 py-4">
            <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <Input className="h-auto border-0 bg-transparent p-0 shadow-none focus:ring-0" placeholder="Search interviews, skills, questions..." />
            </div>

            <div className="flex items-center gap-3">
              <button className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-brand-200 hover:text-brand-600">
                <Bell className="h-4 w-4" />
              </button>
              <div className="relative z-50" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:border-brand-200 hover:shadow-sm"
                  aria-haspopup="menu"
                  aria-expanded={accountMenuOpen}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {user?.name?.slice(0, 2)?.toUpperCase() || 'AD'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold">{user?.name || 'Alex Johnson'}</div>
                    <div className="text-xs text-slate-500">{user?.email || 'Student'}</div>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', accountMenuOpen && 'rotate-180')} />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[60] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <div className="text-sm font-semibold text-slate-900">{user?.name || 'Alex Johnson'}</div>
                      <div className="text-xs text-slate-500">{user?.email || 'Student'}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => goTo('/profile')}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo('/settings')}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo('/question-bank')}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      Question Bank
                    </button>
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="relative z-0 min-h-0 flex-1">{location.pathname ? <Outlet /> : null}</main>
        </div>
      </div>
    </div>
  );
}
