'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  ChevronDown,
  LayoutDashboard,
  Shield,
  Search,
  Radio,
  HeartHandshake,
  BookOpenText,
  Compass,
  Sparkles,
} from 'lucide-react';

const mobileMinistryGroups = [
  {
    label: 'Spiritual Growth',
    items: [
      { name: 'Family Altar', href: '/family-altar' },
      { name: 'Fasting Companion', href: '/fasting-companion' },
      { name: 'Dream Discernment', href: '/dream-discernment' },
      { name: 'Growth DNA', href: '/growth-dna' },
      { name: 'Scripture Immersion', href: '/scripture-immersion' },
    ],
  },
  {
    label: 'Ministry & Worship',
    items: [
      { name: 'Minister Portal', href: '/minister-portal' },
      { name: 'Pastoral Hub', href: '/pastoral-hub' },
      { name: 'Sunday School', href: '/sunday-school' },
      { name: 'Denominations', href: '/denominations' },
      { name: 'Choir Studio', href: '/choir-studio' },
    ],
  },
  {
    label: 'Global Community',
    items: [
      { name: 'Global Network', href: '/global-network' },
      { name: 'Prayer Watch', href: '/prayer-watch' },
      { name: 'Give & Offering', href: '/give-offering' },
      { name: 'Community Wall', href: '/community-wall' },
    ],
  },
];

const quickMinistryActions = [
  { name: 'Live', href: '/live-service', icon: Radio, note: 'Join worship' },
  { name: 'Pray', href: '/prayer-room', icon: HeartHandshake, note: 'Prayer & care' },
  { name: 'Scripture', href: '/scripture', icon: BookOpenText, note: 'Study & jot' },
  { name: 'Daily Guide', href: '/daily-guide', icon: Compass, note: 'Align today' },
];

