'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Search, BookOpen, HeartHandshake, Compass, Command, X, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SanctuaryOmnibox() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<'ask' | 'prayer' | 'scripture'>('ask');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            } else if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const quickLinks = [
        { label: 'Live Service Stream', path: '/live-service', icon: Compass },
        { label: 'Prayer Room & Intercession', path: '/prayer-room', icon: HeartHandshake },
        { label: 'Sermons & Depth Exegesis', path: '/spiritual', icon: BookOpen },
        { label: 'Community Aid & Transparency', path: '/transparency', icon: ShieldCheck },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResponse(null);

        try {
            const res = await fetch('/api/ai/omnibox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, mode }),
            });

            if (res.ok) {
                const data = await res.json();
                setResponse(data);
            } else {
                setResponse({
                    type: 'error',
                    content: 'Sanctuary AI is processing. Here is immediate guidance for your query:\n\n"The Lord is my light and my salvation; whom shall I fear?" — Psalm 27:1',
                });
            }
        } catch (err) {
            setResponse({
                type: 'error',
                content: 'Failed to connect to Sanctuary AI network.',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-amber-300 px-4 py-3 rounded-full shadow-2xl border border-amber-500/30 hover:scale-105 transition-all duration-300 group"
                title="Open Sanctuary AI Omnibox (Cmd+K)"
            >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm font-semibold tracking-wide hidden sm:inline text-white">Sanctuary AI</span>
                <kbd className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono bg-black/40 text-amber-200 px-2 py-0.5 rounded border border-amber-500/20">
                    <Command className="w-3 h-3" /> K
                </kbd>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header & Tabs */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
                        <Sparkles className="w-5 h-5 animate-pulse text-amber-400" />
                        <span>Sanctuary AI Omnibox</span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button
                            onClick={() => setMode('ask')}
                            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                                mode === 'ask' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Theological Q&A
                        </button>
                        <button
                            onClick={() => setMode('prayer')}
                            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                                mode === 'prayer' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Instant Prayer
                        </button>
                        <button
                            onClick={() => setMode('scripture')}
                            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                                mode === 'scripture' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Scripture Exegesis
                        </button>
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSubmit} className="p-4 border-b border-slate-800 bg-slate-900/30 flex items-center gap-3">
                    <Search className="w-5 h-5 text-amber-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={
                            mode === 'ask'
                                ? 'Ask any theological or spiritual question...'
                                : mode === 'prayer'
                                ? 'Describe what you need prayer for today...'
                                : 'Enter scripture reference or topic (e.g., Romans 8:28)...'
                        }
                        className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 px-4 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask AI'}
                    </button>
                </form>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    {response ? (
                        <div className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-5 space-y-3">
                            {response.title && (
                                <h4 className="text-amber-300 font-semibold text-sm flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> {response.title}
                                </h4>
                            )}
                            <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                                {response.content}
                            </div>
                            {response.scripture && (
                                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-amber-200 text-xs italic">
                                    📜 "{response.scripture}"
                                </div>
                            )}
                            {response.actionUrl && (
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push(response.actionUrl);
                                    }}
                                    className="mt-2 text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 group"
                                >
                                    <span>Explore Related Page</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                                Quick Sanctuary Navigation
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {quickLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <button
                                            key={link.path}
                                            onClick={() => {
                                                setIsOpen(false);
                                                router.push(link.path);
                                            }}
                                            className="flex items-center gap-3 p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all text-left text-xs font-medium text-slate-300 hover:text-amber-300"
                                        >
                                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span>{link.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-slate-950 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Powered by Theological AI Microservices</span>
                    <span>Press <kbd className="font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">ESC</kbd> to close</span>
                </div>
            </div>
        </div>
    );
}
