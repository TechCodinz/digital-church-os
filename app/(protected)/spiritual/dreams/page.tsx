'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sparkles, BookOpen, ShieldCheck, RefreshCw, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

export default function BiblicalDreamInterpreterPage() {
    const [dreamText, setDreamText] = useState('');
    const [symbols, setSymbols] = useState('Clean Water, Soaring Eagle');
    const [emotions, setEmotions] = useState('Peaceful & Awe-Filled');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

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
                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-xl">
                        <Moon className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Biblical Dream & Vision Interpreter</h1>
                    <p className="text-slate-400 text-sm">Grounded scriptural discernment of night visions & spiritual impressions (Acts 2:17)</p>
                </div>

                {/* Intake Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 mb-8">
                    <form onSubmit={handleInterpret} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Describe Your Dream / Vision</label>
                            <textarea
                                value={dreamText}
                                onChange={e => setDreamText(e.target.value)}
                                placeholder="Describe what you saw, the setting, and key moments..."
                                rows={4}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Symbols / Objects</label>
                                <input
                                    type="text"
                                    value={symbols}
                                    onChange={e => setSymbols(e.target.value)}
                                    placeholder="e.g. River, Eagle, Mountain, Key"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Emotional Atmosphere</label>
                                <input
                                    type="text"
                                    value={emotions}
                                    onChange={e => setEmotions(e.target.value)}
                                    placeholder="e.g. Peaceful, Urgent, Joyful"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !dreamText.trim()}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            <span>Analyze Through Biblical Discernment</span>
                        </button>
                    </form>
                </div>

                {/* Result Display */}
                {result && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-900 border border-indigo-500/30 rounded-3xl space-y-6 shadow-2xl">
                        <div className="border-b border-slate-800 pb-3">
                            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">Discernment Summary</span>
                            <h2 className="text-2xl font-bold text-white">{result.biblicalTitle}</h2>
                        </div>

                        {/* Lexicon Breakdown */}
                        <div className="space-y-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Biblical Symbol Lexicon Cross-References</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {result.symbolLexiconBreakdown?.map((item: any, i: number) => (
                                    <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-indigo-300 text-xs">{item.symbol}</span>
                                            <span className="text-[10px] text-amber-400 font-semibold font-mono">📖 {item.scriptureReference}</span>
                                        </div>
                                        <p className="text-xs text-slate-400">{item.biblicalMeaning}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Grounded Interpretation */}
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Scriptural Interpretation</span>
                            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                {result.groundedInterpretation}
                            </p>
                        </div>

                        {/* 1 John 4:1 Testing Questions */}
                        <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-2">
                            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-indigo-400" /> 1 John 4:1 Biblical Testing Questions
                            </span>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                                {result.testingPrinciples?.map((q: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-indigo-400 font-bold">?</span> {q}
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
