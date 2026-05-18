'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Wand2, X, ChevronDown, CheckCircle, FileText } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

export const SermonGenerator = ({ isOpen, onClose, onSermonGenerated }: {
    isOpen: boolean;
    onClose: () => void;
    onSermonGenerated?: (sermon: any) => void;
}) => {
    const [formData, setFormData] = useState({
        theme: '',
        scriptureRefs: '',
        style: 'expository' as 'expository' | 'topical' | 'narrative'
    });
    const [loading, setLoading] = useState(false);
    const [generatedSermon, setGeneratedSermon] = useState<any>(null);

    const handleGenerate = async () => {
        if (!formData.theme || loading) return;
        setLoading(true);
        setGeneratedSermon(null);

        try {
            const res = await fetch('/api/ai/christian/teaching/sermon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    scriptureRefs: formData.scriptureRefs.split(',').map(s => s.trim())
                })
            });

            const data = await res.json();
            setGeneratedSermon(data);
            if (onSermonGenerated) onSermonGenerated(data);
        } catch (error) {
            console.error('Sermon generation error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white w-full max-w-3xl h-[85vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-sage-500 rounded-2xl flex items-center justify-center text-white">
                                    <BookOpen size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-light text-stone-800 tracking-tight">AI Sermon Architect</h2>
                                    <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mt-1">
                                        Augmenting the Ministry of the Word
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 transition-colors">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-cream-50/30">
                            {!generatedSermon ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">What is the central theme?</label>
                                            <input
                                                className="w-full bg-white border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sage-200 transition-all text-lg"
                                                placeholder="e.g., The Grace of God, Overcoming Anxiety..."
                                                value={formData.theme}
                                                onChange={e => setFormData({ ...formData, theme: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Key Scriptures</label>
                                            <input
                                                className="w-full bg-white border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sage-200 transition-all font-serif"
                                                placeholder="John 3:16, Romans 8:28"
                                                value={formData.scriptureRefs}
                                                onChange={e => setFormData({ ...formData, scriptureRefs: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Preaching Style</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-white border border-stone-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-sage-200 appearance-none cursor-pointer"
                                                    value={formData.style}
                                                    onChange={e => setFormData({ ...formData, style: e.target.value as any })}
                                                >
                                                    <option value="expository">Expository (Verse by Verse)</option>
                                                    <option value="topical">Topical (Central Subject)</option>
                                                    <option value="narrative">Narrative (Story-based)</option>
                                                </select>
                                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        disabled={!formData.theme || loading}
                                        className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${loading
                                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                                            : 'bg-stone-800 text-white hover:bg-stone-900 shadow-stone-200 active:scale-[0.98]'
                                            }`}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                                                Preparing the Word...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 size={20} />
                                                Generate Sermon Outline
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                    <div className="p-6 bg-sage-50 rounded-3xl border border-sage-100 flex items-center gap-4">
                                        <CheckCircle className="text-sage-600" size={32} />
                                        <div>
                                            <h3 className="text-lg font-medium text-stone-800">Sermon Outline Ready</h3>
                                            <p className="text-sm text-stone-500">Thematically consistent and scripturally grounded.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* AI Visual Illustration Header */}
                                        {generatedSermon.visuals && (generatedSermon.visuals.image || generatedSermon.visuals.video) && (
                                            <div className="w-full h-64 rounded-2xl overflow-hidden mb-8 relative border border-stone-100 shadow-sm relative group bg-stone-900">
                                                {generatedSermon.visuals.video ? (
                                                    <video
                                                        src={generatedSermon.visuals.video}
                                                        autoPlay loop muted playsInline
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                                    />
                                                ) : (
                                                    <img
                                                        src={generatedSermon.visuals.image}
                                                        alt={generatedSermon.title}
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 hover:scale-105"
                                                    />
                                                )}
                                                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                                    <span className="text-[10px] text-white font-medium uppercase tracking-widest">AI Generated Visual</span>
                                                </div>
                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                            </div>
                                        )}

                                        <h4 className="text-3xl font-light text-stone-800 mb-2">{generatedSermon.title}</h4>
                                        <p className="text-stone-400 font-serif italic mb-6">{generatedSermon.scriptureRefs?.join(', ')}</p>

                                        {/* 🎤 Real Voice Player */}
                                        <VoicePlayer
                                            text={[
                                                generatedSermon.title,
                                                generatedSermon.outline?.introduction,
                                                ...(generatedSermon.outline?.points?.map((p: any) => `${p.title}. ${p.explanation} ${p.application}`) || []),
                                                generatedSermon.outline?.conclusion,
                                            ].filter(Boolean).join('. ')}
                                            context="sermon"
                                            emotion="compassionate"
                                            label="Listen to this Sermon"
                                            className="mb-8"
                                        />

                                        <div className="space-y-8">
                                            <section>
                                                <h5 className="text-[10px] font-bold uppercase tracking-widest text-sage-600 mb-3">The Introduction</h5>
                                                <p className="text-stone-700 leading-relaxed">{generatedSermon.outline?.introduction}</p>
                                            </section>

                                            {generatedSermon.outline?.points?.map((point: any, idx: number) => (
                                                <section key={idx}>
                                                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-sage-600 mb-3">Point {idx + 1}: {point.title}</h5>
                                                    <div className="bg-cream-50/50 p-6 rounded-2xl border border-cream-100">
                                                        <p className="text-xs text-sage-600 font-serif italic mb-3">"{point.scripture}"</p>
                                                        <p className="text-stone-700 leading-relaxed mb-4">{point.explanation}</p>
                                                        <div className="pt-4 border-t border-cream-200">
                                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mr-2">Application:</span>
                                                            <span className="text-stone-600 italic">{point.application}</span>
                                                        </div>
                                                    </div>
                                                </section>
                                            ))}

                                            <section>
                                                <h5 className="text-[10px] font-bold uppercase tracking-widest text-sage-600 mb-3">The Conclusion</h5>
                                                <p className="text-stone-700 leading-relaxed">{generatedSermon.outline?.conclusion}</p>
                                            </section>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setGeneratedSermon(null)}
                                            className="flex-1 py-4 bg-white border border-stone-100 rounded-2xl text-stone-600 font-medium hover:bg-cream-50 transition-all"
                                        >
                                            Edit Parameters
                                        </button>
                                        <button
                                            className="flex-1 py-4 bg-stone-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-900 transition-all"
                                            onClick={() => window.print()}
                                        >
                                            <FileText size={18} /> Print Outline
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer Warning */}
                        <div className="p-6 bg-white border-t border-stone-100 text-center">
                            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                                <Sparkles size={12} className="text-sage-500" /> Powered by Sanctum Engine v1.0
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
