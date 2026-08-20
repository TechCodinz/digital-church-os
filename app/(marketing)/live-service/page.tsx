'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    ArrowRight,
    BookOpen,
    Globe,
    Heart,
    HeartHandshake,
    Loader2,
    MessageSquare,
    MonitorPlay,
    Radio,
    Settings,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';

type LiveConfig = {
    configured: boolean;
    streamUrl: string | null;
    streamTitle: string;
    provider: 'youtube' | 'vimeo' | 'twitch' | null;
};

type AskAnswer = {
    question: string;
    answer: string;
};

function buildEmbedUrl(config: LiveConfig): string | null {
    if (!config.streamUrl || !config.provider) return null;

    try {
        const url = new URL(config.streamUrl);

        if (config.provider === 'youtube') {
            let videoId = '';
            if (url.hostname === 'youtu.be') videoId = url.pathname.split('/').filter(Boolean)[0] || '';
            if (!videoId && url.pathname === '/watch') videoId = url.searchParams.get('v') || '';
            if (!videoId && url.pathname.startsWith('/embed/')) videoId = url.pathname.split('/embed/')[1]?.split('/')[0] || '';
            if (!videoId && url.pathname.startsWith('/live/')) videoId = url.pathname.split('/live/')[1]?.split('/')[0] || '';
            return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1` : null;
        }

        if (config.provider === 'vimeo') {
            if (url.hostname === 'player.vimeo.com') return url.toString();
            const videoId = url.pathname.split('/').filter(Boolean).find((segment) => /^\d+$/.test(segment));
            return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
        }

        if (config.provider === 'twitch') {
            if (typeof window === 'undefined') return null;
            const channel = url.pathname.split('/').filter(Boolean)[0];
            return channel ? `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(window.location.hostname)}` : null;
        }
    } catch {
        return null;
    }

    return null;
}

export default function LiveServicePage() {
    const { data: session } = useSession();
    const [config, setConfig] = useState<LiveConfig>({
        configured: false,
        streamUrl: null,
        streamTitle: 'Digital Church Worship',
        provider: null,
    });
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [activeTab, setActiveTab] = useState<'guide' | 'ask' | 'respond'>('guide');
    const [question, setQuestion] = useState('');
    const [asking, setAsking] = useState(false);
    const [answers, setAnswers] = useState<AskAnswer[]>([]);
    const [askError, setAskError] = useState('');

    useEffect(() => {
        fetch('/api/live-service/config', { cache: 'no-store' })
            .then(async (response) => response.ok ? response.json() : null)
            .then((data) => {
                if (data) setConfig(data);
            })
            .catch(() => undefined)
            .finally(() => setLoadingConfig(false));
    }, []);

    const embedUrl = buildEmbedUrl(config);
    const userRole = (session?.user as any)?.role;
    const isChurchAdmin = userRole === 'CHURCH_ADMIN';

    const askScripture = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!question.trim()) return;

        const currentQuestion = question.trim();
        setAsking(true);
        setAskError('');

        try {
            const response = await fetch('/api/ai/omnibox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'scripture',
                    query: `During a church service, help me study this question carefully and in biblical context: ${currentQuestion}`,
                }),
            });
            if (!response.ok) throw new Error('Unable to answer');
            const data = await response.json();
            setAnswers((previous) => [
                { question: currentQuestion, answer: data.content || 'No response was returned.' },
                ...previous,
            ]);
            setQuestion('');
        } catch {
            setAskError('The Scripture assistant is unavailable right now. You can still open Scripture Immersion or speak with a pastor.');
        } finally {
            setAsking(false);
        }
    };

    const companionTabs = [
        { id: 'guide' as const, label: 'Service guide', icon: Sparkles },
        { id: 'ask' as const, label: 'Ask Scripture', icon: BookOpen },
        { id: 'respond' as const, label: 'Respond', icon: Heart },
    ];

    return (
        <div className="sanctuary-page-shell min-h-screen bg-[#010706] pt-24 pb-24 text-white">
            <div className="absolute inset-0 sanctuary-radiance opacity-70" aria-hidden="true" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/18 bg-amber-300/7 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-amber-200">
                            <Radio className="h-3.5 w-3.5" /> Worship & live service
                        </div>
                        <h1 className="mt-5 max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.03]">
                            {config.streamTitle}
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-400">
                            A focused worship surface for a real configured church broadcast — without invented viewers, fabricated timers, fake reactions, or simulated “live” activity.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${config.configured ? 'border-emerald-300/20 bg-emerald-300/8 text-emerald-300' : 'border-white/10 bg-white/[0.035] text-slate-500'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${config.configured ? 'bg-emerald-300' : 'bg-slate-600'}`} />
                            {loadingConfig ? 'Checking source' : config.configured ? 'Broadcast source configured' : 'No broadcast source'}
                        </span>
                        {config.provider && (
                            <span className="rounded-full border border-white/8 bg-white/[0.035] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                                {config.provider}
                            </span>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6">
                    <section>
                        <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_35px_100px_rgba(0,0,0,.45)]">
                            {loadingConfig ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#07110f] via-[#061611] to-black">
                                    <div className="text-center">
                                        <Loader2 className="mx-auto h-7 w-7 animate-spin text-amber-300" />
                                        <p className="mt-4 text-xs text-slate-500">Checking the church broadcast source…</p>
                                    </div>
                                </div>
                            ) : embedUrl ? (
                                <iframe
                                    src={embedUrl}
                                    className="absolute inset-0 h-full w-full"
                                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                                    allowFullScreen
                                    title={config.streamTitle}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#07110f] via-[#081a16] to-[#020706] px-6">
                                    <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                                    <div className="sanctuary-light-column !top-[-16%] !h-[92%]" aria-hidden="true" />
                                    <div className="relative z-10 max-w-xl text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-300/18 bg-amber-300/8">
                                            <MonitorPlay className="h-7 w-7 text-amber-300" />
                                        </div>
                                        <h2 className="mt-6 text-2xl sm:text-3xl font-light">The sanctuary is ready. The stream is not configured.</h2>
                                        <p className="mt-3 text-sm leading-relaxed text-slate-500">
                                            No broadcast is being simulated. When an approved YouTube, Vimeo, or Twitch source is configured, it will appear here.
                                        </p>
                                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                                            {isChurchAdmin && (
                                                <Link href="/admin/settings" className="sacred-primary-button">
                                                    <Settings className="h-4 w-4" /> Configure broadcast
                                                </Link>
                                            )}
                                            <Link href="/churches" className="sacred-secondary-button">
                                                <Globe className="h-4 w-4" /> Find a church
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-5 grid sm:grid-cols-3 gap-3">
                            {[
                                { icon: ShieldCheck, title: 'Truthful state', copy: 'No fake viewer counts, timers, reactions, or AI-generated “live” events.' },
                                { icon: BookOpen, title: 'Scripture beside worship', copy: 'Open the Word, ask contextual questions, and continue study after service.' },
                                { icon: HeartHandshake, title: 'Response stays human', copy: 'Prayer and pastoral care remain one tap away when the moment calls for people.' },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                                        <Icon className="h-4 w-4 text-emerald-300" />
                                        <h3 className="mt-4 text-sm font-semibold text-slate-100">{item.title}</h3>
                                        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{item.copy}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <aside className="sacred-panel-dark overflow-hidden xl:sticky xl:top-24 xl:self-start">
                        <div className="border-b border-white/8 px-5 py-5">
                            <p className="sanctuary-section-label text-amber-300/75">Worship companion</p>
                            <h2 className="mt-2 text-xl font-light">Stay present without losing the thread.</h2>
                        </div>

                        <div className="grid grid-cols-3 gap-1 border-b border-white/8 p-2">
                            {companionTabs.map((tab) => {
                                const Icon = tab.icon;
                                const selected = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`sacred-focus-ring flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-[10px] font-semibold transition-all ${selected ? 'bg-amber-200 text-slate-950' : 'text-slate-500 hover:bg-white/[0.04] hover:text-white'}`}
                                    >
                                        <Icon className="h-4 w-4" /> {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="max-h-[560px] overflow-y-auto custom-scrollbar p-5">
                            {activeTab === 'guide' && (
                                <div>
                                    <div className="rounded-3xl border border-amber-300/12 bg-amber-300/[0.035] p-5">
                                        <Sparkles className="h-5 w-5 text-amber-300" />
                                        <h3 className="mt-4 text-base font-semibold text-white">A quieter second screen</h3>
                                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                            This companion deliberately avoids pretending to transcribe or interpret a sermon unless real transcript data is supplied. Use it for your own notes, Scripture questions, and response.
                                        </p>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        <Link href="/scripture/immersion" className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 hover:bg-white/[0.05] transition-all">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/8 text-emerald-300"><BookOpen className="h-4 w-4" /></span>
                                            <span className="flex-1">
                                                <span className="block text-xs font-semibold text-slate-200">Open Scripture</span>
                                                <span className="mt-1 block text-[10px] text-slate-600">Read alongside the service</span>
                                            </span>
                                            <ArrowRight className="h-3.5 w-3.5 text-slate-700 group-hover:text-amber-300" />
                                        </Link>
                                        <Link href="/journal" className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-4 hover:bg-white/[0.05] transition-all">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300/8 text-amber-300"><MessageSquare className="h-4 w-4" /></span>
                                            <span className="flex-1">
                                                <span className="block text-xs font-semibold text-slate-200">Open Journal</span>
                                                <span className="mt-1 block text-[10px] text-slate-600">Capture what you noticed</span>
                                            </span>
                                            <ArrowRight className="h-3.5 w-3.5 text-slate-700 group-hover:text-amber-300" />
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ask' && (
                                <div>
                                    <p className="text-xs leading-relaxed text-slate-500">
                                        Ask about a passage, doctrine, or biblical theme. The response is study assistance, not a claim about what the preacher or God specifically intended in this service.
                                    </p>
                                    <form onSubmit={askScripture} className="mt-5">
                                        <textarea
                                            value={question}
                                            onChange={(event) => setQuestion(event.target.value)}
                                            placeholder="e.g. What is the context of Philippians 4:6–7?"
                                            className="h-28 w-full resize-none rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-slate-700 focus:border-amber-300/25 focus:ring-2 focus:ring-amber-300/10"
                                        />
                                        {askError && <p className="mt-3 rounded-xl border border-rose-300/15 bg-rose-300/7 p-3 text-[11px] leading-relaxed text-rose-300">{askError}</p>}
                                        <button type="submit" disabled={asking || !question.trim()} className="sacred-focus-ring mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-amber-200 text-xs font-bold text-slate-950 hover:bg-amber-100 disabled:opacity-40">
                                            {asking ? <><Loader2 className="h-4 w-4 animate-spin" /> Studying…</> : <>Ask Scripture companion <ArrowRight className="h-4 w-4" /></>}
                                        </button>
                                    </form>

                                    {answers.length > 0 && (
                                        <div className="mt-6 space-y-4">
                                            {answers.map((item, index) => (
                                                <div key={`${item.question}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-300/70">Your question</p>
                                                    <p className="mt-2 text-xs font-medium text-slate-200">{item.question}</p>
                                                    <div className="my-4 sanctuary-divider" />
                                                    <p className="whitespace-pre-line text-xs leading-6 text-slate-400">{item.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'respond' && (
                                <div>
                                    <p className="text-xs leading-relaxed text-slate-500">When worship moves you toward action, choose the next human or spiritual response intentionally.</p>
                                    <div className="mt-5 space-y-3">
                                        {[
                                            { icon: Heart, title: 'Go to Prayer Room', copy: 'Pray privately or with the community.', href: '/prayer-room' },
                                            { icon: HeartHandshake, title: 'Talk to Pastoral Care', copy: 'Move to accountable human support and follow-up.', href: '/pastoral/hub' },
                                            { icon: MessageSquare, title: 'Share with Community', copy: 'Post testimony or encouragement on the community wall.', href: '/community-wall' },
                                            { icon: BookOpen, title: 'Continue the Word', copy: 'Take a passage into deeper study and reflection.', href: '/scripture/immersion' },
                                        ].map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link key={item.href} href={item.href} className="group block rounded-2xl border border-white/8 bg-white/[0.025] p-4 hover:border-amber-300/15 hover:bg-white/[0.05] transition-all">
                                                    <div className="flex items-start gap-3">
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-amber-300"><Icon className="h-4 w-4" /></span>
                                                        <span className="flex-1">
                                                            <span className="block text-xs font-semibold text-slate-200">{item.title}</span>
                                                            <span className="mt-1 block text-[10px] leading-relaxed text-slate-600">{item.copy}</span>
                                                        </span>
                                                        <ArrowRight className="mt-1 h-3.5 w-3.5 text-slate-700 group-hover:text-amber-300" />
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-white/8 bg-black/20 px-5 py-4">
                            <div className="flex items-start gap-2 text-[10px] leading-relaxed text-slate-600">
                                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                <span>Broadcast state is shown only from configured source data. No synthetic audience or spiritual-response metrics are displayed.</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
