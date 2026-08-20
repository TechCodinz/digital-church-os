'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
    Activity,
    ArrowRight,
    BookOpen,
    Building2,
    ChevronDown,
    Compass,
    Flame,
    Globe,
    Heart,
    LogOut,
    Menu,
    Music,
    Radio,
    Shield,
    Sparkles,
    User,
    Users,
    X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

export const Navbar = () => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);
    const [exploreOpen, setExploreOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        setMobileOpen(false);
        setExploreOpen(false);
        setUserOpen(false);
    }, [pathname]);

    useEffect(() => {
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setExploreOpen(false);
                setUserOpen(false);
            }
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, []);

    const activeTheme = mounted ? theme : 'emerald';
    const isLight = activeTheme === 'light';
    const isAdmin = (session?.user as any)?.role === 'CHURCH_ADMIN';

    const primary = [
        { label: 'Pray', href: '/prayer-room', icon: Heart },
        { label: 'Word', href: '/scripture/immersion', icon: BookOpen },
        { label: 'Worship', href: '/live-service', icon: Radio },
        { label: 'Churches', href: '/churches', icon: Globe },
    ];

    const exploreGroups = [
        {
            label: 'Spiritual life',
            items: [
                { name: 'Family Altar', href: '/family/devotional', desc: 'Private family prayer and devotional rhythm', icon: Heart },
                { name: 'Fasting Companion', href: '/spiritual/fasting', desc: 'Scripture-centered planning and reflection', icon: Flame },
                { name: 'Growth Journey', href: '/profile/growth-dna', desc: 'Private formation patterns and continuity', icon: Activity },
                { name: 'Prayer Watch', href: '/prayer-watch', desc: 'Continuous global intercession', icon: Radio },
            ],
        },
        {
            label: 'Ministry',
            items: [
                { name: 'Pastoral Care', href: '/pastoral/hub', desc: 'AI-assisted triage with human escalation', icon: Shield },
                { name: 'Minister Portal', href: '/minister/onboard', desc: 'Service, care, teaching, and team workspace', icon: Compass },
                { name: 'Choir Studio', href: '/choir/studio', desc: 'Worship preparation and composition tools', icon: Music },
                { name: 'Church Network', href: '/churches', desc: 'Congregations, services, and gatherings', icon: Building2 },
            ],
        },
        {
            label: 'Community',
            items: [
                { name: 'Community Wall', href: '/community-wall', desc: 'Testimony, encouragement, and prayer', icon: Users },
                { name: 'Conferences', href: '/conferences', desc: 'Gatherings and registration', icon: Sparkles },
                { name: 'Give & Offering', href: '/offering', desc: 'Giving and transparency pathways', icon: Heart },
                { name: 'Personal Sanctuary', href: '/dashboard', desc: 'Your private continuity space', icon: User },
            ],
        },
    ];

    const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <nav
            ref={navRef}
            className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
                isLight
                    ? 'border-stone-200/70 bg-[#fbf8f3]/88 text-stone-900 shadow-sm backdrop-blur-2xl'
                    : 'border-white/8 bg-[#030c0a]/88 text-white shadow-2xl shadow-black/20 backdrop-blur-2xl'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between gap-4">
                    <Link href="/" className="sacred-focus-ring group flex shrink-0 items-center gap-3 rounded-2xl">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-lg font-light transition-transform group-hover:scale-105 ${isLight ? 'border-sage-200 bg-white text-sage-700' : 'border-amber-300/18 bg-amber-300/8 text-amber-300'}`}>
                            ✝
                        </span>
                        <span className="hidden sm:block">
                            <span className={`block text-sm font-semibold tracking-tight ${isLight ? 'text-stone-900' : 'text-white'}`}>Digital Church OS</span>
                            <span className={`mt-0.5 block text-[9px] uppercase tracking-[0.21em] ${isLight ? 'text-sage-700' : 'text-amber-300/70'}`}>Living Sanctuary</span>
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-1.5">
                        {primary.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`sacred-focus-ring inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${active ? isLight ? 'bg-sage-100 text-sage-800' : 'bg-emerald-300/10 text-emerald-300' : isLight ? 'text-stone-500 hover:bg-white hover:text-stone-900' : 'text-slate-400 hover:bg-white/[0.045] hover:text-white'}`}
                                >
                                    <Icon className="h-3.5 w-3.5" /> {item.label}
                                </Link>
                            );
                        })}

                        <div className="relative">
                            <button
                                onClick={() => setExploreOpen((value) => !value)}
                                className={`sacred-focus-ring inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${exploreOpen ? isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950' : isLight ? 'text-stone-500 hover:bg-white hover:text-stone-900' : 'text-slate-400 hover:bg-white/[0.045] hover:text-white'}`}
                                aria-expanded={exploreOpen}
                                aria-haspopup="menu"
                            >
                                Explore <ChevronDown className={`h-3.5 w-3.5 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {exploreOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.985 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.985 }}
                                        transition={{ duration: 0.16 }}
                                        className={`absolute left-1/2 top-full mt-4 w-[760px] -translate-x-1/2 rounded-[1.75rem] border p-4 shadow-2xl ${isLight ? 'border-stone-200 bg-[#fffdf9]/98' : 'border-white/10 bg-[#07110f]/98 shadow-black/45'}`}
                                        role="menu"
                                    >
                                        <div className="grid grid-cols-3 gap-3">
                                            {exploreGroups.map((group) => (
                                                <div key={group.label} className={`rounded-2xl border p-3 ${isLight ? 'border-stone-100 bg-[#fbf8f3]' : 'border-white/7 bg-white/[0.025]'}`}>
                                                    <p className={`px-2 pb-2 text-[9px] font-bold uppercase tracking-[0.2em] ${isLight ? 'text-sage-700' : 'text-amber-300/70'}`}>{group.label}</p>
                                                    <div className="space-y-1">
                                                        {group.items.map((item) => {
                                                            const Icon = item.icon;
                                                            return (
                                                                <Link key={item.href} href={item.href} className={`group flex gap-3 rounded-xl p-2.5 transition-all ${isLight ? 'hover:bg-white' : 'hover:bg-white/[0.05]'}`}>
                                                                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isLight ? 'bg-white text-sage-700' : 'bg-white/[0.04] text-emerald-300'}`}>
                                                                        <Icon className="h-3.5 w-3.5" />
                                                                    </span>
                                                                    <span>
                                                                        <span className={`block text-[11px] font-semibold ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>{item.name}</span>
                                                                        <span className={`mt-1 block text-[9px] leading-relaxed ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>{item.desc}</span>
                                                                    </span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className={`mt-3 flex items-center justify-between rounded-2xl border px-4 py-3 ${isLight ? 'border-sage-100 bg-sage-50' : 'border-emerald-300/10 bg-emerald-300/[0.035]'}`}>
                                            <div className="flex items-center gap-2">
                                                <Sparkles className={`h-4 w-4 ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                                                <p className={`text-[10px] ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>Not sure where to go? Open Sanctuary Guide with <span className="font-mono">⌘/Ctrl + K</span>.</p>
                                            </div>
                                            <Link href="/dashboard" className={`inline-flex items-center gap-2 text-[10px] font-bold ${isLight ? 'text-sage-800' : 'text-emerald-300'}`}>My Sanctuary <ArrowRight className="h-3 w-3" /></Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        <div className="hidden md:block">
                            {session ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserOpen((value) => !value)}
                                        className={`sacred-focus-ring flex items-center gap-2 rounded-full border px-2.5 py-2 text-xs font-semibold transition-all ${isLight ? 'border-stone-200 bg-white text-stone-700 hover:border-sage-300' : 'border-white/8 bg-white/[0.035] text-slate-300 hover:border-amber-300/18'}`}
                                        aria-expanded={userOpen}
                                    >
                                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${isLight ? 'bg-sage-100 text-sage-800' : 'bg-emerald-300/10 text-emerald-300'}`}>{session.user?.name?.[0] || 'U'}</span>
                                        <span className="max-w-[110px] truncate">{session.user?.name || 'My Sanctuary'}</span>
                                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {userOpen && (
                                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className={`absolute right-0 mt-3 w-56 rounded-2xl border p-2 shadow-2xl ${isLight ? 'border-stone-200 bg-white' : 'border-white/8 bg-[#07110f]'}`}>
                                                <Link href="/dashboard" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold ${isLight ? 'text-stone-700 hover:bg-stone-50' : 'text-slate-300 hover:bg-white/[0.05]'}`}><Sparkles className="h-4 w-4" /> Personal Sanctuary</Link>
                                                <Link href="/profile" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold ${isLight ? 'text-stone-700 hover:bg-stone-50' : 'text-slate-300 hover:bg-white/[0.05]'}`}><User className="h-4 w-4" /> Profile</Link>
                                                {isAdmin && <Link href="/admin" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold ${isLight ? 'text-amber-700 hover:bg-amber-50' : 'text-amber-300 hover:bg-white/[0.05]'}`}><Shield className="h-4 w-4" /> Church Admin</Link>}
                                                <button onClick={() => signOut()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-rose-500 hover:bg-rose-500/8"><LogOut className="h-4 w-4" /> Sign out</button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link href="/auth/signin" className={`sacred-focus-ring inline-flex min-h-10 items-center rounded-full px-4 text-xs font-bold transition-all ${isLight ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-amber-200 text-slate-950 hover:bg-amber-100'}`}>Enter</Link>
                            )}
                        </div>

                        <button onClick={() => setMobileOpen((value) => !value)} className={`sacred-focus-ring md:hidden flex h-10 w-10 items-center justify-center rounded-xl border ${isLight ? 'border-stone-200 bg-white text-stone-700' : 'border-white/8 bg-white/[0.035] text-slate-300'}`} aria-label="Open navigation" aria-expanded={mobileOpen}>
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={`md:hidden border-t pb-24 ${isLight ? 'border-stone-200 bg-[#fbf8f3]/98' : 'border-white/8 bg-[#030c0a]/98'}`}>
                        <div className="max-w-lg mx-auto px-4 py-5">
                            <p className={`text-[9px] font-bold uppercase tracking-[0.22em] ${isLight ? 'text-sage-700' : 'text-amber-300/70'}`}>Core journeys</p>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {primary.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-2xl border p-3 ${isLight ? 'border-stone-200 bg-white text-stone-700' : 'border-white/8 bg-white/[0.03] text-slate-300'}`}>
                                            <Icon className={`h-4 w-4 ${isLight ? 'text-sage-700' : 'text-emerald-300'}`} />
                                            <span className="text-xs font-semibold">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="mt-6 grid gap-5">
                                {exploreGroups.map((group) => (
                                    <div key={group.label}>
                                        <p className={`text-[9px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>{group.label}</p>
                                        <div className="mt-2 grid gap-1">
                                            {group.items.map((item) => (
                                                <Link key={item.href} href={item.href} className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs ${isLight ? 'text-stone-600 hover:bg-white' : 'text-slate-400 hover:bg-white/[0.04]'}`}>
                                                    {item.name} <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 border-t border-current/10 pt-5">
                                {session ? (
                                    <div className="flex gap-2">
                                        <Link href="/dashboard" className={`flex-1 rounded-full px-4 py-3 text-center text-xs font-bold ${isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950'}`}>My Sanctuary</Link>
                                        <button onClick={() => signOut()} className="rounded-full border border-rose-400/20 px-4 py-3 text-xs font-bold text-rose-500">Sign out</button>
                                    </div>
                                ) : (
                                    <Link href="/auth/signin" className={`block rounded-full px-4 py-3 text-center text-xs font-bold ${isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950'}`}>Sign in</Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
