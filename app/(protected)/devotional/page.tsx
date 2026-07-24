'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, BookOpen, Heart, Sparkles, RefreshCw } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

export default function DailyDevotionalPage() {
    const [devotional, setDevotional] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [topic, setTopic] = useState('Unshakeable Peace & Wisdom');

    const fetchDevotional = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/devotional', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ focusTopic: topic }),
            });
            const data = await res.json();
            setDevotional(data);
        } catch {
            setDevotional({
                title: 'Morning Light: Divine Guidance',
                scriptureVerse: 'Proverbs 3:5-6 — Trust in the LORD with all your heart...',
                reflection: 'God leads those who trust Him completely.',
                morningPrayer: 'Lord, guide my paths today.',
                audioNarrativeScript: 'Good morning. Trust in the Lord with all your heart today.',
                actionChallenge: 'Take 3 deep breaths and offer a prayer of gratitude.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevotional();
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-950 text-slate-100">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-xl">
                        <Sun className="w-8 h-8 animate-spin-slow" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Daily Audio Devotional</h1>
                    <p className="text-slate-400 text-sm">Personalized 3-minute morning audio reflection & prayer</p>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-400" />
                        <span>Synthesizing your personalized daily audio devotional...</span>
                    </div>
                ) : devotional && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Audio Player Component */}
                        <div className="p-6 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-3xl shadow-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">Today's Audio Broadcast</span>
                                <button onClick={fetchDevotional} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                                </button>
                            </div>
                            <h2 className="text-2xl font-bold text-white">{devotional.title}</h2>
                            <VoicePlayer
                                text={devotional.audioNarrativeScript || devotional.reflection}
                                context="pastoral"
                                label="Play 3-Min Morning Audio Devotional"
                            />
                        </div>

                        {/* Scripture Focus */}
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Scripture Focus
                            </h3>
                            <p className="text-slate-200 text-base italic leading-relaxed">
                                "{devotional.scriptureVerse}"
                            </p>
                        </div>

                        {/* Pastoral Reflection */}
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Morning Reflection
                            </h3>
                            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                {devotional.reflection}
                            </div>
                        </div>

                        {/* Morning Prayer & Challenge */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                                    <Heart className="w-4 h-4" /> Morning Prayer
                                </h3>
                                <p className="text-slate-200 text-sm italic leading-relaxed">
                                    "{devotional.morningPrayer}"
                                </p>
                            </div>

                            <div className="p-6 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                                    🏆 Action Challenge
                                </h3>
                                <p className="text-slate-200 text-sm leading-relaxed">
                                    {devotional.actionChallenge}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
