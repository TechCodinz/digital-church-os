'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';
import { useState, useEffect } from 'react';
import {
    Sparkles, Globe, Heart, ShieldCheck, Flame, BookOpen, Music, Users, Radio,
    Compass, Activity, ArrowRight, Video, Feather, Building2, Moon
} from 'lucide-react';

export default function HomePage() {
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeTheme = mounted ? theme : 'light';
    const isLight = activeTheme === 'light';

    const flagshipModules = [
        {
            icon: Building2,
            title: 'Global Multi-Church Network',
            description: 'Discover local congregations, global live streams, & church onboarding portals worldwide.',
            href: '/churches',
            color: isLight ? 'bg-sage-50 text-sage-600 border-sage-100' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            badge: 'Global Portal'
        },
        {
            icon: ShieldCheck,
            title: 'Pastoral Care & Dynamic Triage Hub',
            description: 'AI Lead Pastor, Prayer Warrior, & Biblical Counselor with 1-click human pastor escalation.',
            href: '/pastoral/hub',
            color: isLight ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            badge: 'AI Triage'
        },
        {
            icon: Heart,
            title: 'Family Devotional Altar & Peace Guide',
            description: 'Record family battles, analyze worry patterns, & receive custom family peace roadmaps.',
            href: '/family/devotional',
            color: isLight ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            badge: 'Family Altar'
        },
        {
            icon: Flame,
            title: 'AI Anointed Fasting Companion',
            description: 'Hour-by-hour scripture coaching, hunger-conquering declarations, & breakthrough tracking.',
            href: '/spiritual/fasting',
            color: isLight ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            badge: 'Isaiah 58'
        },
        {
            icon: Moon,
            title: 'Biblical Dream Discernment',
            description: 'Cross-reference dream symbols with biblical etymology & 1 John 4:1 testing principles.',
            href: '/spiritual/dreams',
            color: isLight ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            badge: 'Acts 2:17'
        },
        {
            icon: Globe,
            title: '24/7 Global Prayer Watch Wall',
            description: 'Stand in continuous intercession across the 4 Biblical Night & Day Watches worldwide.',
            href: '/prayer-watch',
            color: isLight ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            badge: '24/7 Watch'
        },
        {
            icon: Compass,
            title: 'Evangelical Minister Onboarding Portal',
            description: 'Hybrid dynamic intelligence assisting ministers across all Christian denominations.',
            href: '/minister/onboard',
            color: isLight ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            badge: 'Minister Portal'
        },
        {
            icon: BookOpen,
            title: 'Children Sunday School & Interactive Lessons',
            description: 'Gamified Bible story journeys, age-adapted lesson plans, & voice narration.',
            href: '/children/sunday-school',
            color: isLight ? 'bg-sage-50 text-sage-600 border-sage-100' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            badge: 'Sunday School'
        },
        {
            icon: Music,
            title: 'AI Choir & Worship Composition Studio',
            description: 'Compose multi-part choral arrangements, chord progressions, & scripture lyrics.',
            href: '/choir/studio',
            color: isLight ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            badge: 'Worship Studio'
        },
        {
            icon: Activity,
            title: 'Self-Learning Spiritual Growth DNA',
            description: 'Evolving spiritual intelligence calculating your Growth DNA Index Score (1-100).',
            href: '/profile/growth-dna',
            color: isLight ? 'bg-sage-50 text-sage-600 border-sage-100' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            badge: 'Adaptive AI'
        },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isLight ? 'bg-cream-50 text-stone-800' : 'bg-slate-950 text-slate-100'
        }`}>
            {/* Hero Section */}
            <section className={`relative pt-32 pb-20 overflow-hidden border-b ${
                isLight ? 'border-cream-200 bg-gradient-to-b from-cream-100 via-cream-50 to-cream-100' : 'border-slate-800 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-slate-950 to-slate-950'
            }`}>
                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Holy Spirit Anointed Badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border shadow-sm ${
                            isLight
                                ? 'bg-white/90 border-cream-200 text-stone-700'
                                : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 shadow-2xl holy-spirit-glow'
                        }`}>
                            <Feather className={`w-4 h-4 ${isLight ? 'text-sage-600' : 'text-emerald-400 animate-bounce'}`} />
                            <span>A Sanctuary for Digital Worship & Spiritual Community</span>
                        </div>

                        <h1 className={`text-4xl md:text-6xl font-light tracking-tight leading-tight max-w-5xl mx-auto ${
                            isLight ? 'text-stone-800' : 'text-white'
                        }`}>
                            Digital Church OS
                        </h1>

                        <p className={`text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed ${
                            isLight ? 'text-stone-600' : 'text-slate-300'
                        }`}>
                            Empowering every believer & church with ultra-intelligent AI, 5-tier exegetical preaching, 24/7 global prayer watches, & multi-denominational minister portals.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            <Link
                                href="/churches"
                                className={`px-8 py-4 font-medium rounded-full text-sm transition-all shadow-md flex items-center gap-2 ${
                                    isLight
                                        ? 'bg-sage-500 hover:bg-sage-600 text-white shadow-sage-500/20 hover:scale-105'
                                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                                }`}
                            >
                                <span>Explore Global Church Network</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <Link
                                href="/pastoral/hub"
                                className={`px-8 py-4 font-medium rounded-full text-sm transition-all border flex items-center gap-2 ${
                                    isLight
                                        ? 'bg-white/90 border-cream-200 text-stone-700 hover:bg-white shadow-sm'
                                        : 'bg-slate-900/80 border-slate-800 text-white hover:bg-slate-800'
                                }`}
                            >
                                <ShieldCheck className={`w-4 h-4 ${isLight ? 'text-sage-600' : 'text-emerald-400'}`} />
                                <span>Pastoral Care Hub</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Flagship Modules Section */}
            <section className={`py-20 max-w-7xl mx-auto px-4 ${isLight ? 'bg-cream-50' : ''}`}>
                <div className="text-center mb-16 space-y-3">
                    <span className={`text-xs font-mono uppercase font-bold tracking-widest ${
                        isLight ? 'text-sage-600' : 'text-emerald-400'
                    }`}>A Place for Every Soul</span>
                    <h2 className={`text-3xl md:text-4xl font-light ${isLight ? 'text-stone-800' : 'text-white'}`}>
                        Flagship Spiritual & Ministry Modules
                    </h2>
                    <p className={`text-sm max-w-2xl mx-auto ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                        Built with 100% theological precision, strict guardrails, & multi-denominational intelligence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flagshipModules.map((module) => {
                        const Icon = module.icon;
                        return (
                            <Link key={module.title} href={module.href} className="group">
                                <div className={`p-6 rounded-2xl border transition-all h-full flex flex-col justify-between space-y-4 group-hover:-translate-y-1 ${
                                    isLight
                                        ? 'bg-white/90 border-cream-200 shadow-md group-hover:shadow-xl group-hover:border-sage-300'
                                        : 'bg-slate-900/80 border-slate-800/80 group-hover:border-emerald-500/50 shadow-xl'
                                }`}>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className={`p-3 rounded-xl border ${module.color}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                                isLight ? 'bg-cream-100 border-cream-200 text-stone-600' : 'bg-slate-950 border-slate-800 text-slate-400'
                                            }`}>
                                                {module.badge}
                                            </span>
                                        </div>

                                        <h3 className={`text-lg font-medium transition-colors ${
                                            isLight ? 'text-stone-800 group-hover:text-sage-600' : 'text-white group-hover:text-emerald-400'
                                        }`}>
                                            {module.title}
                                        </h3>

                                        <p className={`text-xs leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                                            {module.description}
                                        </p>
                                    </div>

                                    <div className={`flex items-center text-xs font-medium group-hover:translate-x-1 transition-transform gap-1 pt-2 ${
                                        isLight ? 'text-sage-600' : 'text-emerald-400'
                                    }`}>
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
