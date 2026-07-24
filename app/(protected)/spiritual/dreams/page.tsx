'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';
import { Moon, Sparkles, BookOpen, ShieldCheck, RefreshCw, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

export default function BiblicalDreamInterpreterPage() {
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);
    const [dreamText, setDreamText] = useState('');
    const [symbols, setSymbols] = useState('Clean Water, Soaring Eagle');
    const [emotions, setEmotions] = useState('Peaceful & Awe-Filled');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeTheme = mounted ? theme : 'light';
    const isLight = activeTheme === 'light';

    const handleInterpret = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dreamText.trim() || loading) return;

        setLoading(true);
        try {
            const symbolsArray = symbols.split(',').map(s => s.trim()).filter(Boolean);
            const res = await fetch('/api/ai/dreams/interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dreamDescription: dreamText, symbols: symbolsArray, emotions })
            });

            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error('Dream interpretation error:', err);
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
                        isLight ? 'bg-sage-50 border-sage-200 text-sage-600' : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400'
                    }`}>
                        <Moon className="w-8 h-8" />
                    </div>
                    <h1 className={`text-3xl md:text-4xl font-light mb-2 ${isLight ? 'text-stone-800' : 'text-white'}`}>
                        Biblical Dream & Vision Interpreter
                    </h1>
                    <p className={`text-sm ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                        Grounded scriptural discernment of night visions & spiritual impressions (Acts 2:17)
                    </p>
                </div>

                {/* Intake Form */}
                <div className={`border rounded-3xl p-6 shadow-md space-y-4 mb-8 ${
                    isLight ? 'bg-white border-cream-200' : 'bg-slate-900 border-slate-800 shadow-2xl'
                }`}>
                    <form onSubmit={handleInterpret} className="space-y-4">
                        <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>Describe Your Dream / Vision</label>
                            <textarea
                                value={dreamText}
                                onChange={e => setDreamText(e.target.value)}
                                placeholder="Describe what you saw, the setting, and key moments..."
                                rows={4}
                                className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:border-sage-400 ${
                                    isLight ? 'bg-cream-50 border-cream-200 text-stone-800 placeholder-stone-400' : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                                }`}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>Key Symbols / Objects</label>
                                <input
                                    type="text"
                                    value={symbols}
                                    onChange={e => setSymbols(e.target.value)}
                                    placeholder="e.g. River, Eagle, Mountain, Key"
                                    className={`w-full border rounded-xl p-3 text-xs focus:outline-none ${
                                        isLight ? 'bg-cream-50 border-cream-200 text-stone-800' : 'bg-slate-950 border-slate-800 text-white'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>Emotional Atmosphere</label>
                                <input
                                    type="text"
                                    value={emotions}
                                    onChange={e => setEmotions(e.target.value)}
                                    placeholder="e.g. Peaceful, Urgent, Joyful"
                                    className={`w-full border rounded-xl p-3 text-xs focus:outline-none ${
                                        isLight ? 'bg-cream-50 border-cream-200 text-stone-800' : 'bg-slate-950 border-slate-800 text-white'
                                    }`}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !dreamText.trim()}
                            className={`w-full py-3.5 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                                isLight ? 'bg-sage-600 hover:bg-sage-700 text-white shadow-sage-600/20' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            <span>Analyze Through Biblical Discernment</span>
                        </button>
                    </form>
                </div>

                {/* Result Display */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 border rounded-3xl space-y-6 shadow-xl ${
                            isLight ? 'bg-white border-cream-200' : 'bg-slate-900 border-indigo-500/30'
                        }`}
                    >
                        <div className={`border-b pb-3 ${isLight ? 'border-cream-100' : 'border-slate-800'}`}>
                            <span className={`text-xs font-mono uppercase tracking-widest font-bold ${isLight ? 'text-sage-600' : 'text-indigo-400'}`}>Discernment Summary</span>
                            <h2 className={`text-2xl font-bold ${isLight ? 'text-stone-800' : 'text-white'}`}>{result.biblicalTitle}</h2>
                        </div>

                        {/* Lexicon Breakdown */}
                        <div className="space-y-3">
                            <span className={`text-xs font-bold uppercase tracking-wider block ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>Biblical Symbol Lexicon Cross-References</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {result.symbolLexiconBreakdown?.map((item: any, i: number) => (
                                    <div key={i} className={`p-4 border rounded-2xl space-y-1 ${
                                        isLight ? 'bg-cream-50 border-cream-200' : 'bg-slate-950 border-slate-800'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <span className={`font-bold text-xs ${isLight ? 'text-sage-700' : 'text-indigo-300'}`}>{item.symbol}</span>
                                            <span className={`text-[10px] font-semibold font-mono ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>📖 {item.scriptureReference}</span>
                                        </div>
                                        <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{item.biblicalMeaning}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Grounded Interpretation */}
                        <div className="space-y-2">
                            <span className={`text-xs font-bold uppercase tracking-wider block ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>Scriptural Interpretation</span>
                            <p className={`text-xs leading-relaxed p-4 rounded-2xl border ${
                                isLight ? 'bg-cream-50 border-cream-200 text-stone-700' : 'bg-slate-950 border-slate-800 text-slate-200'
                            }`}>
                                {result.groundedInterpretation}
                            </p>
                        </div>

                        {/* 1 John 4:1 Testing Questions */}
                        <div className={`p-4 border rounded-2xl space-y-2 ${
                            isLight ? 'bg-sage-50/50 border-sage-200' : 'bg-indigo-950/30 border-indigo-500/30'
                        }`}>
                            <span className={`text-xs font-bold uppercase tracking-wider block flex items-center gap-1.5 ${
                                isLight ? 'text-sage-700' : 'text-indigo-300'
                            }`}>
                                <ShieldCheck className="w-4 h-4 text-indigo-400" /> 1 John 4:1 Biblical Testing Questions
                            </span>
                            <ul className="space-y-1.5 text-xs">
                                {result.testingPrinciples?.map((q: string, idx: number) => (
                                    <li key={idx} className={`flex items-start gap-2 ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
                                        <span className={`font-bold ${isLight ? 'text-sage-600' : 'text-indigo-400'}`}>?</span> {q}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <VoicePlayer text={result.groundedInterpretation} context="pastoral" label="Listen Audio Discernment" compact />
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
