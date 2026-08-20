'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';
import { Sun, BookOpen, Heart, Sparkles, RefreshCw } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';
import { ScriptureText } from '@/components/scripture/ScriptureReference';
import { ShareButton } from '@/components/sharing/ShareButton';

export default function DailyDevotionalPage() {
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);
    const [devotional, setDevotional] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [topic, setTopic] = useState('Unshakeable Peace & Wisdom');

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeTheme = mounted ? theme : 'light';
    const isLight = activeTheme === 'light';

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
        <div className="min-h-screen pt-24 pb-12 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-10">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl border ${
                        isLight ? 'bg-sage-50 border-sage-200 text-sage-600' : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                    }`}>
                        <Sun className="w-8 h-8 animate-spin-slow" />
                    </div>
                    <h1 className={`text-3xl md:text-4xl font-light mb-2 ${isLight ? 'text-stone-800' : 'text-white'}`}>Daily Audio Devotional</h1>
                    <p className={`text-sm ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>Personalized 3-minute morning audio reflection & prayer</p>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className={`w-8 h-8 animate-spin mx-auto mb-3 ${isLight ? 'text-sage-500' : 'text-amber-400'}`} />
                        <span className={isLight ? 'text-stone-500' : 'text-slate-400'}>Synthesizing your personalized daily audio devotional...</span>
                    </div>
                ) : devotional && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Audio Player Component */}
                        <div className={`p-6 border rounded-3xl shadow-xl space-y-4 ${
                            isLight
                                ? 'bg-white border-cream-200 text-stone-800'
                                : 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border-amber-500/30 shadow-2xl'
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs uppercase font-mono tracking-widest font-bold ${isLight ? 'text-sage-700' : 'text-amber-400'}`}>Today's Audio Broadcast</span>
                                <div className="flex items-center gap-4">
                                    <ShareButton
                                        kind="devotional"
                                        title={devotional.title}
                                        text={devotional.reflection}
                                        reference={(devotional.scriptureVerse || '').split(/[—–-]/)[0].trim()}
                                        compact
                                        className={`inline-flex items-center gap-1.5 text-xs ${isLight ? 'text-stone-500 hover:text-sage-600' : 'text-slate-400 hover:text-white'}`}
                                    />
                                    <button onClick={fetchDevotional} className={`text-xs flex items-center gap-1 ${isLight ? 'text-stone-500 hover:text-sage-600' : 'text-slate-400 hover:text-white'}`}>
                                        <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                                    </button>
                                </div>
                            </div>
                            <h2 className={`text-2xl font-bold ${isLight ? 'text-stone-800' : 'text-white'}`}>{devotional.title}</h2>
                            <VoicePlayer
                                text={devotional.audioNarrativeScript || devotional.reflection}
                                context="pastoral"
                                label="Play 3-Min Morning Audio Devotional"
                            />
                        </div>

                        {/* Scripture Focus */}
                        <div className={`p-6 border rounded-2xl space-y-2 ${
                            isLight ? 'bg-white border-cream-200' : 'bg-slate-900 border-slate-800'
                        }`}>
                            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-sage-700' : 'text-amber-400'}`}>
                                <BookOpen className="w-4 h-4" /> Scripture Focus
                            </h3>
                            <p className={`text-base italic leading-relaxed ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>
                                "<ScriptureText text={devotional.scriptureVerse} />"
                            </p>
                        </div>

                        {/* Pastoral Reflection */}
                        <div className={`p-6 border rounded-2xl space-y-3 ${
                            isLight ? 'bg-white border-cream-200' : 'bg-slate-900 border-slate-800'
                        }`}>
                            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-sage-700' : 'text-amber-400'}`}>
                                <Sparkles className="w-4 h-4" /> Morning Reflection
                            </h3>
                            <div className={`text-sm leading-relaxed whitespace-pre-line ${isLight ? 'text-stone-600' : 'text-slate-300'}`}>
                                {devotional.reflection}
                            </div>
                        </div>

                        {/* Morning Prayer & Challenge */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`p-6 border rounded-2xl space-y-2 ${
                                isLight ? 'bg-white border-cream-200' : 'bg-amber-950/30 border-amber-500/30'
                            }`}>
                                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-rose-700' : 'text-amber-400'}`}>
                                    <Heart className="w-4 h-4" /> Morning Prayer
                                </h3>
                                <p className={`text-sm italic leading-relaxed ${isLight ? 'text-stone-850' : 'text-slate-200'}`}>
                                    "{devotional.morningPrayer}"
                                </p>
                            </div>

                            <div className={`p-6 border rounded-2xl space-y-2 ${
                                isLight ? 'bg-white border-cream-200' : 'bg-indigo-950/30 border-indigo-500/30'
                            }`}>
                                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-sage-700' : 'text-indigo-400'}`}>
                                    🏆 Action Challenge
                                </h3>
                                <p className={`text-sm leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-200'}`}>
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
