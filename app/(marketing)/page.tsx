'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Sparkles, Globe, Heart, ShieldCheck, Flame, BookOpen, Music, Users, Radio,
    Compass, Activity, ArrowRight, Video, Languages, Layers, Building2, Sun, Moon
} from 'lucide-react';

export default function HomePage() {
    const flagshipModules = [
        {
            icon: Building2,
            title: 'Global Multi-Church Network',
            description: 'Discover local congregations, global live streams, & church onboarding portals worldwide.',
            href: '/churches',
            color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
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
            title: '3D Sanctuary & Holy Land Immersion',
            description: 'Interactive WebGL chapel, global candle wall, & 432 Hz Solfeggio acoustic ambiance.',
            href: '/sanctuary-3d',
            color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            badge: 'WebGL 3D'
        },
        {
            icon: Music,
            title: 'AI Worship Song & Choir Studio',
            description: 'Original worship songwriting with guitar chords, key transposer, & Web Audio synth preview.',
            href: '/choir/studio',
            color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            badge: 'Web Synth'
        },
        {
            icon: Languages,
            title: 'Multilingual Live Sermon Translator',
            description: 'Real-time 50+ language sermon subtitles & native text-to-speech audio stream.',
            href: '/live-service/translate',
            color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            badge: '50+ Languages'
        },
        {
            icon: BookOpen,
            title: 'Sunday School Teacher Studio',
            description: 'Age-tailored lesson plans, object lessons, crafts, & skits for Toddlers, Kids, Youth, & Adults.',
            href: '/children/sunday-school',
            color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            badge: 'All Ages'
        },
        {
            icon: Activity,
            title: 'Self-Learning AI Growth DNA',
            description: 'Evolving spiritual intelligence calculating your Growth DNA Index Score (1-100).',
            href: '/profile/growth-dna',
            color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            badge: 'Adaptive AI'
        },
        {
            icon: Video,
            title: 'Pastoral Sermon Short Reel Studio',
            description: 'Auto-extract 30-second social reel scripts & devotional quote cards from Sunday preaching.',
            href: '/sermon/reels',
            color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            badge: 'Social Studio'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden border-b border-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-amber-500/30 text-xs font-bold text-amber-400 shadow-xl">
                            <Sparkles className="w-4 h-4 animate-pulse text-amber-400" /> The World's First Operating System for the Global Church
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-5xl mx-auto">
                            Empowering Every Believer & Church with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Ultra-Intelligent AI</span>
                        </h1>

                        <p className="text-slate-400 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
                            From 5-Tier exegetical preaching to 24/7 global prayer watches, 3D WebGL sanctuaries, & multi-denominational minister portals — experience deep personal spiritual transformation.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            <Link
                                href="/churches"
                                className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
                            >
                                <span>Explore Global Church Network</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <Link
                                href="/pastoral/hub"
                                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-2xl text-sm transition-all flex items-center gap-2"
                            >
                                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                                <span>Pastoral Care Hub</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Flagship Innovation Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold block mb-2">Architectural Excellence</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">28 Ultra-Intelligent AI Modules</h2>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        Designed with visual elegance, theological precision, & adaptive learning tailored to your spiritual walk.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flagshipModules.map((item, idx) => {
                        const IconComp = item.icon;
                        return (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link
                                    href={item.href}
                                    className="p-6 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl transition-all space-y-4 shadow-xl flex flex-col justify-between h-full group hover:shadow-amber-500/5"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-2xl border ${item.color}`}>
                                                <IconComp className="w-6 h-6" />
                                            </div>
                                            <span className="px-3 py-1 bg-slate-950 text-slate-400 text-[10px] font-mono font-bold rounded-full border border-slate-800">
                                                {item.badge}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                                            {item.title}
                                        </h3>

                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                                        <span>Launch Module</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
