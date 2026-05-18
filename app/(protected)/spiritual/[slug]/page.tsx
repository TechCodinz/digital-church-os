'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Send, Zap, RefreshCw, BookOpen, AlertTriangle, Sparkles } from 'lucide-react';

const moduleConfig: Record<string, {
    title: string; icon: string; accent: string;
    inputLabel: string; inputPlaceholder: string;
}> = {
    guidance: {
        title: "Holy Spirit Guidance", icon: "⚡", accent: "blue",
        inputLabel: "What situation do you need Holy Spirit guidance on?",
        inputPlaceholder: "E.g., I'm facing a major career decision and need to discern God's will...",
    },
    warfare: {
        title: "Spiritual Warfare Training", icon: "🛡️", accent: "slate",
        inputLabel: "What spiritual battle are you facing?",
        inputPlaceholder: "E.g., I feel under constant attack in my mind, I struggle with fear and anxiety, my family is under pressure...",
    },
    dreams: {
        title: "Dreams & Visions Interpretation", icon: "🌙", accent: "indigo",
        inputLabel: "Describe your dream or vision for biblical interpretation:",
        inputPlaceholder: "E.g., I dreamed I was in a dark forest being chased, but then I saw a bright light and felt peace...",
    },
    angels: {
        title: "Angelic Encounters Teaching", icon: "✨", accent: "amber",
        inputLabel: "What would you like to learn about angels biblically?",
        inputPlaceholder: "E.g., Are guardian angels real? What do angels actually look like? Can I pray to angels?",
    },
    prophetic: {
        title: "Prophetic Ministry Training", icon: "🔮", accent: "purple",
        inputLabel: "Describe your prophetic experience or question:",
        inputPlaceholder: "E.g., I believe I have a prophetic gift but don't know how to use it safely...",
    },
    encounters: {
        title: "Supernatural Encounters", icon: "☁️", accent: "cyan",
        inputLabel: "What heavenly encounter or worship experience are you seeking?",
        inputPlaceholder: "E.g., I want to experience God's presence more deeply in worship, take me deeper into His glory...",
    },
    gifts: {
        title: "Spiritual Gifts Discovery", icon: "🎁", accent: "rose",
        inputLabel: "Describe yourself or your question about spiritual gifts:",
        inputPlaceholder: "E.g., I've always felt drawn to helping people through prayer, I want to know my spiritual gifts...",
    },
    healing: {
        title: "Healing & Deliverance Ministry", icon: "💚", accent: "emerald",
        inputLabel: "What healing are you seeking? (physical, emotional, or inner)",
        inputPlaceholder: "E.g., I've been dealing with chronic anxiety for years, I need inner healing from childhood trauma...",
    },
    glory: {
        title: "Glory Realms Experience", icon: "☀️", accent: "yellow",
        inputLabel: "What aspect of God's glory would you like to explore?",
        inputPlaceholder: "E.g., I want to understand the Courts of Heaven, teach me about the Throne Room of God...",
    },
};

const accentClasses: Record<string, { bg: string; border: string; text: string; button: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', button: 'bg-blue-600 hover:bg-blue-700' },
    slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', button: 'bg-slate-700 hover:bg-slate-800' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', button: 'bg-indigo-600 hover:bg-indigo-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', button: 'bg-amber-600 hover:bg-amber-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', button: 'bg-purple-600 hover:bg-purple-700' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-700', button: 'bg-cyan-600 hover:bg-cyan-700' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', button: 'bg-rose-600 hover:bg-rose-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', button: 'bg-emerald-600 hover:bg-emerald-700' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-700', button: 'bg-yellow-600 hover:bg-yellow-700' },
};

