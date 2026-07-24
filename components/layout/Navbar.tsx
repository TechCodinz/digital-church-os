'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings, ChevronDown, LayoutDashboard, Shield, Sparkles } from 'lucide-react';

export const Navbar = () => {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { name: 'Home', href: '/' },
        { name: 'Global Network', href: '/churches' },
        { name: 'Family Altar', href: '/family/devotional' },
        { name: 'Fasting Companion', href: '/spiritual/fasting' },
        { name: 'Dream Discernment', href: '/spiritual/dreams' },
        { name: 'Prayer Watch', href: '/prayer-watch' },
        { name: 'Minister Portal', href: '/minister/onboard' },
        { name: 'Growth DNA', href: '/profile/growth-dna' },
        { name: 'Pastoral Hub', href: '/pastoral/hub' },
        { name: 'Sunday School', href: '/children/sunday-school' },
        { name: 'Denominations', href: '/worship/traditions' },
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
        <nav className="fixed w-full z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center space-x-3">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shadow-lg shadow-amber-500/10">
                                ✝
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                                    Digital Church OS <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                </span>
                                <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest">Global Sanctuary</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-5">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-slate-300 hover:text-amber-400 font-semibold transition-all duration-200 text-xs tracking-wider uppercase py-1"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Session / Sign In Controls */}
                    <div className="hidden md:flex items-center space-x-4">
                        {session ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-2 text-xs font-bold text-slate-200 hover:text-amber-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all"
                                >
                                    <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                                        {session.user?.name?.[0] || 'U'}
                                    </div>
                                    <span>{session.user?.name || 'Believer'}</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </button>

                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs"
                                        >
                                            <Link
                                                href="/profile"
                                                className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                                            >
                                                <User className="w-4 h-4" />
                                                <span>My Profile</span>
                                            </Link>
                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center space-x-2 px-4 py-2 text-amber-400 hover:bg-slate-800"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => signOut()}
                                                className="w-full flex items-center space-x-2 px-4 py-2 text-rose-400 hover:bg-slate-800 text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/20"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-slate-300 hover:text-white focus:outline-none"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-6 space-y-2 text-xs font-semibold"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="block py-2 text-slate-300 hover:text-amber-400 border-b border-slate-800/50"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