export const Navbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Service', href: '/live-service' },
    { name: 'Prayer', href: '/prayer-room' },
    { name: 'Sermons', href: '/sermons' },
    { name: 'AI Pastor', href: '/spiritual' },
    { name: 'Journey', href: '/journey' },
    { name: 'Care', href: '/care' },
    { name: 'Council', href: '/council' },
    { name: 'Give', href: '/offering' },
  ];

  const moreItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Community', href: '/community-wall' },
    { name: 'Conferences', href: '/conferences' },
    { name: 'Children', href: '/children' },
    { name: 'Choir', href: '/choir' },
    { name: 'Intelligence', href: '/intelligence' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Website Builder', href: '/website-builder' },
    { name: 'Multilingual', href: '/multilingual' },
    { name: 'Mobile/Offline', href: '/mobile' },
    { name: 'Transparency', href: '/transparency' },
    { name: 'Request Support', href: '/aid-request' },
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setMobileQuery('');
  }, [pathname]);

  const isAdmin = (session?.user as any)?.role === 'CHURCH_ADMIN';
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  const filteredGroups = useMemo(() => {
    const needle = mobileQuery.trim().toLowerCase();
    if (!needle) return mobileMinistryGroups;
    return mobileMinistryGroups
      .map((group) => ({ ...group, items: group.items.filter((item) => item.name.toLowerCase().includes(needle)) }))
      .filter((group) => group.items.length > 0);
  }, [mobileQuery]);

  const filteredMoreItems = useMemo(() => {
    const needle = mobileQuery.trim().toLowerCase();
    const items = [...navItems.filter((item) => item.name !== 'Home'), ...moreItems];
    if (!needle) return items;
    return items.filter((item) => item.name.toLowerCase().includes(needle));
  }, [mobileQuery]);

  const resultCount = filteredGroups.reduce((count, group) => count + group.items.length, 0) + filteredMoreItems.length;

  return (
    <nav className="glass-morphism fixed z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-light text-sage-600">✝</span>
              <span className="text-xl font-light text-stone-700">Digital Church OS</span>
            </Link>
          </div>

          <div className="hidden 2xl:flex items-center space-x-5">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className={`text-sm tracking-wide transition-colors duration-200 ${isActive(item.href) ? 'font-semibold text-sage-700' : 'text-stone-600 hover:text-sage-600'}`}>
                {item.name}
              </Link>
            ))}
            <Link href="/dashboard" className="text-sm tracking-wide text-stone-600 transition-colors duration-200 hover:text-sage-600">More</Link>
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen((d) => !d)} className="flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none">
                  <img src={session.user?.image || '/default-avatar.png'} alt="Profile" className="h-10 w-10 rounded-full border-2 border-sage-300 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }} />
                  <ChevronDown size={14} className={`text-stone-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }} className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-stone-100 bg-white py-2 shadow-xl">
                      <div className="border-b border-stone-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-stone-800">{session.user?.name}</p>
                        <p className="truncate text-xs text-stone-400">{session.user?.email}</p>
                        {isAdmin && <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">Admin</span>}
                      </div>
                      <div className="max-h-[65vh] overflow-y-auto py-1">
                        <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-sage-50 hover:text-sage-700"><LayoutDashboard size={16} className="text-stone-400" /> Dashboard</Link>
                        <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-sage-50 hover:text-sage-700"><User size={16} className="text-stone-400" /> My Profile</Link>
                        <Link href="/profile/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-sage-50 hover:text-sage-700"><Settings size={16} className="text-stone-400" /> My Settings</Link>
                        {moreItems.slice(1).map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-stone-600 hover:bg-sage-50 hover:text-sage-700">{item.name}</Link>)}
                        {isAdmin && <><div className="mx-4 my-1 border-t border-stone-100" /><Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 transition-colors hover:bg-amber-50"><Shield size={16} className="text-amber-500" /> Admin Panel</Link><Link href="/admin/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 transition-colors hover:bg-amber-50"><Shield size={16} className="text-amber-500" /> Admin Settings</Link></>}
                        <div className="mx-4 my-1 border-t border-stone-100" />
                        <button onClick={() => { setDropdownOpen(false); signOut(); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50"><LogOut size={16} className="text-rose-400" /> Sign Out</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : <Link href="/auth/signin" className="rounded-full bg-sage-500 px-6 py-2 text-white transition-colors hover:bg-sage-600">Sign In</Link>}
          </div>

          <div className="flex items-center 2xl:hidden">
            <button onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-label={isOpen ? 'Close navigation' : 'Open navigation'} className="rounded-xl p-2 text-stone-600 hover:bg-sage-50 hover:text-sage-600">{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </div>

      <motion.div initial={false} animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }} className="overflow-hidden bg-white/98 shadow-xl 2xl:hidden">
        <div className="max-h-[82vh] overflow-y-auto px-4 pb-6 pt-3">
          <div className="sticky top-0 z-10 -mx-4 bg-white/95 px-4 pb-4 pt-1 backdrop-blur">
            <div className="rounded-[1.4rem] border border-sage-100 bg-gradient-to-br from-sage-50 to-cream-50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sage-700"><Sparkles className="h-4 w-4" /> Ministry launcher</div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input value={mobileQuery} onChange={(event) => setMobileQuery(event.target.value)} placeholder="Search prayer, choir, family, care…" aria-label="Search ministry destinations" className="min-h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-3 text-sm text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {quickMinistryActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.href} href={action.href} onClick={() => setIsOpen(false)} className={`flex min-h-[4.7rem] flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition ${isActive(action.href) ? 'border-sage-300 bg-white text-sage-800 shadow-sm' : 'border-white/70 bg-white/70 text-stone-600 hover:border-sage-200'}`}>
                      <Icon className="h-4 w-4" />
                      <span className="mt-1 text-[11px] font-bold">{action.name}</span>
                      <span className="mt-0.5 hidden text-[9px] text-stone-400 sm:block">{action.note}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <Link href="/" className={`flex min-h-12 items-center rounded-xl border px-4 text-sm font-semibold transition ${pathname === '/' ? 'border-sage-200 bg-sage-50 text-sage-800' : 'border-stone-100 bg-white text-stone-700 hover:border-sage-200'}`} onClick={() => setIsOpen(false)}>Home</Link>

          {filteredGroups.map((group) => (
            <section key={group.label} className="py-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sage-700">{group.label}</p>
                <span className="rounded-full bg-sage-50 px-2 py-1 text-[10px] font-semibold text-sage-700">{group.items.length}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} className={`flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${isActive(item.href) ? 'border-sage-300 bg-sage-50 text-sage-800 shadow-sm' : 'border-stone-100 bg-white text-stone-600 hover:border-sage-200 hover:text-sage-700'}`} onClick={() => setIsOpen(false)}>
                    <span>{item.name}</span>
                    {isActive(item.href) && <span className="h-2 w-2 rounded-full bg-sage-600" aria-label="Current page" />}
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <section className="border-t border-cream-200 pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">More Church OS</p>
              {mobileQuery && <span className="text-[10px] text-stone-400">{resultCount} matches</span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {filteredMoreItems.map((item) => (
                <Link key={`${item.href}-${item.name}`} href={item.href} className={`flex min-h-11 items-center rounded-xl border px-3 py-2 text-xs font-medium transition ${isActive(item.href) ? 'border-sage-300 bg-sage-50 text-sage-800' : 'border-stone-100 bg-white text-stone-600 hover:border-sage-200 hover:text-sage-700'}`} onClick={() => setIsOpen(false)}>{item.name}</Link>
              ))}
            </div>
            {mobileQuery && resultCount === 0 && (
              <div className="mt-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center">
                <Search className="mx-auto h-5 w-5 text-stone-400" />
                <p className="mt-2 text-sm font-semibold text-stone-700">No ministry destination matched.</p>
                <p className="mt-1 text-xs leading-5 text-stone-500">Try prayer, family, choir, care, Bible, sermon, community, or giving.</p>
              </div>
            )}
          </section>

          {session ? (
            <div className="mt-4 border-t border-cream-200 pt-3">
              <Link href="/profile" className="block py-3 text-stone-600 hover:text-sage-600" onClick={() => setIsOpen(false)}>My Profile</Link>
              <Link href="/profile/settings" className="block py-3 text-stone-600 hover:text-sage-600" onClick={() => setIsOpen(false)}>My Settings</Link>
              {isAdmin && <><Link href="/admin" className="block py-3 font-medium text-amber-700" onClick={() => setIsOpen(false)}>Admin Panel</Link><Link href="/admin/settings" className="block py-3 font-medium text-amber-700" onClick={() => setIsOpen(false)}>Admin Settings</Link></>}
              <button onClick={() => signOut()} className="w-full py-3 text-left text-rose-600 hover:text-rose-700">Sign Out</button>
            </div>
          ) : <Link href="/auth/signin" className="mt-4 block rounded-xl bg-sage-600 py-3 text-center font-medium text-white" onClick={() => setIsOpen(false)}>Sign In</Link>}
        </div>
      </motion.div>
    </nav>
  );
};