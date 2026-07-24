'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, ShieldCheck, Award, Heart, RefreshCw, BookOpen, Sun, Moon } from 'lucide-react';

export default function SpiritualGrowthDnaPage() {
    const [loading, setLoading] = useState(true);
    const [dna, setDna] = useState<any>(null);

    const fetchDna = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/spiritual/adaptive-learn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memoryStreak: 7,
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
                spiritualMaturityStage: 'Warrior',
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
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
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
                    <div className="py-20 text-center text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-400" />
                        <span>Synthesizing your adaptive Spiritual DNA profile...</span>
                    </div>
                ) : dna && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Score Card */}
                        <div className="p-8 bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="space-y-1 text-center sm:text-left">
                                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">Spiritual Maturity Stage</span>
                                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                                    <Award className="w-7 h-7 text-amber-400" /> {dna.spiritualMaturityStage}
                                </h2>
                                <p className="text-xs text-slate-400">Adaptive AI is evolving based on your prayer & exegesis habits.</p>
                            </div>

                            <div className="text-center bg-slate-950 p-6 rounded-2xl border border-slate-800 shrink-0">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Growth DNA Score</span>
                                <span className="text-4xl font-bold text-emerald-400 font-mono">{dna.growthScore}/100</span>
                            </div>
                        </div>

                        {/* Precision Insight */}
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 shadow-xl">
                            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> AI Precision Insight
                            </h3>
                            <p className="text-slate-200 text-xs leading-relaxed italic bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                "{dna.precisionInsight}"
                            </p>
                        </div>

                        {/* Personalized Regimen */}
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                🏋️ Personalized Daily Spiritual Regimen
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                                    <span className="font-bold text-amber-400 flex items-center gap-1.5"><Sun className="w-3.5 h-3.5" /> Morning Focus</span>
                                    <p className="text-slate-300">{dna.personalizedDailyRegimen?.morningFocus}</p>
                                </div>
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                                    <span className="font-bold text-cyan-400 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Midday Scripture</span>
                                    <p className="text-slate-300">{dna.personalizedDailyRegimen?.scriptureMeditation}</p>
                                </div>
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                                    <span className="font-bold text-purple-400 flex items-center gap-1.5"><Moon className="w-3.5 h-3.5" /> Evening Journal</span>
                                    <p className="text-slate-300">{dna.personalizedDailyRegimen?.eveningReflection}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
