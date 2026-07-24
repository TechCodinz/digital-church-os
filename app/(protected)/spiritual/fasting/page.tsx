'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, BookOpen, Volume2, ShieldCheck, Heart, RefreshCw, Clock } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

const FAST_TYPES = [
    'Daniel Fast (Vegetables & Water)',
    '3-Day Esther Fast (Complete Breakthrough)',
    '21-Day Spiritual Warfare Fast',
    'Intermittent Devotional Fast'
];

export default function FastingCompanionPage() {
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
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-xl">
                        <Flame className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">AI Anointed Fasting Companion</h1>
                    <p className="text-slate-400 text-sm">Hour-by-hour scripture coaching, hunger-conquering declarations, & breakthrough tracking (Isaiah 58)</p>
                </div>

                {/* Controls */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl mb-8 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fasting Discipline Type</label>
                            <select
                                value={fastType}
                                onChange={e => setFastType(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                            >
                                {FAST_TYPES.map(f => (
                                    <option key={f}>{f}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Fast Hour</label>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentHour(Math.max(1, currentHour - 1))} className="px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs">-</button>
                                <span className="flex-1 text-center font-mono font-bold text-amber-400 text-sm">Hour {currentHour}</span>
                                <button onClick={() => setCurrentHour(currentHour + 1)} className="px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs">+</button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fasting Intention & Prayer Target</label>
                        <input
                            type="text"
                            value={intention}
                            onChange={e => setIntention(e.target.value)}
                            placeholder="e.g. Breakthrough, Healing, Ministry Anointing..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                        />
                    </div>

                    <button
                        onClick={handleFetchGuide}
                        disabled={loading}
                        className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        <span>Get Hour {currentHour} Spiritual Coaching</span>
                    </button>
                </div>

                {/* Coaching Result Card */}
                {guide && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-900 border border-amber-500/30 rounded-3xl space-y-6 shadow-2xl">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-400" /> {guide.hourTitle}
                            </h2>
                            <span className="text-xs font-mono text-amber-300 font-bold">📖 {guide.scriptureFocus}</span>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spiritual Exhortation</span>
                            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                {guide.spiritualExhortation}
                            </p>
                        </div>

                        <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-1">
                            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Hunger-Conquering Declaration</span>
                            <p className="text-sm font-semibold text-amber-200">"{guide.hungerConqueringDeclaration}"</p>
                        </div>

                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span><strong>Health Tip:</strong> {guide.healthSafeguardTip}</span>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <VoicePlayer text={guide.spiritualExhortation} context="pastoral" label="Listen Hour Meditation" compact />
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
