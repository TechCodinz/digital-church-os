'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, ShieldCheck, Award, Heart, RefreshCw, BookOpen, Sun, Moon, CheckCircle2, Flame, ArrowRight } from 'lucide-react';

export default function SpiritualGrowthDnaPage() {
    const [loading, setLoading] = useState(true);
    const [dna, setDna] = useState<any>(null);
    const [streakDays, setStreakDays] = useState(7);
    const [completedHabits, setCompletedHabits] = useState<Record<string, boolean>>({
        morning: false,
        midday: false,
        evening: false,
    });

    const fetchDna = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/spiritual/adaptive-learn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memoryStreak: streakDays,
                    totalXp: 520,
                    favoriteTopics: ['Unshakeable Peace', 'Covenantal Faith', 'Healing'],
                    preferredExegesisLevel: 4
                })
            });
            const data = await res.json();
            setDna(data);
        } catch {
            setDna({
                growthScore: 88,
                spiritualMaturityStage: 'Warrior Exegete',
                personalizedDailyRegimen: {
                    morningFocus: 'Anchor your mind in Philippians 4:7 before checking notifications.',
                    scriptureMeditation: 'Speak Psalm 23:1 out loud 3 times during lunch.',
                    eveningReflection: 'Write 3 specific answered prayers in your journal.'
                },
                nextLevelBreakthroughChallenge: 'Complete 7 consecutive days of scripture memorization to unlock Level 5 Exegesis.',
                precisionInsight: 'Your spirit thrives when combining deep word study with intentional morning silence.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDna();
    }, [streakDays]);

    const toggleHabit = (key: string) => {
        setCompletedHabits(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="min-h-screen pt-24 pb-16 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-xl">
                        <Activity className="w-8 h-8 animate-pulse" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Self-Learning Spiritual Growth DNA</h1>
                    <p className="text-slate-400 text-sm">Evolving AI spiritual intelligence tailored for maximum precision & life transformation</p>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
                        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                        <span className="text-xs font-mono">Analyzing Spiritual DNA Patterns...</span>
                    </div>
                ) : dna && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Score Hero Card */}
                        <div className="p-8 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-2 text-center md:text-left">
                                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">Maturity Classification</span>
                                <h2 className="text-3xl font-extrabold text-white">{dna.spiritualMaturityStage}</h2>
                                <p className="text-xs text-slate-300 max-w-md">{dna.precisionInsight}</p>
                            </div>

                            <div className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-3xl min-w-[140px] text-center shadow-inner">
                                <span className="text-4xl font-extrabold text-emerald-400">{dna.growthScore}</span>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-1">Growth Index</span>
                            </div>
                        </div>

                        {/* Interactive Daily Regimen Checklists */}
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Sun className="w-4 h-4 text-amber-400" /> Today's Adaptive Spiritual Regimen
                                </h3>
                                <span className="text-xs font-mono text-emerald-400 font-bold">
                                    {Object.values(completedHabits).filter(Boolean).length} / 3 Completed
                                </span>
                            </div>

                            <div className="space-y-3">
                                {/* Morning */}
                                <div
                                    onClick={() => toggleHabit('morning')}
                                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-4 ${
                                        completedHabits.morning ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="space-y-1">
                                        <span className="font-bold text-amber-300 flex items-center gap-1.5">
                                            <Sun className="w-3.5 h-3.5" /> Morning Focus
                                        </span>
                                        <p className="text-slate-300">{dna.personalizedDailyRegimen?.morningFocus}</p>
                                    </div>
                                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${completedHabits.morning ? 'text-emerald-400' : 'text-slate-700'}`} />
                                </div>

                                {/* Midday */}
                                <div
                                    onClick={() => toggleHabit('midday')}
                                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-4 ${
                                        completedHabits.midday ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="space-y-1">
                                        <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                                            <BookOpen className="w-3.5 h-3.5" /> Midday Scripture Meditation
                                        </span>
                                        <p className="text-slate-300">{dna.personalizedDailyRegimen?.scriptureMeditation}</p>
                                    </div>
                                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${completedHabits.midday ? 'text-emerald-400' : 'text-slate-700'}`} />
                                </div>

                                {/* Evening */}
                                <div
                                    onClick={() => toggleHabit('evening')}
                                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-4 ${
                                        completedHabits.evening ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="space-y-1">
                                        <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                                            <Moon className="w-3.5 h-3.5" /> Evening Journal Reflection
                                        </span>
                                        <p className="text-slate-300">{dna.personalizedDailyRegimen?.eveningReflection}</p>
                                    </div>
                                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${completedHabits.evening ? 'text-emerald-400' : 'text-slate-700'}`} />
                                </div>
                            </div>
                        </div>

                        {/* Challenge Banner */}
                        <div className="p-6 bg-slate-900 border border-emerald-500/30 rounded-3xl space-y-2 text-xs shadow-xl">
                            <span className="font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                                <Flame className="w-4 h-4 text-amber-400" /> Next Spiritual Breakthrough Target
                            </span>
                            <p className="text-slate-300 leading-relaxed">{dna.nextLevelBreakthroughChallenge}</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
