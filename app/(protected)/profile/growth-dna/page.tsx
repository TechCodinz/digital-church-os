'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    HeartHandshake,
    Moon,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Sun,
} from 'lucide-react';
import Link from 'next/link';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

type FormationProfile = {
    focusTheme?: string;
    formationObservation?: string;
    personalizedDailyRhythm?: {
        morningFocus?: string;
        scriptureReflection?: string;
        eveningReflection?: string;
    };
    nextPractice?: string;
    careNote?: string;
};

export default function SpiritualGrowthJourneyPage() {
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<FormationProfile | null>(null);
    const [completed, setCompleted] = useState<Record<string, boolean>>({ morning: false, scripture: false, evening: false });

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const loadFormation = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/ai/spiritual/adaptive-learn', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recentRhythmDays: 0,
                        favoriteTopics: ['Peace', 'Faith', 'Prayer'],
                        preferredStudyDepth: 3,
                    }),
                });
                if (!response.ok) throw new Error('Formation assistant unavailable');
                setProfile(await response.json());
            } catch {
                setProfile({
                    focusTheme: 'A gentle return',
                    formationObservation: 'A meaningful spiritual rhythm can begin with one honest practice. This page does not score holiness, faithfulness, or closeness to God.',
                    personalizedDailyRhythm: {
                        morningFocus: 'Begin with two quiet minutes of prayer before notifications.',
                        scriptureReflection: 'Read Philippians 4:4–9 slowly and record one observation before applying it.',
                        eveningReflection: 'Journal one gratitude, one burden, and one person you want to remember in prayer.',
                    },
                    nextPractice: 'Choose one practice that feels meaningful today. Repetition can support formation, but it does not earn spiritual rank.',
                    careNote: 'For personal spiritual direction or sensitive concerns, choose accountable human pastoral care.',
                });
            } finally {
                setLoading(false);
            }
        };

        loadFormation();
    }, []);

    const activeTheme = mounted ? theme : 'emerald';
    const isLight = activeTheme === 'light';

    const practices = [
        { key: 'morning', title: 'Morning stillness', icon: Sun, copy: profile?.personalizedDailyRhythm?.morningFocus },
        { key: 'scripture', title: 'Scripture reflection', icon: BookOpen, copy: profile?.personalizedDailyRhythm?.scriptureReflection },
        { key: 'evening', title: 'Evening reflection', icon: Moon, copy: profile?.personalizedDailyRhythm?.eveningReflection },
    ];

    return (
        <div className={`sanctuary-page-shell pt-24 pb-24 ${isLight ? 'bg-[#f8f3eb]/92 text-stone-900' : 'bg-[#020807]/90 text-white'}`}>
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] px-6 py-10 sm:px-10 sm:py-12 text-white shadow-2xl">
                    <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                    <div className="relative grid lg:grid-cols-[1fr_0.82fr] gap-10 items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/7 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-emerald-200">
                                <Sparkles className="h-3.5 w-3.5" /> Private formation journey
                            </div>
                            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">Notice patterns. Practice faithfully. Never reduce faith to a score.</h1>
                            <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-400">
                                This space helps you notice rhythms in prayer, Scripture, reflection, community, and service. It does not classify spiritual maturity, divine favor, holiness, or closeness to God.
                            </p>
                        </div>
                        <div className="rounded-3xl border border-amber-300/14 bg-amber-300/[0.035] p-6">
                            <ShieldCheck className="h-5 w-5 text-amber-300" />
                            <h2 className="mt-4 text-lg font-semibold">Descriptive, not judgmental</h2>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">Your activity can help personalize suggestions, but attendance, giving, prayer counts, streaks, and completed habits are never a holiness leaderboard.</p>
                        </div>
                    </div>
                </section>

                {loading ? (
                    <div className="py-24 text-center">
                        <RefreshCw className={`mx-auto h-7 w-7 animate-spin ${isLight ? 'text-sage-700' : 'text-emerald-300'}`} />
                        <p className={`mt-4 text-xs ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Preparing a private formation reflection…</p>
                    </div>
                ) : profile ? (
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
                        <section className={`rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-stone-200 bg-white/85 shadow-xl shadow-stone-200/20' : 'border-white/8 bg-white/[0.035]'}`}>
                            <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Current focus</p>
                            <h2 className={`mt-4 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>{profile.focusTheme || 'A meaningful rhythm'}</h2>
                            <p className={`mt-4 text-sm leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{profile.formationObservation}</p>
                        </section>

                        <section>
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                                <div>
                                    <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Today’s rhythm</p>
                                    <h2 className={`mt-3 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Three optional practices</h2>
                                </div>
                                <p className={`text-xs ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>{Object.values(completed).filter(Boolean).length} marked for your own continuity — not a score</p>
                            </div>

                            <div className="mt-6 grid lg:grid-cols-3 gap-4">
                                {practices.map((practice) => {
                                    const Icon = practice.icon;
                                    const isDone = completed[practice.key];
                                    return (
                                        <button
                                            key={practice.key}
                                            type="button"
                                            onClick={() => setCompleted((previous) => ({ ...previous, [practice.key]: !previous[practice.key] }))}
                                            className={`sacred-focus-ring group rounded-3xl border p-6 text-left transition-all ${isDone ? isLight ? 'border-sage-300 bg-sage-50' : 'border-emerald-300/22 bg-emerald-300/[0.055]' : isLight ? 'border-stone-200 bg-white/80 hover:border-sage-300' : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.055]'}`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${isLight ? 'bg-[#fbf8f3] text-sage-700' : 'bg-white/[0.04] text-amber-300'}`}><Icon className="h-4 w-4" /></span>
                                                <CheckCircle2 className={`h-5 w-5 ${isDone ? isLight ? 'text-sage-700' : 'text-emerald-300' : isLight ? 'text-stone-200' : 'text-slate-700'}`} />
                                            </div>
                                            <h3 className={`mt-5 text-base font-semibold ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>{practice.title}</h3>
                                            <p className={`mt-3 text-xs leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>{practice.copy}</p>
                                            <p className={`mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] ${isDone ? isLight ? 'text-sage-700' : 'text-emerald-300' : isLight ? 'text-stone-400' : 'text-slate-600'}`}>{isDone ? 'Marked for today' : 'Mark for yourself'}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5">
                            <div className={`rounded-3xl border p-6 sm:p-7 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.035]'}`}>
                                <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>A possible next practice</p>
                                <p className={`mt-4 text-sm leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{profile.nextPractice}</p>
                                <Link href="/scripture/immersion" className={`mt-6 inline-flex items-center gap-2 text-xs font-bold ${isLight ? 'text-sage-700' : 'text-amber-300'}`}>Continue in Scripture <ArrowRight className="h-3.5 w-3.5" /></Link>
                            </div>
                            <Link href="/pastoral/hub" className="sacred-panel-dark group block p-6 sm:p-7 text-white">
                                <HeartHandshake className="h-5 w-5 text-amber-300" />
                                <h3 className="mt-4 text-lg font-semibold">Human spiritual direction</h3>
                                <p className="mt-2 text-xs leading-relaxed text-slate-500">{profile.careNote || 'For personal spiritual direction, choose accountable human pastoral care.'}</p>
                                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-amber-300">Open Pastoral Care <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" /></span>
                            </Link>
                        </section>
                    </motion.div>
                ) : null}
            </div>
        </div>
    );
}
