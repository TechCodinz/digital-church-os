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
        { name: 'Global Network', href: '/churches' },
        { name: 'Family Altar', href: '/family/devotional' },
        { name: 'Minister Portal', href: '/minister/onboard' },
        { name: 'Growth DNA', href: '/profile/growth-dna' },
        { name: 'Pastoral Hub', href: '/pastoral/hub' },
        { name: 'Sunday School', href: '/children/sunday-school' },
        { name: 'Kids Stories', href: '/children/stories' },
        { name: 'Denominations', href: '/worship/traditions' },
        { name: 'Choir Studio', href: '/choir/studio' },
        { name: 'Multilingual', href: '/live-service/translate' },
        { name: 'Give', href: '/offering' },
    ];

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
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

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-stone-600 hover:text-sage-600 transition-colors duration-200 text-sm tracking-wide"
                            >
                                {item.name}
                            </Link>
                        ))}

                        {session ? (
                            <div className="relative" ref={dropdownRef}>
                                {/* Avatar + dropdown trigger */}
                                <button
                                    onClick={() => setDropdownOpen(d => !d)}
                                    className="flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none"
                                >
                                    <img
                                        src={session.user?.image || '/default-avatar.png'}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full border-2 border-sage-300 object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                                    />
                                    <ChevronDown size={14} className={`text-stone-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown menu */}
                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 overflow-hidden"
                                        >
                                            {/* User info */}
                                            <div className="px-4 py-3 border-b border-stone-100">
                                                <p className="text-sm font-semibold text-stone-800 truncate">{session.user?.name}</p>
                                                <p className="text-xs text-stone-400 truncate">{session.user?.email}</p>
                                                {isAdmin && <span className="inline-block mt-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>}
                                            </div>

                                            {/* Menu items */}
                                            <div className="py-1">
                                                <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-sage-50 hover:text-sage-700 transition-colors">
                                                    <LayoutDashboard size={16} className="text-stone-400" /> Dashboard
                                                </Link>
                                                <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-sage-50 hover:text-sage-700 transition-colors">
                                                    <User size={16} className="text-stone-400" /> My Profile
                                                </Link>
                                                <Link href="/profile/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-sage-50 hover:text-sage-700 transition-colors">
                                                    <Settings size={16} className="text-stone-400" /> My Settings
                                                </Link>

                                                {/* Admin-only section */}
                                                {isAdmin && (
                                                    <>
                                                        <div className="mx-4 my-1 border-t border-stone-100" />
                                                        <Link href="/admin/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors">
                                                            <Shield size={16} className="text-amber-500" /> Admin Settings
                                                        </Link>
                                                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors">
                                                            <Shield size={16} className="text-amber-500" /> Admin Panel
                                                        </Link>
                                                    </>
                                                )}

                                                <div className="mx-4 my-1 border-t border-stone-100" />
                                                <button onClick={() => { setDropdownOpen(false); signOut(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                                                    <LogOut size={16} className="text-rose-400" /> Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                href="/api/auth/signin"
                                className="px-6 py-2 bg-sage-500 text-white rounded-full hover:bg-sage-600 transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-stone-600 hover:text-sage-600">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <motion.div
                initial={false}
                animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden bg-white/95"
            >
                <div className="px-4 py-2 space-y-0">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="block py-3 text-stone-600 hover:text-sage-600 border-b border-cream-200"
                            onClick={() => setIsOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                    {session ? (
                        <>
                            <Link href="/dashboard" className="block py-3 text-stone-600 hover:text-sage-600 border-b border-cream-200" onClick={() => setIsOpen(false)}>Dashboard</Link>
                            <Link href="/profile/settings" className="block py-3 text-stone-600 hover:text-sage-600 border-b border-cream-200" onClick={() => setIsOpen(false)}>⚙ My Settings</Link>
                            {isAdmin && <Link href="/admin/settings" className="block py-3 text-amber-700 font-medium border-b border-cream-200" onClick={() => setIsOpen(false)}>🔐 Admin Settings</Link>}
                            <button onClick={() => signOut()} className="w-full text-left py-3 text-rose-600 hover:text-rose-700">Sign Out</button>
                        </>
                    ) : (
                        <Link href="/api/auth/signin" className="block py-3 text-sage-600 font-medium" onClick={() => setIsOpen(false)}>Sign In</Link>
                    )}
                </div>
            </motion.div>
        </nav>
    );
};
