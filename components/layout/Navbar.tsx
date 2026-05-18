'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings, ChevronDown, LayoutDashboard, Shield } from 'lucide-react';

export const Navbar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const isAdmin = (session?.user as any)?.role === 'CHURCH_ADMIN';

  return (
    <nav className="glass-morphism fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-light text-sage-600">✝</span>
              <span className="text-xl font-light text-stone-700">Digital Church OS</span>
            </Link>
          </div>

          <div className="hidden 2xl:flex items-center space-x-5">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="text-stone-600 hover:text-sage-600 transition-colors duration-200 text-sm tracking-wide">
                {item.name}
              </Link>
            ))}
            <Link href="/dashboard" className="text-stone-600 hover:text-sage-600 transition-colors duration-200 text-sm tracking-wide">More</Link>
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen((d) => !d)} className="flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none">
                  <img src={session.user?.image || '/default-avatar.png'} alt="Profile" className="w-10 h-10 rounded-full border-2 border-sage-300 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }} />
                  <ChevronDown size={14} className={`text-stone-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }} className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 overflow-hidden">
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-sm font-semibold text-stone-800 truncate">{session.user?.name}</p>
                        <p className="text-xs text-stone-400 truncate">{session.user?.email}</p>
                        {isAdmin && <span className="inline-block mt-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>}
                      </div>
                      <div className="max-h-[65vh] overflow-y-auto py-1">
                        <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-sage-50 hover:text-sage-700 transition-colors"><LayoutDashboard size={16} className="text-stone-400" /> Dashboard</Link>
                        <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-sage-50 hover:text-sage-700 transition-colors"><User size={16} className="text-stone-400" /> My Profile</Link>
                        <Link href="/profile/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-sage-50 hover:text-sage-700 transition-colors"><Settings size={16} className="text-stone-400" /> My Settings</Link>
                        {moreItems.slice(1).map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-stone-600 hover:bg-sage-50 hover:text-sage-700">{item.name}</Link>)}
                        {isAdmin && <><div className="mx-4 my-1 border-t border-stone-100" /><Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"><Shield size={16} className="text-amber-500" /> Admin Panel</Link><Link href="/admin/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"><Shield size={16} className="text-amber-500" /> Admin Settings</Link></>}
                        <div className="mx-4 my-1 border-t border-stone-100" />
                        <button onClick={() => { setDropdownOpen(false); signOut(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"><LogOut size={16} className="text-rose-400" /> Sign Out</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : <Link href="/auth/signin" className="px-6 py-2 bg-sage-500 text-white rounded-full hover:bg-sage-600 transition-colors">Sign In</Link>}
          </div>

          <div className="2xl:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-stone-600 hover:text-sage-600">{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </div>

      <motion.div initial={false} animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }} className="2xl:hidden overflow-hidden bg-white/95">
        <div className="max-h-[75vh] overflow-y-auto px-4 py-2 space-y-0">
          {[...navItems, ...moreItems].map((item) => (
            <Link key={`${item.href}-${item.name}`} href={item.href} className="block py-3 text-stone-600 hover:text-sage-600 border-b border-cream-200" onClick={() => setIsOpen(false)}>{item.name}</Link>
          ))}
          {session ? (
            <>
              <Link href="/profile" className="block py-3 text-stone-600 hover:text-sage-600 border-b border-cream-200" onClick={() => setIsOpen(false)}>My Profile</Link>
              <Link href="/profile/settings" className="block py-3 text-stone-600 hover:text-sage-600 border-b border-cream-200" onClick={() => setIsOpen(false)}>My Settings</Link>
              {isAdmin && <><Link href="/admin" className="block py-3 text-amber-700 font-medium border-b border-cream-200" onClick={() => setIsOpen(false)}>Admin Panel</Link><Link href="/admin/settings" className="block py-3 text-amber-700 font-medium border-b border-cream-200" onClick={() => setIsOpen(false)}>Admin Settings</Link></>}
              <button onClick={() => signOut()} className="w-full text-left py-3 text-rose-600 hover:text-rose-700">Sign Out</button>
            </>
          ) : <Link href="/auth/signin" className="block py-3 text-sage-600 font-medium" onClick={() => setIsOpen(false)}>Sign In</Link>}
        </div>
      </motion.div>
    </nav>
  );
};
