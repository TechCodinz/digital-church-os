'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';
import { Flame, Sparkles, BookOpen, Volume2, ShieldCheck, Heart, RefreshCw, Clock } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

const FAST_TYPES = [
    'Daniel Fast (Vegetables & Water)',
    '3-Day Esther Fast (Complete Breakthrough)',
    '21-Day Spiritual Warfare Fast',
    'Intermittent Devotional Fast'
];

export default function FastingCompanionPage() {
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);
    const [fastType, setFastType] = useState(FAST_TYPES[0]);
    const [currentHour, setCurrentHour] = useState(14);
    const [intention, setIntention] = useState('Breakthrough, Guidance, & Spiritual Anointing');
    const [loading, setLoading] = useState(false);
    const [guide, setGuide] = useState<any>({
        hourTitle: 'Hour 14: Pressing Past the Flesh into Spiritual Anointing',
        scriptureFocus: 'Isaiah 58:6 — "Is not this the fast that I choose: to loose the bonds of wickedness?"',
        spiritualExhortation: 'As physical hunger arises, let it remind you of your soul’s deeper hunger for the presence of God. You are breaking through barriers right now.',
        hungerConqueringDeclaration: 'My body is the temple of the Holy Spirit. Man does not live by bread alone, but by every word from God’s mouth!',
        healthSafeguardTip: 'Drink plenty of water and rest your mind. If feeling lightheaded, take deep breaths while meditating on Psalm 23.'
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeTheme = mounted ? theme : 'light';
    const isLight = activeTheme === 'light';

    const handleFetchGuide = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/fasting/guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fastType, currentHour, intention })
            });

            const data = await res.json();
            if (data.hourTitle) setGuide(data);
        } catch (err) {
            console.error('Fasting guide error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl border ${
                        isLight ? 'bg-sage-50 border-sage-200 text-sage-600' : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                    }`}>
                        <Flame className="w-8 h-8" />
                    </div>
                    <h1 className={`text-3xl md:text-4xl font-light mb-2 ${isLight ? 'text-stone-800' : 'text-white'}`}>
                        AI Anointed Fasting Companion
                    </h1>
                    <p className={`text-sm ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                        Hour-by-hour scripture coaching, hunger-conquering declarations, & breakthrough tracking (Isaiah 58)
                    </p>
                </div>

                {/* Controls */}
                <div className={`border rounded-3xl p-6 mb-8 space-y-4 ${
                    isLight ? 'bg-white border-cream-200 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-2xl'
                }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                                Fasting Discipline Type
                            </label>
                            <select
                                value={fastType}
                                onChange={e => setFastType(e.target.value)}
                                className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:border-sage-400 ${
                                    isLight ? 'bg-cream-50 border-cream-200 text-stone-800' : 'bg-slate-950 border-slate-800 text-white'
                                }`}
                            >
                                {FAST_TYPES.map(f => (
                                    <option key={f} className={isLight ? 'text-stone-800' : 'text-white'}>{f}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                                Current Fast Hour
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentHour(Math.max(1, currentHour - 1))}
                                    className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
                                        isLight ? 'bg-cream-50 border-cream-200 text-stone-700 hover:bg-cream-100' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                                    }`}
                                >
                                    -
                                </button>
                                <span className={`flex-1 text-center font-mono font-bold text-sm ${isLight ? 'text-sage-600' : 'text-amber-400'}`}>
                                    Hour {currentHour}
                                </span>
                                <button
                                    onClick={() => setCurrentHour(currentHour + 1)}
                                    className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
                                        isLight ? 'bg-cream-50 border-cream-200 text-stone-700 hover:bg-cream-100' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                                    }`}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                            Fasting Intention & Prayer Target
                        </label>
                        <input
                            type="text"
                            value={intention}
                            onChange={e => setIntention(e.target.value)}
                            placeholder="e.g. Breakthrough, Healing, Ministry Anointing..."
                            className={`w-full border rounded-xl p-3 text-xs focus:outline-none ${
                                isLight
                                    ? 'bg-cream-50 border-cream-200 text-stone-800 placeholder-stone-400 focus:border-sage-400'
                                    : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500/50'
                            }`}
                        />
                    </div>

                    <button
                        onClick={handleFetchGuide}
                        disabled={loading}
                        className={`w-full py-3.5 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                            isLight
                                ? 'bg-sage-600 hover:bg-sage-700 text-white shadow-sage-600/20'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        }`}
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        <span>Get Hour {currentHour} Spiritual Coaching</span>
                    </button>
                </div>

                {/* Coaching Result Card */}
                {guide && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 border rounded-3xl space-y-6 ${
                            isLight
                                ? 'bg-white border-cream-200 shadow-sm'
                                : 'bg-slate-900 border-emerald-500/30 shadow-2xl'
                        }`}
                    >
                        <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${isLight ? 'border-cream-100' : 'border-slate-800'}`}>
                            <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-stone-800' : 'text-white'}`}>
                                <Clock className={`w-5 h-5 ${isLight ? 'text-sage-600' : 'text-amber-400'}`} /> {guide.hourTitle}
                            </h2>
                            <VoicePlayer text={`${guide.scriptureFocus}. ${guide.spiritualExhortation}. ${guide.hungerConqueringDeclaration}`} />
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-sage-50/50 border-sage-100' : 'bg-slate-950 border-slate-800'}`}>
                                <h3 className={`font-bold flex items-center gap-2 mb-2 ${isLight ? 'text-sage-700' : 'text-emerald-400'}`}>
                                    <BookOpen className="w-4 h-4" /> Scripture Focus
                                </h3>
                                <p className={`italic font-serif leading-relaxed ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>{guide.scriptureFocus}</p>
                            </div>

                            <div className="space-y-1">
                                <h3 className={`font-bold ${isLight ? 'text-stone-800' : 'text-white'}`}>Spiritual Exhortation</h3>
                                <p className={`leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{guide.spiritualExhortation}</p>
                            </div>

                            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-amber-50/30 border-amber-100' : 'bg-slate-950 border-slate-800'}`}>
                                <h3 className={`font-bold flex items-center gap-2 mb-2 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                                    🔥 Hunger-Conquering Declaration
                                </h3>
                                <p className={`font-bold text-center italic tracking-wide leading-relaxed ${isLight ? 'text-stone-800' : 'text-white'}`}>
                                    "{guide.hungerConqueringDeclaration}"
                                </p>
                            </div>

                            <div className="space-y-1">
                                <h3 className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                                    <ShieldCheck className="w-4 h-4" /> Health & Safeguard Tip
                                </h3>
                                <p className={isLight ? 'text-stone-600' : 'text-slate-400'}>{guide.healthSafeguardTip}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
