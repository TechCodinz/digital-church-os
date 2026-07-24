'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, User, LogOut, ChevronDown, Shield, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const Navbar = () => {
    const { data: session } = useSession();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

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
    const isDark = mounted ? theme === 'dark' : true;

    return (
        <nav
            className={`fixed w-full z-50 transition-colors duration-300 ${
                isDark
                    ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl text-white'
                    : 'bg-amber-50/95 backdrop-blur-xl border-b border-amber-200/80 shadow-md text-slate-900'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center space-x-3">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform shadow-lg ${
                                    isDark
                                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-amber-500/10'
                                        : 'bg-amber-600/10 border border-amber-600/30 text-amber-700 shadow-amber-600/10'
                                }`}
                            >
                                ✝
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-base font-bold tracking-tight flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Digital Church OS <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                                </span>
                                <span className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}>
                                    Global Sanctuary
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`font-semibold transition-all duration-200 text-xs tracking-wider uppercase py-1 ${
                                    isDark
                                        ? 'text-slate-300 hover:text-amber-400'
                                        : 'text-slate-800 hover:text-amber-700 font-bold'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Theme Toggle & Session Controls */}
                    <div className="hidden md:flex items-center space-x-3">
                        <ThemeToggle />

                        {session ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className={`flex items-center space-x-2 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                                        isDark
                                            ? 'text-slate-200 hover:text-amber-400 bg-slate-900 border-slate-800'
                                            : 'text-slate-800 hover:text-amber-700 bg-white border-amber-200'
                                    }`}
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
                                            className={`absolute right-0 mt-2 w-48 border rounded-2xl shadow-2xl py-2 z-50 text-xs ${
                                                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-amber-200'
                                            }`}
                                        >
                                            <Link
                                                href="/profile"
                                                className={`flex items-center space-x-2 px-4 py-2 ${
                                                    isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-amber-50 hover:text-slate-900'
                                                }`}
                                            >
                                                <User className="w-4 h-4" />
                                                <span>My Profile</span>
                                            </Link>
                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className={`flex items-center space-x-2 px-4 py-2 font-bold ${
                                                        isDark ? 'text-amber-400 hover:bg-slate-800' : 'text-amber-700 hover:bg-amber-50'
                                                    }`}
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => signOut()}
                                                className={`w-full flex items-center space-x-2 px-4 py-2 text-rose-500 hover:bg-slate-800 text-left`}
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
                                className={`px-5 py-2 font-bold text-xs rounded-xl transition-all shadow-md ${
                                    isDark
                                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                                }`}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Controls */}
                    <div className="lg:hidden flex items-center space-x-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`p-2 focus:outline-none ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
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
                        className={`lg:hidden px-4 pt-2 pb-6 space-y-2 text-xs font-semibold border-t ${
                            isDark ? 'bg-slate-900 border-slate-800' : 'bg-amber-50 border-amber-200'
                        }`}
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`block py-2 border-b ${
                                    isDark
                                        ? 'text-slate-300 hover:text-amber-400 border-slate-800/50'
                                        : 'text-slate-800 hover:text-amber-700 border-amber-200/50'
                                }`}
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
