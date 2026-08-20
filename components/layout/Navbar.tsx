'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpenText,
  ChevronDown,
  Church,
  Compass,
  HandHeart,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';

type Workspace = {
  id: string;
  name: string;
  slug: string;
  role: 'OWNER' | 'ADMIN' | 'PASTOR' | 'STAFF' | 'VIEWER';
};

const primary = [
  { name: 'Pray', href: '/prayer-room', icon: HeartHandshake },
  { name: 'Word', href: '/scripture', icon: BookOpenText },
  { name: 'Worship', href: '/live-service', icon: Radio },
  { name: 'Care', href: '/care', icon: HandHeart },
  { name: 'Journey', href: '/journey', icon: Compass },
];

const exploreGroups = [
  {
    label: 'Spiritual life',
    items: [
      { name: 'Family Altar', href: '/family-altar' },
      { name: 'Fasting Companion', href: '/fasting-companion' },
      { name: 'Scripture Immersion', href: '/scripture-immersion' },
      { name: 'Prayer Watch', href: '/prayer-watch' },
    ],
  },
  {
    label: 'Worship & formation',
    items: [
      { name: 'Choir Studio', href: '/choir-studio' },
      { name: 'Sunday School', href: '/sunday-school' },
      { name: 'Sermons', href: '/sermons' },
      { name: 'Conferences', href: '/conferences' },
    ],
  },
  {
    label: 'Church & community',
    items: [
      { name: 'Church Network', href: '/church-network' },
      { name: 'Community Wall', href: '/community-wall' },
      { name: 'Give', href: '/offering' },
      { name: 'Request Support', href: '/aid-request' },
    ],
  },
];

const workspaceRoles = new Set(['OWNER', 'ADMIN', 'PASTOR', 'STAFF']);

