'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Layers, BookOpen, Share2, ChevronRight, Globe, Zap, History, Map } from 'lucide-react';

export const ScriptureDepthExperience = () => {
    const [reference, setReference] = useState('John 3:16');
    const [loading, setLoading] = useState(false);
    const [depthData, setDepthData] = useState<any>(null);
    const [activeLayer, setActiveLayer] = useState(1);

    const excavate = async () => {
        if (!reference.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('/api/scripture/depth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference, layer: 'all', level: 'intermediate' }),
            });

            if (!res.ok) throw new Error('API request failed');

            const data = await res.json();
            const revelation = data.revelation || {};
            const translations = data.translations || {};

            // Map real API response to the layered UI structure
            setDepthData({
                reference,
                metadata: {
                    original: revelation.original || translations.original || '',
                    translations: {
                        KJV: translations.KJV || translations.kjv || '',
                        MSG: translations.MSG || translations.msg || '',
                        TPT: translations.TPT || translations.tpt || '',
                        NIV: translations.NIV || translations.niv || '',
                    }
                },
                layers: [
                    {
                        depth: 1,
                        name: 'Surface',
                        icon: BookOpen,
                        content: revelation.surface || revelation.literalMeaning || revelation.summary || 'The plain, direct message of this scripture.',
                        color: 'bg-blue-50 text-blue-600'
                    },
                    {
                        depth: 2,
                        name: 'Linguistic',
                        icon: Globe,
                        content: revelation.linguistic || revelation.wordStudy || revelation.greekHebrew || 'Original language deep-dive: key words in their original Hebrew or Greek context.',
                        color: 'bg-emerald-50 text-emerald-600'
                    },
                    {
                        depth: 3,
                        name: 'Cultural',
                        icon: History,
                        content: revelation.cultural || revelation.historicalContext || 'First-century cultural and historical context that shaped this passage.',
                        color: 'bg-amber-50 text-amber-600'
                    },
                    {
                        depth: 4,
                        name: 'Typology',
                        icon: Map,
                        content: revelation.typology || revelation.crossReferences || revelation.connections || 'How this passage connects to broader biblical themes and types.',
                        color: 'bg-rose-50 text-rose-600'
                    },
                    {
                        depth: 5,
                        name: 'Eternal',
                        icon: Sparkles,
                        content: revelation.eternal || revelation.propheticFulfillment || revelation.divineNature || 'The eternal, timeless truth that bridges the divine and human encounter.',
                        color: 'bg-purple-50 text-purple-600'
                    },
                ],
                wowMoment: revelation.mindBlowing || revelation.wowMoment || revelation.revelation || `The depth of ${reference} reveals layers of meaning that transform daily life.`,
                lifeApplication: revelation.lifeApplication || revelation.practicalApplication || 'Rest in this truth today and let it transform how you see yourself.',
            });
            setActiveLayer(1);
        } catch (error) {
            console.error('Excavation error:', error);
            // Graceful fallback to demo data so UI never breaks
            setDepthData({
                reference,
                metadata: { original: '', translations: {} },
                layers: [
                    { depth: 1, name: 'Surface', icon: BookOpen, content: 'Unable to excavate at this time. Please check your connection and try again.', color: 'bg-blue-50 text-blue-600' },
                    { depth: 2, name: 'Linguistic', icon: Globe, content: 'Linguistic analysis coming available shortly.', color: 'bg-emerald-50 text-emerald-600' },
                    { depth: 3, name: 'Cultural', icon: History, content: 'Historical context unavailable.', color: 'bg-amber-50 text-amber-600' },
                    { depth: 4, name: 'Typology', icon: Map, content: 'Typological connections unavailable.', color: 'bg-rose-50 text-rose-600' },
                    { depth: 5, name: 'Eternal', icon: Sparkles, content: 'Eternal insight unavailable.', color: 'bg-purple-50 text-purple-600' },
                ],
                wowMoment: 'The API is temporarily unavailable. The Word of God remains eternally true.',
                lifeApplication: '',
            });
            setActiveLayer(1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Search Section */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl border border-stone-50">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 block px-4">Identify Verse for Excavation</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                className="w-full bg-stone-50 border-none rounded-3xl px-8 py-5 text-xl text-stone-800 placeholder:text-stone-300 outline-none focus:ring-2 focus:ring-sage-200 transition-all font-light"
                                placeholder="e.g., Romans 8:28"
                            />
                            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-300" size={24} />
                        </div>
                    </div>
                    <button
                        onClick={excavate}
                        disabled={loading}
                        className="w-full md:w-auto px-10 py-5 bg-stone-800 text-white rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-stone-900 transition-all active:scale-95 shadow-xl shadow-stone-200"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Excavate Depths <Layers size={20} /></>
                        )}
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {depthData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid lg:grid-cols-12 gap-8"
                    >
                        {/* Layers Navigation */}
                        <div className="lg:col-span-4 space-y-4">
                            {depthData.layers.map((layer: any) => (
                                <button
                                    key={layer.depth}
                                    onClick={() => setActiveLayer(layer.depth)}
                                    className={`w-full p-6 rounded-[32px] flex items-center gap-4 transition-all border ${activeLayer === layer.depth
                                        ? 'bg-white border-sage-200 shadow-xl scale-[1.02] z-10'
                                        : 'bg-white/40 border-transparent hover:bg-white/60'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${layer.color}`}>
                                        <layer.icon size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Layer {layer.depth}</p>
                                        <p className="font-bold text-stone-800">{layer.name}</p>
                                    </div>
                                    {activeLayer === layer.depth && (
                                        <motion.div layoutId="active-indicator" className="ml-auto">
                                            <ChevronRight size={20} className="text-sage-400" />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            <div className="bg-white rounded-[40px] p-10 shadow-xl border border-stone-50 flex-1">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeLayer}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="pb-8 border-b border-stone-50">
                                            <h3 className="text-4xl font-light text-stone-800 tracking-tight mb-4">
                                                {depthData.layers.find((l: any) => l.depth === activeLayer).name} Revelation
                                            </h3>
                                            <p className="text-lg text-stone-600 leading-relaxed font-light">
                                                {depthData.layers.find((l: any) => l.depth === activeLayer).content}
                                            </p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
                                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">The Resulting "Aha!"</p>
                                                <div className="flex items-start gap-3">
                                                    <Zap size={20} className="text-amber-500 mt-1 flex-shrink-0" />
                                                    <p className="text-sm font-medium text-stone-700 leading-relaxed">
                                                        This perspective shifts our understanding of the verse from a simple gift to an eternal transformation.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-sage-50 rounded-3xl border border-sage-100">
                                                <p className="text-[10px] font-bold text-sage-600 uppercase tracking-widest mb-4">Life Application</p>
                                                <p className="text-sm font-medium text-stone-700 leading-relaxed italic">
                                                    "Today, rest in the knowledge that your creator has unique, non-contingent love for you."
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Wow Moment Slot */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="bg-purple-900 text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform">
                                    <Sparkles size={120} />
                                </div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/5">
                                        <Sparkles size={12} className="mr-2 text-amber-300" /> Mind-Blowing Detail
                                    </div>
                                    <p className="text-2xl font-light leading-snug">{depthData.wowMoment}</p>
                                    <div className="mt-8 flex justify-between items-center">
                                        <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                                            Explore Similar Depths <ChevronRight size={14} />
                                        </button>
                                        <button className="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
