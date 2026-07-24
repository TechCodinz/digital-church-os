'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';
import { useState, useEffect } from 'react';
import {
    Sparkles, Globe, Heart, ShieldCheck, Flame, BookOpen, Music, Users, Radio,
    Compass, Activity, ArrowRight, Video, Languages, Layers, Building2, Sun, Moon, Feather
} from 'lucide-react';

export default function HomePage() {
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeTheme = mounted ? theme : 'emerald';

    const flagshipModules = [
        {
            icon: Building2,
            title: 'Global Multi-Church Network',
            description: 'Discover local congregations, global live streams, & church onboarding portals worldwide.',
            href: '/churches',
            color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            badge: 'Global Portal'
        },
        {
            icon: ShieldCheck,
            title: 'Pastoral Care & Dynamic Triage Hub',
            description: 'AI Lead Pastor, Prayer Warrior, & Biblical Counselor with 1-click human pastor escalation.',
            href: '/pastoral/hub',
            color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            badge: 'AI Triage'
        },
        {
            icon: Heart,
            title: 'Family Devotional Altar & Peace Guide',
            description: 'Record family battles, analyze worry patterns, & receive custom family peace roadmaps.',
            href: '/family/devotional',
            color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            badge: 'Family Altar'
        },
        {
            icon: Flame,
            title: 'AI Anointed Fasting Companion',
            description: 'Hour-by-hour scripture coaching, hunger-conquering declarations, & breakthrough tracking.',
            href: '/spiritual/fasting',
            color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            badge: 'Isaiah 58'
        },
        {
            icon: Moon,
            title: 'Biblical Dream Discernment',
            description: 'Cross-reference dream symbols with biblical etymology & 1 John 4:1 testing principles.',
            href: '/spiritual/dreams',
            color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            badge: 'Acts 2:17'
        },
        {
            icon: Globe,
            title: '24/7 Global Prayer Watch Wall',
            description: 'Stand in continuous intercession across the 4 Biblical Night & Day Watches worldwide.',
            href: '/prayer-watch',
            color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            badge: '24/7 Watch'
        },
        {
            icon: Compass,
            title: 'Evangelical Minister Onboarding Portal',
            description: 'Hybrid dynamic intelligence assisting ministers across all Christian denominations.',
            href: '/minister/onboard',
            color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            badge: 'Minister Portal'
        },
        {
            icon: BookOpen,
            title: 'Children Sunday School & Interactive Lessons',
            description: 'Gamified Bible story journeys, age-adapted lesson plans, & voice narration.',
            href: '/children/sunday-school',
            color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            badge: 'Sunday School'
        },
        {
            icon: Music,
            title: 'AI Choir & Worship Composition Studio',
            description: 'Compose multi-part choral arrangements, chord progressions, & scripture lyrics.',
            href: '/choir/studio',
            color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            badge: 'Worship Studio'
        },
        {
            icon: Activity,
            title: 'Self-Learning Spiritual Growth DNA',
            description: 'Evolving spiritual intelligence calculating your Growth DNA Index Score (1-100).',
            href: '/profile/growth-dna',
            color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            badge: 'Adaptive AI'
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden border-b border-emerald-500/20">
                {/* Holy Spirit Radiant Glow Ambient background */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-teal-950/20 to-transparent" />

                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Holy Spirit Dove / Anointing Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs font-bold text-emerald-300 shadow-2xl holy-spirit-glow">
                            <Feather className="w-4 h-4 text-emerald-400 animate-bounce" />
                            <span>Holy Spirit Anointed · Operating System for the Global Church</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl mx-auto">
                            Empowering Every Believer & Church with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300">Ultra-Intelligent AI</span>
                        </h1>

                        <p className="text-slate-300 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
                            From 5-Tier exegetical preaching to 24/7 global prayer watches, 3D WebGL sanctuaries, & multi-denominational minister portals — experience deep personal spiritual transformation.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            <Link
                                href="/churches"
                                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/30 flex items-center gap-2"
                            >
                                <span>Explore Global Church Network</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <Link
                                href="/pastoral/hub"
                                className="px-8 py-4 font-bold rounded-2xl text-sm transition-all border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-white flex items-center gap-2 shadow-sm"
                            >
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>Pastoral Care Hub</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Flagship Modules Section */}
            <section className="py-20 max-w-7xl mx-auto px-4">
                <div className="text-center mb-16 space-y-3">
                    <span className="text-xs font-mono uppercase font-bold tracking-widest text-emerald-400">Sacred Living Architecture</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold">
                        Flagship Spiritual & Ministry Modules
                    </h2>
                    <p className="text-sm max-w-2xl mx-auto text-slate-400">
                        Built with 100% theological precision, strict guardrails, & multi-denominational intelligence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flagshipModules.map((module) => {
                        const Icon = module.icon;
                        return (
                            <Link key={module.title} href={module.href} className="group">
                                <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md transition-all h-full flex flex-col justify-between space-y-4 group-hover:-translate-y-1 group-hover:border-emerald-500/50 shadow-xl">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className={`p-3 rounded-2xl border ${module.color}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950 border border-slate-800 text-slate-400">
                                                {module.badge}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold group-hover:text-emerald-400 transition-colors">
                                            {module.title}
                                        </h3>

                                        <p className="text-xs leading-relaxed text-slate-400">
                                            {module.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform gap-1 pt-2">
                                        <span>Launch Module</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