export const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const exploreRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    setMobileOpen(false);
    setExploreOpen(false);
    setAccountOpen(false);
    setQuery('');
  }, [pathname]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      const node = event.target as Node;
      if (exploreRef.current && !exploreRef.current.contains(node)) setExploreOpen(false);
      if (accountRef.current && !accountRef.current.contains(node)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setWorkspaces([]);
      return;
    }

    let cancelled = false;
    fetch('/api/church-ops/workspaces', { cache: 'no-store' })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!cancelled && Array.isArray(data?.workspaces)) setWorkspaces(data.workspaces);
      })
      .catch(() => {
        if (!cancelled) setWorkspaces([]);
      });
    return () => { cancelled = true; };
  }, [session?.user]);

  const canOperateWorkspace = workspaces.some((workspace) => workspaceRoles.has(workspace.role));
  const singleWorkspace = workspaces.length === 1 ? workspaces[0] : null;

  const searchable = useMemo(
    () => [
      ...primary,
      ...exploreGroups.flatMap((group) => group.items),
      ...(canOperateWorkspace
        ? [
            { name: 'Church Workspace', href: '/church-life' },
            { name: 'Command Center', href: '/command-center' },
          ]
        : []),
    ],
    [canOperateWorkspace],
  );

  const mobileResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return searchable;
    return searchable.filter((item) => item.name.toLowerCase().includes(needle));
  }, [query, searchable]);

  return (
    <nav aria-label="Primary navigation" className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#06110f]/82 text-white shadow-[0_12px_45px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-200/20 bg-white/5 text-xl text-amber-200 shadow-inner transition group-hover:border-amber-200/35">✝</span>
          <span>
            <span className="block text-sm font-semibold tracking-wide text-white">Digital Church OS</span>
            <span className="hidden text-[10px] uppercase tracking-[0.22em] text-emerald-200/70 sm:block">Living Sanctuary</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 xl:flex">
          {primary.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-10 items-center gap-2 rounded-full px-4 text-sm transition ${active ? 'bg-white/10 text-amber-100' : 'text-white/70 hover:bg-white/6 hover:text-white'}`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}

          <div className="relative" ref={exploreRef}>
            <button
              type="button"
              onClick={() => setExploreOpen((value) => !value)}
              aria-expanded={exploreOpen}
              className="flex min-h-10 items-center gap-2 rounded-full px-4 text-sm text-white/70 transition hover:bg-white/6 hover:text-white"
            >
              <Sparkles className="h-4 w-4" /> Explore <ChevronDown className={`h-3.5 w-3.5 transition ${exploreOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {exploreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 top-12 w-[620px] rounded-[1.75rem] border border-white/10 bg-[#081713]/96 p-5 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="grid grid-cols-3 gap-3">
                    {exploreGroups.map((group) => (
                      <div key={group.label} className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                        <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/65">{group.label}</p>
                        {group.items.map((item) => (
                          <Link key={item.href} href={item.href} className="block rounded-xl px-2 py-2.5 text-sm text-white/72 transition hover:bg-white/7 hover:text-white">
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                  {canOperateWorkspace && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-200/15 bg-amber-100/[0.045] p-4">
                      <div>
                        <p className="text-xs font-semibold text-amber-100">{singleWorkspace?.name || 'Church workspace'}</p>
                        <p className="mt-1 text-[11px] text-white/50">Tenant-scoped operations, team roles and ministry records.</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href="/church-life" className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/7">Workspace</Link>
                        <Link href="/command-center" className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-[#07110f]">Command Center</Link>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                aria-expanded={accountOpen}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-white/80 transition hover:bg-white/8"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-100/10">
                  {session.user?.image ? <img src={session.user.image} alt="" className="h-full w-full object-cover" /> : <User className="h-4 w-4" />}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 transition ${accountOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#081713]/98 shadow-2xl">
                    <div className="border-b border-white/8 px-4 py-4">
                      <p className="truncate text-sm font-semibold text-white">{session.user?.name || 'Sanctuary member'}</p>
                      <p className="mt-1 truncate text-xs text-white/45">{session.user?.email}</p>
                      {singleWorkspace && <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-amber-200/70">{singleWorkspace.name} · {singleWorkspace.role}</p>}
                    </div>
                    <div className="p-2">
                      <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/72 hover:bg-white/7 hover:text-white"><LayoutDashboard className="h-4 w-4" /> Personal Sanctuary</Link>
                      <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/72 hover:bg-white/7 hover:text-white"><User className="h-4 w-4" /> Profile</Link>
                      <Link href="/profile/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/72 hover:bg-white/7 hover:text-white"><Settings className="h-4 w-4" /> Settings</Link>
                      {canOperateWorkspace && (
                        <>
                          <div className="my-2 border-t border-white/8" />
                          <Link href="/church-life" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-amber-100 hover:bg-white/7"><Church className="h-4 w-4" /> Church Workspace</Link>
                          <Link href="/command-center" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-amber-100 hover:bg-white/7"><ShieldCheck className="h-4 w-4" /> Command Center</Link>
                        </>
                      )}
                      <div className="my-2 border-t border-white/8" />
                      <button type="button" onClick={() => signOut()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-rose-200 hover:bg-rose-300/10"><LogOut className="h-4 w-4" /> Sign out</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/auth/signin" className="hidden rounded-full border border-amber-200/25 bg-amber-100 px-4 py-2 text-sm font-semibold text-[#07110f] sm:inline-flex">Enter Sanctuary</Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close sanctuary navigation' : 'Open sanctuary navigation'}
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white xl:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-white/8 bg-[#06110f]/98 xl:hidden">
            <div className="mx-auto max-h-[78vh] max-w-3xl overflow-y-auto px-4 pb-7 pt-4 sm:px-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find prayer, Scripture, care, choir…" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-200/35" />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {mobileResults.map((item) => (
                  <Link key={`${item.href}-${item.name}`} href={item.href} className={`rounded-2xl border px-4 py-3 text-sm transition ${isActive(item.href) ? 'border-amber-200/25 bg-amber-100/10 text-amber-100' : 'border-white/8 bg-white/[0.035] text-white/70 hover:bg-white/7 hover:text-white'}`}>{item.name}</Link>
                ))}
              </div>

              {session && (
                <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                  <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Your sanctuary</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Link href="/dashboard" className="rounded-xl bg-white/5 px-3 py-3 text-sm text-white/75"><LayoutDashboard className="mb-1 h-4 w-4" />Dashboard</Link>
                    <Link href="/profile" className="rounded-xl bg-white/5 px-3 py-3 text-sm text-white/75"><User className="mb-1 h-4 w-4" />Profile</Link>
                    {canOperateWorkspace && <Link href="/church-life" className="rounded-xl bg-amber-100/8 px-3 py-3 text-sm text-amber-100"><Church className="mb-1 h-4 w-4" />Church Workspace</Link>}
                    {canOperateWorkspace && <Link href="/command-center" className="rounded-xl bg-amber-100/8 px-3 py-3 text-sm text-amber-100"><ShieldCheck className="mb-1 h-4 w-4" />Command Center</Link>}
                  </div>
                  <button type="button" onClick={() => signOut()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200/10 py-2.5 text-sm text-rose-200"><LogOut className="h-4 w-4" /> Sign out</button>
                </div>
              )}

              {!session && <Link href="/auth/signin" className="mt-4 flex items-center justify-center rounded-full bg-amber-100 px-4 py-3 text-sm font-semibold text-[#07110f]">Enter Sanctuary</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};