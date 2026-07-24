'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Flame, Globe, Users, HeartHandshake, CheckCircle2, Sparkles } from 'lucide-react';

interface WatchSession {
    id: string;
    watchName: string;
    hours: string;
    focus: string;
    activeIntercessorsCount: number;
    scriptureAnchor: string;
}

const PRAYER_WATCHES: WatchSession[] = [
    {
        id: 'w-1',
        watchName: 'Watch 1: Evening Altar Watch',
        hours: '6:00 PM – 9:00 PM',
        focus: 'Family Preservation, Evening Blessings, & Cleansing from Daily Stress',
        activeIntercessorsCount: 1420,
        scriptureAnchor: 'Psalm 141:2 — "Let my prayer be counted as incense before you, and the lifting up of my hands as the evening sacrifice!"'
    },
    {
        id: 'w-2',
        watchName: 'Watch 2: Midnight Intercession Watch',
        hours: '9:00 PM – 12:00 AM',
        focus: 'Deliverance, Prison Chains Shattering, & Protection over Cities',
        activeIntercessorsCount: 2840,
        scriptureAnchor: 'Acts 16:25 — "About midnight Paul and Silas were praying and singing hymns to God, and the prisoners were listening."'
    },
    {
        id: 'w-3',
        watchName: 'Watch 3: Deep Night Warfare Watch',
        hours: '12:00 AM – 3:00 AM',
        focus: 'Overcoming Spiritual Attacks, Breakaway Breakthroughs, & Global Peace',
        activeIntercessorsCount: 3150,
        scriptureAnchor: 'Psalm 119:62 — "At midnight I rise to praise you, because of your righteous rules."'
    },
    {
        id: 'w-4',
        watchName: 'Watch 4: Dawn Victory Watch',
        hours: '3:00 AM – 6:00 AM',
        focus: 'Commanding the Morning, New Mercies, & Resurrection Breakthrough',
        activeIntercessorsCount: 1980,
        scriptureAnchor: 'Job 38:12 — "Have you commanded the morning since your days began, and caused the dawn to know its place?"'
    }
];

export default function GlobalPrayerWatchPage() {
    const [selectedWatch, setSelectedWatch] = useState<WatchSession>(PRAYER_WATCHES[1]);
    const [joinedWatch, setJoinedWatch] = useState(false);

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-rose-400 mb-3">
                        <Globe className="w-4 h-4 animate-spin-slow" /> 24/7 Global Intercession Watch
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Global 24/7 Prayer Watch Wall</h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        Stand in continuous, non-stop intercession with believers across every global timezone across the 4 Biblical Night Watches.
                    </p>
                </div>

                {/* Live Active Intercessors Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1 shadow-xl text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Global Intercessors Online</span>
                        <h3 className="text-3xl font-bold text-rose-400 flex items-center justify-center gap-2">
                            <Flame className="w-6 h-6 animate-pulse" /> 9,390 Active
                        </h3>
                    </div>

                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1 shadow-xl text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Current Active Watch</span>
                        <h3 className="text-2xl font-bold text-amber-400 flex items-center justify-center gap-2">
                            <Clock className="w-5 h-5" /> Watch 2 (Midnight)
                        </h3>
                    </div>

                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1 shadow-xl text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Continuous Watch Streak</span>
                        <h3 className="text-3xl font-bold text-emerald-400 flex items-center justify-center gap-2">
                            <ShieldCheck className="w-6 h-6" /> 365 Days 24/7
                        </h3>
                    </div>
                </div>

                {/* 4 Watch Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {PRAYER_WATCHES.map(w => (
                        <button
                            key={w.id}
                            onClick={() => setSelectedWatch(w)}
                            className={`p-5 rounded-2xl border text-left transition-all ${
                                selectedWatch.id === w.id
                                    ? 'bg-slate-900 border-rose-500/50 shadow-xl ring-1 ring-rose-500/30'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            <span className="text-[10px] font-bold text-rose-400 font-mono block mb-1">{w.hours}</span>
                            <h3 className="font-bold text-sm text-white mb-1">{w.watchName}</h3>
                            <p className="text-xs text-slate-400">{w.activeIntercessorsCount} praying now</p>
                        </button>
                    ))}
                </div>

                {/* Selected Watch Stage */}
                {selectedWatch && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-slate-900 border border-rose-500/30 rounded-3xl space-y-6 shadow-2xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <span className="text-xs uppercase font-mono tracking-widest text-rose-400 font-bold">{selectedWatch.hours}</span>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedWatch.watchName}</h2>
                            </div>

                            <button
                                onClick={() => setJoinedWatch(!joinedWatch)}
                                className={`px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
                                    joinedWatch
                                        ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                                }`}
                            >
                                {joinedWatch ? <CheckCircle2 className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                                <span>{joinedWatch ? 'Standing in Watch Prayer!' : 'Join This Prayer Watch'}</span>
                            </button>
                        </div>

                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-amber-300 font-mono italic">
                            {selectedWatch.scriptureAnchor}
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Watch Intercession Focus</span>
                            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                {selectedWatch.focus}
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
