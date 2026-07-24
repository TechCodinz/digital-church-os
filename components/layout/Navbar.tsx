'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import {
    Menu, X, User, LogOut, ChevronDown, Shield, Sparkles,
    Heart, Flame, Moon, BookOpen, Activity, Compass, Users,
    Globe, Building2, Music, GraduationCap, DollarSign, Radio, Feather
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const Navbar = () => {
    const { data: session } = useSession();
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdowns on click outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setActiveDropdown(null);
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const isAdmin = (session?.user as any)?.role === 'CHURCH_ADMIN';
    const activeTheme = mounted ? theme : 'light';
    const isLight = activeTheme === 'light';

    // Structured Navigation Categories
    const navCategories = [
        {
            id: 'growth',
            label: 'Spiritual Growth',
            items: [
                { name: 'Family Altar', href: '/family/devotional', desc: 'Family peace guide & worry patterns', icon: Heart },
                { name: 'Fasting Companion', href: '/spiritual/fasting', desc: 'Hour-by-hour Isaiah 58 coaching', icon: Flame },
                { name: 'Dream Discernment', href: '/spiritual/dreams', desc: 'Biblical symbol & 1 John 4 testing', icon: Moon },
                { name: 'Growth DNA', href: '/profile/growth-dna', desc: 'Adaptive AI maturity index (1-100)', icon: Activity },
                { name: 'Scripture Immersion', href: '/scripture/immersion', desc: 'Exegetical depth & audio memorization', icon: BookOpen },
            ]
        },
        {
            id: 'ministry',
            label: 'Ministry & Worship',
            items: [
                { name: 'Minister Portal', href: '/minister/onboard', desc: 'Multi-denominational evangelical hub', icon: Compass },
                { name: 'Pastoral Hub', href: '/pastoral/hub', desc: 'AI triage & human escalation', icon: Shield },
                { name: 'Sunday School', href: '/children/sunday-school', desc: 'Interactive lessons & stories for kids', icon: GraduationCap },
                { name: 'Denominations', href: '/worship/traditions', desc: 'Tailored worship traditions & liturgies', icon: Building2 },
                { name: 'Choir Studio', href: '/choir/studio', desc: 'AI music composition & multi-part vocals', icon: Music },
            ]
        },
        {
            id: 'community',
            label: 'Global Community',
            items: [
                { name: 'Global Network', href: '/churches', desc: 'Explore churches & live streams worldwide', icon: Globe },
                { name: 'Prayer Watch', href: '/prayer-watch', desc: '24/7 continuous global intercession wall', icon: Radio },
                { name: 'Give & Offering', href: '/offering', desc: 'Unified gateway & transparency ledger', icon: DollarSign },
                { name: 'Community Wall', href: '/community-wall', desc: 'Share testimony & pray for believers', icon: Users },
            ]
        }
    ];

    return (
        <nav
            ref={dropdownRef}
            className={`fixed w-full z-50 transition-colors duration-300 border-b ${
                isLight
                    ? 'bg-cream-50/95 backdrop-blur-xl border-cream-200/80 text-stone-800 shadow-md'
                    : activeTheme === 'emerald'
                    ? 'bg-slate-950/90 backdrop-blur-xl border-emerald-500/30 text-white shadow-2xl'
                    : 'bg-slate-950/90 backdrop-blur-xl border-slate-800 text-white shadow-2xl'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo with Holy Spirit Dove Badge */}
                    <div className="flex items-center shrink-0">
                        <Link href="/" className="flex items-center space-x-2.5 group">
                            <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform shadow-lg ${
                                    isLight
                                        ? 'bg-sage-500/20 border border-sage-300 text-sage-700'
                                        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                }`}
                            >
                                ✝
                            </div>
                            <div className="flex items-center space-x-2 whitespace-nowrap">
                                <span className={`text-base font-extrabold tracking-tight ${isLight ? 'text-stone-800' : 'text-white'}`}>
                                    Digital Church OS
                                </span>
                                {/* Holy Spirit Dove Badge */}
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border shadow-sm ${
                                    isLight
                                        ? 'bg-sage-100 text-sage-800 border-sage-300'
                                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                }`}>
                                    <Feather className="w-3 h-3 text-sage-600 dark:text-emerald-400" />
                                    <span>Holy Spirit</span>
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Categorized Desktop Navigation Dropdowns */}
                    <div className="hidden lg:flex items-center space-x-6">
                        <Link
                            href="/"
                            className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                                isLight ? 'text-stone-700 hover:text-sage-600' : 'text-slate-200 hover:text-emerald-400'
                            }`}
                        >
                            Home
                        </Link>

                        {navCategories.map((cat) => {
                            const isCatOpen = activeDropdown === cat.id;
                            return (
                                <div key={cat.id} className="relative">
                                    <button
                                        onClick={() => setActiveDropdown(isCatOpen ? null : cat.id)}
                                        onMouseEnter={() => setActiveDropdown(cat.id)}
                                        className={`flex items-center space-x-1 text-xs font-bold uppercase tracking-wider py-2 transition-colors ${
                                            isCatOpen
                                                ? isLight ? 'text-sage-600' : 'text-emerald-400'
                                                : isLight ? 'text-stone-700 hover:text-sage-600' : 'text-slate-200 hover:text-emerald-400'
                                        }`}
                                    >
                                        <span>{cat.label}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isCatOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                onMouseLeave={() => setActiveDropdown(null)}
                                                className={`absolute left-0 mt-2 w-72 rounded-2xl p-3 border shadow-2xl z-50 ${
                                                    isLight ? 'bg-cream-50 border-cream-200 text-stone-800' : 'bg-slate-900 border-slate-800 text-white'
                                                }`}
                                            >
                                                <div className="space-y-1">
                                                    {cat.items.map((item) => {
                                                        const Icon = item.icon;
                                                        return (
                                                            <Link
                                                                key={item.name}
                                                                href={item.href}
                                                                onClick={() => setActiveDropdown(null)}
                                                                className={`flex items-start space-x-3 p-2.5 rounded-xl transition-all ${
                                                                    isLight ? 'hover:bg-cream-100 text-stone-800' : 'hover:bg-slate-800/80 text-slate-200'
                                                                }`}
                                                            >
                                                                <div className={`p-2 rounded-lg shrink-0 ${
                                                                    isLight ? 'bg-sage-100 text-sage-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                                                }`}>
                                                                    <Icon className="w-4 h-4" />
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <div className="text-xs font-bold">{item.name}</div>
                                                                    <div className={`text-[10px] leading-tight ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                                                                        {item.desc}
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Controls */}
                    <div className="hidden md:flex items-center space-x-3">
                        <ThemeToggle />

                        {session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className={`flex items-center space-x-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                                        isLight
                                            ? 'text-stone-800 hover:text-sage-600 bg-cream-100 border-cream-200 shadow-sm'
                                            : 'text-slate-200 hover:text-emerald-400 bg-slate-900 border-slate-800'
                                    }`}
                                >
                                    <div className="w-6 h-6 rounded-full bg-sage-600 text-white flex items-center justify-center text-xs font-bold">
                                        {session.user?.name?.[0] || 'U'}
                                    </div>
                                    <span>{session.user?.name || 'Believer'}</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </button>

                                <AnimatePresence>
                                    {userDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            className={`absolute right-0 mt-2 w-48 border rounded-2xl shadow-2xl py-2 z-50 text-xs ${
                                                isLight ? 'bg-cream-50 border-cream-200 text-stone-800' : 'bg-slate-900 border-slate-800 text-white'
                                            }`}
                                        >
                                            <Link
                                                href="/profile"
                                                className={`flex items-center space-x-2 px-4 py-2 ${
                                                    isLight ? 'text-stone-700 hover:bg-cream-100' : 'text-slate-300 hover:bg-slate-800'
                                                }`}
                                            >
                                                <User className="w-4 h-4" />
                                                <span>My Profile</span>
                                            </Link>
                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className={`flex items-center space-x-2 px-4 py-2 font-bold ${
                                                        isLight ? 'text-sage-700 hover:bg-cream-100' : 'text-emerald-400 hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => signOut()}
                                                className="w-full flex items-center space-x-2 px-4 py-2 text-rose-500 hover:bg-slate-800 text-left"
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
                                    isLight
                                        ? 'bg-sage-600 hover:bg-sage-700 text-white shadow-sage-600/20'
                                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                                }`}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center space-x-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`p-2 focus:outline-none ${isLight ? 'text-stone-800 hover:text-sage-600' : 'text-slate-300 hover:text-white'}`}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Accordion Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`lg:hidden px-4 pt-2 pb-6 space-y-4 text-xs border-t overflow-y-auto max-h-[80vh] ${
                            isLight ? 'bg-cream-50 border-cream-200 text-stone-800' : 'bg-slate-900 border-slate-800 text-white'
                        }`}
                    >
                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className="block font-bold text-sm py-2 border-b border-cream-200/60"
                        >
                            Home
                        </Link>

                        {navCategories.map((cat) => (
                            <div key={cat.id} className="space-y-2">
                                <div className={`font-mono text-[10px] uppercase font-bold tracking-widest ${
                                    isLight ? 'text-sage-700' : 'text-emerald-400'
                                }`}>
                                    {cat.label}
                                </div>
                                <div className="pl-2 space-y-1 border-l-2 border-sage-300/50">
                                    {cat.items.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`block py-1.5 font-medium ${
                                                isLight ? 'text-stone-700 hover:text-sage-600' : 'text-slate-300 hover:text-white'
                                            }`}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
