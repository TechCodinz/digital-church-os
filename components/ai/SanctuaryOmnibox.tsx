'use client';

import React, { useEffect, useState } from 'react';
import {
    ArrowRight,
    BookOpen,
    Command,
    Compass,
    Heart,
    HeartHandshake,
    Loader2,
    Search,
    ShieldCheck,
    Sparkles,
    X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type GuideMode = 'ask' | 'prayer' | 'scripture';

type GuideResponse = {
    type?: string;
    title?: string;
    content?: string;
    scripture?: string;
    actionUrl?: string;
};

export function SanctuaryOmnibox() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<GuideMode>('ask');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<GuideResponse | null>(null);
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setIsOpen((previous) => !previous);
            } else if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const navigate = (path: string) => {
        setIsOpen(false);
        setResponse(null);
        router.push(path);
    };

    const selectPrompt = (nextMode: GuideMode, prompt = '') => {
        setMode(nextMode);
        setQuery(prompt);
        setResponse(null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResponse(null);

        try {
            const result = await fetch('/api/ai/omnibox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query.trim(), mode }),
            });

            if (!result.ok) throw new Error('Guide service unavailable');
            setResponse(await result.json());
        } catch {
            setResponse({
                type: 'error',
                title: 'The guide is temporarily unavailable',
                content: 'Your prayer, Scripture, and pastoral-care spaces are still available. Choose a direct path below rather than relying on a generated answer.',
            });
        } finally {
            setLoading(false);
        }
    };

    const modes: Array<{ id: GuideMode; label: string; icon: typeof Sparkles }> = [
        { id: 'ask', label: 'Ask & discern', icon: Sparkles },
        { id: 'prayer', label: 'Prayer companion', icon: Heart },
        { id: 'scripture', label: 'Scripture study', icon: BookOpen },
    ];

    const directPaths = [
        { label: 'Prayer Room', path: '/prayer-room', icon: Heart },
        { label: 'Scripture Immersion', path: '/scripture/immersion', icon: BookOpen },
        { label: 'Pastoral Care', path: '/pastoral/hub', icon: HeartHandshake },
        { label: 'Find a Church', path: '/churches', icon: Compass },
    ];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="sacred-focus-ring fixed bottom-20 right-4 sm:right-6 z-50 group flex items-center gap-3 rounded-full border border-amber-300/20 bg-[#07110f]/92 px-3.5 py-3 text-white shadow-2xl shadow-black/30 backdrop-blur-2xl transition-all hover:-translate-y-1 hover:border-amber-300/35"
                title="Open Sanctuary Guide (Cmd/Ctrl + K)"
                aria-label="Open Sanctuary Guide"
            >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                </span>
                <span className="hidden sm:block text-left">
                    <span className="block text-[9px] uppercase tracking-[0.22em] text-amber-300/75">Anywhere in the church</span>
                    <span className="block text-xs font-semibold text-slate-100">Sanctuary Guide</span>
                </span>
                <kbd className="hidden lg:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[9px] font-mono text-slate-400">
                    <Command className="h-3 w-3" /> K
                </kbd>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/72 px-3 pt-12 sm:px-5 sm:pt-20 backdrop-blur-xl animate-fade-in">
            <div className="sacred-panel-dark relative flex max-h-[84vh] w-full max-w-3xl flex-col overflow-hidden text-white shadow-[0_40px_120px_rgba(0,0,0,.55)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/80 to-transparent" />

                <div className="border-b border-white/8 px-5 py-5 sm:px-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10">
                                <Sparkles className="h-5 w-5 text-amber-300" />
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.24em] text-amber-300/75">Intelligent spiritual navigation</p>
                                <h2 className="mt-1 text-xl font-light text-white">Sanctuary Guide</h2>
                                <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-400">Ask, pray, study, or move directly to a human-care or church-life experience.</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="sacred-focus-ring rounded-xl p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white" aria-label="Close Sanctuary Guide">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-5 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {modes.map((item) => {
                            const Icon = item.icon;
                            const selected = mode === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => selectPrompt(item.id)}
                                    className={`sacred-focus-ring flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-semibold transition-all ${selected ? 'border-amber-300/30 bg-amber-300/12 text-amber-200' : 'border-white/8 bg-white/[0.035] text-slate-400 hover:text-white'}`}
                                >
                                    <Icon className="h-3.5 w-3.5" /> {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="overflow-y-auto custom-scrollbar px-5 py-5 sm:px-6 sm:py-6">
                    {!response && (
                        <div className="mb-5 grid gap-2 sm:grid-cols-2">
                            <button onClick={() => selectPrompt('prayer', 'Help me put what is heavy on my heart into a Scripture-grounded prayer.')} className="sacred-focus-ring group rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-left transition-all hover:border-amber-300/18 hover:bg-white/[0.055]">
                                <Heart className="h-4 w-4 text-amber-300" />
                                <p className="mt-3 text-xs font-semibold text-slate-100">Help me pray</p>
                                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Turn a burden into a careful prayer without claiming revelation.</p>
                            </button>
                            <button onClick={() => selectPrompt('scripture', 'Help me study a Bible passage in context, beginning with observation before application.')} className="sacred-focus-ring group rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-left transition-all hover:border-amber-300/18 hover:bg-white/[0.055]">
                                <BookOpen className="h-4 w-4 text-emerald-300" />
                                <p className="mt-3 text-xs font-semibold text-slate-100">Study a passage</p>
                                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Move through context, observation, interpretation, and reflection.</p>
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-black/18 p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                            <Search className="mt-2.5 h-4 w-4 shrink-0 text-amber-300" />
                            <textarea
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder={mode === 'prayer' ? 'What would you like help praying about?' : mode === 'scripture' ? 'Which passage, verse, or biblical theme are you studying?' : 'What do you need help understanding or deciding?'}
                                className="min-h-[76px] flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed text-white outline-none placeholder:text-slate-600"
                                autoFocus
                            />
                            <button type="submit" disabled={loading || !query.trim()} className="sacred-focus-ring mt-1 inline-flex h-10 items-center gap-2 rounded-xl bg-amber-200 px-3 text-[11px] font-bold text-slate-950 transition-all hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                <span className="hidden sm:inline">Continue</span>
                            </button>
                        </div>
                    </form>

                    {response && (
                        <div className="mt-5 rounded-3xl border border-amber-300/14 bg-amber-200/[0.035] p-5 sm:p-6">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/8">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-amber-300/70">Guided response</p>
                                    {response.title && <h3 className="mt-2 text-base font-semibold text-white">{response.title}</h3>}
                                    <div className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">{response.content}</div>
                                    {response.scripture && (
                                        <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4 text-xs leading-relaxed text-amber-100/90">
                                            {response.scripture}
                                        </div>
                                    )}
                                    {response.actionUrl && (
                                        <button onClick={() => navigate(response.actionUrl!)} className="sacred-focus-ring mt-5 inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200">
                                            Continue in the related experience <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <p className="text-[9px] uppercase tracking-[0.22em] text-slate-600">Direct paths — no AI required</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {directPaths.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <button key={link.path} onClick={() => navigate(link.path)} className="sacred-focus-ring group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-3.5 text-left transition-all hover:bg-white/[0.055]">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-slate-300 group-hover:text-amber-300">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <span className="text-xs font-medium text-slate-300 group-hover:text-white">{link.label}</span>
                                        <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-700 group-hover:text-amber-300" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/8 bg-black/20 px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-2 text-[10px] leading-relaxed text-slate-500">
                            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                            <span>AI supports study and reflection. It does not speak for God, deliver prophecy, diagnose, or replace Scripture and accountable human pastoral care.</span>
                        </div>
                        <button onClick={() => navigate('/pastoral/hub')} className="sacred-focus-ring inline-flex shrink-0 items-center gap-2 text-[10px] font-semibold text-amber-300">
                            Need a person? <HeartHandshake className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