function renderSpiritualResponse(data: any) {
    if (!data || typeof data !== 'object') return null;
    return (
        <div className="space-y-4">
            {data.title && <h4 className="text-xl font-semibold text-white">{data.title}</h4>}
            {Object.entries(data).map(([key, value]) => {
                if (key === 'title' || !value) return null;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                if (Array.isArray(value)) {
                    return (
                        <div key={key} className="bg-stone-700/50 rounded-xl p-4 border border-stone-600/50">
                            <p className="font-semibold text-stone-200 text-sm uppercase tracking-wide mb-3">{label}</p>
                            <ul className="space-y-2">
                                {(value as any[]).map((v, i) => (
                                    <li key={i} className="flex items-start gap-2 text-stone-300 text-sm">
                                        <span className="text-amber-400 mt-0.5">›</span>
                                        {typeof v === 'object' ? (
                                            <div>
                                                {Object.entries(v).map(([vk, vv]) => (
                                                    <div key={vk}><strong className="text-stone-200">{vk}:</strong> {String(vv)}</div>
                                                ))}
                                            </div>
                                        ) : String(v)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                }
                if (typeof value === 'object') {
                    return (
                        <div key={key} className="bg-stone-700/50 rounded-xl p-4 border border-stone-600/50">
                            <p className="font-semibold text-stone-200 text-sm uppercase tracking-wide mb-3">{label}</p>
                            <div className="space-y-2">
                                {Object.entries(value as Record<string, any>).map(([vk, vv]) => (
                                    <div key={vk} className="text-sm">
                                        <span className="text-amber-400 font-medium">{vk.replace(/([A-Z])/g, ' $1')}: </span>
                                        <span className="text-stone-300">{Array.isArray(vv) ? vv.join(', ') : String(vv)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }
                const isWarning = key.toLowerCase().includes('warning') || key.toLowerCase().includes('caution') || key.toLowerCase().includes('note');
                const isPrayer = key.toLowerCase().includes('prayer');
                const isScripture = key.toLowerCase().includes('scripture') || key.toLowerCase().includes('reference');
                return (
                    <div key={key} className={`rounded-xl p-4 border ${isWarning ? 'bg-red-900/20 border-red-800/30' : isPrayer ? 'bg-sage-900/30 border-sage-700/30' : isScripture ? 'bg-amber-900/20 border-amber-700/30' : 'bg-stone-700/50 border-stone-600/50'}`}>
                        <p className={`font-semibold text-sm uppercase tracking-wide mb-2 ${isWarning ? 'text-red-400' : isPrayer ? 'text-sage-400' : isScripture ? 'text-amber-400' : 'text-stone-300'}`}>
                            {isWarning ? '⚠️' : isPrayer ? '🙏' : isScripture ? '📖' : '✦'} {label}
                        </p>
                        <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">{String(value)}</p>
                    </div>
                );
            })}
        </div>
    );
}

export default function SpiritualCenterExperience({ params }: { params: { slug: string } }) {
    const { data: session } = useSession();
    const [input, setInput] = useState('');
    const [response, setResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { slug } = params;
    const config = moduleConfig[slug] || {
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        icon: '✦', accent: 'indigo',
        inputLabel: "What spiritual insight are you seeking?",
        inputPlaceholder: "Share your question or need...",
    };
    const accent = accentClasses[config.accent] || accentClasses.indigo;

    const handleSubmit = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const res = await fetch('/api/ai/spiritual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, input: input.trim() }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to get spiritual insight');
            }

            const data = await res.json();
            setResponse(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-stone-900">
            <div className="max-w-4xl mx-auto px-4">
                <Link href="/spiritual" className="inline-flex items-center text-stone-400 hover:text-stone-300 font-medium mb-8 group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Supernatural Centers
                </Link>

                <div className="bg-stone-800 rounded-3xl shadow-2xl border border-stone-700 relative overflow-hidden">
                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none" />

                    <div className="relative z-10 p-8 md:p-10">
                        {/* Header */}
                        <div className="flex items-center mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-stone-700/80 border border-stone-600 flex items-center justify-center mr-4 text-2xl shadow-inner">
                                {config.icon}
                            </div>
                            <div>
                                <h1 className="text-3xl font-light text-white">{config.title}</h1>
                                <div className="flex items-center mt-2 gap-2">
                                    <span className="inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-900/30 border border-emerald-800/30 px-3 py-1 rounded-full">
                                        <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Theological Guardrails Active
                                    </span>
                                    <span className="inline-flex items-center text-xs font-medium text-amber-400 bg-amber-900/20 border border-amber-800/30 px-3 py-1 rounded-full">
                                        <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Scripture-Grounded
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="bg-stone-900/50 rounded-2xl p-6 mb-8 border border-stone-700/50">
                            <label className="block text-sm font-medium text-stone-300 mb-3">
                                <Zap className="inline w-4 h-4 mr-1 text-amber-400" />
                                {config.inputLabel}
                            </label>
                            <div className="flex gap-3">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={config.inputPlaceholder}
                                    rows={4}
                                    className="flex-1 px-4 py-3 rounded-xl bg-stone-800 border border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-200 placeholder-stone-500 resize-none text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !input.trim()}
                                    className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1 min-w-[64px]"
                                >
                                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    <span className="text-xs">{isLoading ? '...' : 'Seek'}</span>
                                </button>
                            </div>
                            <p className="text-xs text-stone-500 mt-2">
                                <AlertTriangle className="inline w-3 h-3 mr-1" />
                                All responses are filtered through theological guardrails for safety and biblical accuracy.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Response */}
                        <AnimatePresence>
                            {response && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {/* AI Visual Illustration */}
                                    {response.visuals && (response.visuals.image || response.visuals.video) && (
                                        <div className="w-full h-52 md:h-64 rounded-2xl overflow-hidden mb-6 relative border border-stone-700 bg-stone-900 shadow-xl group">
                                            {response.visuals.video ? (
                                                <video
                                                    src={response.visuals.video}
                                                    autoPlay loop muted playsInline
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                                                />
                                            ) : (
                                                <img
                                                    src={response.visuals.image}
                                                    alt="Spiritual Insight Visual"
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                                                />
                                            )}
                                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                                                <Sparkles className="w-3 h-3 text-amber-300" />
                                                <span className="text-[10px] text-white/80 font-medium uppercase tracking-widest">AI Generated Visual</span>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-stone-900 to-transparent" />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                                            <span className="text-sm font-medium text-stone-400">Divine Intelligence Response</span>
                                        </div>
                                        <button onClick={handleSubmit} className="text-xs text-stone-500 hover:text-stone-400 flex items-center gap-1">
                                            <RefreshCw className="w-3 h-3" /> New Response
                                        </button>
                                    </div>
                                    {renderSpiritualResponse(response.data)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
