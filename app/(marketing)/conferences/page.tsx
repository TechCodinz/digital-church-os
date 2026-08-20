'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    Globe,
    Loader2,
    MapPin,
    Radio,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';
import { ScriptureReference } from '@/components/scripture/ScriptureReference';

type Filter = 'UPCOMING' | 'LIVE' | 'COMPLETED';

type Conference = {
    id: string;
    title: string;
    theme?: string | null;
    scriptureRefs?: string[];
    startDate: string;
    endDate: string;
    status: Filter;
    location?: string | null;
    virtualRoomLink?: string | null;
    maxAttendees?: number | null;
    attendees?: Array<{ userId?: string; attended?: boolean }>;
};

function formatDate(value: string) {
    return new Date(value).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ConferencesPage() {
    const { data: session } = useSession();
    const { theme } = useSanctuaryTheme();
    const [filter, setFilter] = useState<Filter>('UPCOMING');
    const [conferences, setConferences] = useState<Conference[]>([]);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState<'database' | 'database-unavailable' | 'error'>('database');
    const [rsvped, setRsvped] = useState<Record<string, boolean>>({});
    const [rsvping, setRsvping] = useState<string | null>(null);
    const [error, setError] = useState('');

    const isLight = theme === 'light';

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`/api/conferences?status=${filter}`, { cache: 'no-store' });
                if (!response.ok) throw new Error('Unable to load gatherings');
                const data = await response.json();
                setConferences(Array.isArray(data) ? data : []);
                const header = response.headers.get('X-Conference-Source');
                setSource(header === 'database-unavailable' || header === 'error' ? header : 'database');
            } catch {
                setConferences([]);
                setSource('error');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [filter]);

    const stats = useMemo(() => ({
        events: conferences.length,
        registrations: conferences.reduce((sum, conference) => sum + (conference.attendees?.length || 0), 0),
    }), [conferences]);

    const handleRSVP = async (conference: Conference) => {
        if (!session) {
            window.location.href = '/auth/signin';
            return;
        }
        if (rsvped[conference.id] || rsvping) return;

        setRsvping(conference.id);
        setError('');
        const previous = conferences;
        setRsvped((current) => ({ ...current, [conference.id]: true }));
        setConferences((current) => current.map((item) => item.id === conference.id ? { ...item, attendees: [...(item.attendees || []), { userId: 'me', attended: false }] } : item));

        try {
            const response = await fetch('/api/conferences/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conferenceId: conference.id }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Registration failed');
        } catch (submitError: any) {
            setConferences(previous);
            setRsvped((current) => ({ ...current, [conference.id]: false }));
            setError(submitError?.message || 'Registration could not be saved.');
        } finally {
            setRsvping(null);
        }
    };

    return (
        <div className={`sanctuary-page-shell min-h-screen pt-24 pb-24 ${isLight ? 'bg-[#f8f3eb]/92 text-stone-900' : 'bg-[#020807]/92 text-white'}`}>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] px-6 py-10 sm:px-10 sm:py-12 text-white shadow-2xl shadow-black/25">
                    <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                    <div className="relative grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/18 bg-amber-300/7 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-amber-200">
                                <Calendar className="h-3.5 w-3.5" /> Gatherings & conferences
                            </div>
                            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.03]">Move from discovering a gathering to arriving prepared for it.</h1>
                            <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-400">Real church events, conferences, streams, Scripture anchors, registration, and post-event continuity in one cinematic gathering journey — without placeholder conferences when the database is offline.</p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Link href="/live-service" className="sacred-primary-button"><Radio className="h-4 w-4" /> Enter worship</Link>
                                <Link href="/churches" className="sacred-secondary-button"><Globe className="h-4 w-4" /> Church network</Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                                <p className="text-3xl font-light">{stats.events}</p>
                                <p className="mt-2 text-[9px] uppercase tracking-[0.17em] text-slate-500">{filter.toLowerCase()} gatherings</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                                <p className="text-3xl font-light">{stats.registrations}</p>
                                <p className="mt-2 text-[9px] uppercase tracking-[0.17em] text-slate-500">visible registrations</p>
                            </div>
                            <div className="col-span-2 rounded-3xl border border-emerald-300/12 bg-emerald-300/[0.035] p-5">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                                    <p className="text-[11px] leading-relaxed text-slate-500">The gathering list now uses database-backed records only. If the database is unavailable, the page shows an honest unavailable state instead of synthetic conferences.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    <div className={`rounded-3xl border p-2 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.025]'}`}>
                        <div className="grid grid-cols-3 gap-2">
                            {(['UPCOMING', 'LIVE', 'COMPLETED'] as Filter[]).map((status) => (
                                <button key={status} onClick={() => setFilter(status)} className={`sacred-focus-ring rounded-2xl px-3 py-3 text-[10px] sm:text-xs font-bold transition-all ${filter === status ? isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950' : isLight ? 'text-stone-500 hover:bg-stone-50' : 'text-slate-500 hover:bg-white/[0.04]'}`}>
                                    {status === 'UPCOMING' ? 'Upcoming' : status === 'LIVE' ? 'Live now' : 'Completed'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div className={`mt-4 rounded-2xl border p-4 text-xs ${isLight ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-rose-300/15 bg-rose-300/[0.04] text-rose-300'}`}>{error}</div>}

                    {loading ? (
                        <div className="py-24 text-center">
                            <Loader2 className={`mx-auto h-7 w-7 animate-spin ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                            <p className={`mt-4 text-xs ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>Gathering real event records…</p>
                        </div>
                    ) : conferences.length === 0 ? (
                        <div className={`mt-6 rounded-[2rem] border border-dashed p-10 sm:p-14 text-center ${isLight ? 'border-stone-200 bg-white/60' : 'border-white/10 bg-white/[0.02]'}`}>
                            <Calendar className={`mx-auto h-7 w-7 ${isLight ? 'text-stone-300' : 'text-slate-700'}`} />
                            <h2 className={`mt-5 text-2xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>{source === 'database-unavailable' ? 'The gatherings database is unavailable right now.' : source === 'error' ? 'Gatherings could not be loaded.' : `No ${filter.toLowerCase()} gatherings are published.`}</h2>
                            <p className={`mt-3 max-w-2xl mx-auto text-sm leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>No demo conference is being substituted. When a real gathering is published, it will appear here with its actual dates, location, registration state, and Scripture references.</p>
                        </div>
                    ) : (
                        <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {conferences.map((conference, index) => {
                                const attendeeCount = conference.attendees?.length || 0;
                                const atCapacity = typeof conference.maxAttendees === 'number' && attendeeCount >= conference.maxAttendees;
                                const canJoin = conference.status === 'LIVE' && Boolean(conference.virtualRoomLink);
                                return (
                                    <motion.article key={conference.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.2) }} className={`group rounded-[2rem] border p-6 transition-all ${isLight ? 'border-stone-200 bg-white/85 hover:border-sage-300 hover:shadow-xl hover:shadow-stone-200/20' : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.05] hover:border-emerald-300/14'}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] ${conference.status === 'LIVE' ? 'border-rose-300/18 bg-rose-300/[0.06] text-rose-400' : conference.status === 'UPCOMING' ? isLight ? 'border-sage-200 bg-sage-50 text-sage-700' : 'border-emerald-300/14 bg-emerald-300/[0.045] text-emerald-300' : isLight ? 'border-stone-200 bg-stone-50 text-stone-500' : 'border-white/8 bg-white/[0.03] text-slate-500'}`}>
                                                {conference.status === 'LIVE' && <Radio className="h-3 w-3" />}{conference.status}
                                            </span>
                                            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isLight ? 'bg-[#fbf8f3] text-sage-700' : 'bg-white/[0.04] text-amber-300'}`}><Sparkles className="h-4 w-4" /></span>
                                        </div>

                                        <h2 className={`mt-6 text-2xl font-medium tracking-tight ${isLight ? 'text-stone-900' : 'text-white'}`}>{conference.title}</h2>
                                        {conference.theme && <p className={`mt-2 text-sm leading-relaxed ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>{conference.theme}</p>}

                                        <div className={`mt-5 space-y-3 text-xs ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>
                                            <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {formatDate(conference.startDate)}</p>
                                            <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {formatTime(conference.startDate)} – {formatTime(conference.endDate)}</p>
                                            <p className="flex items-center gap-2">{conference.virtualRoomLink ? <><Globe className="h-4 w-4" /> Virtual gathering</> : <><MapPin className="h-4 w-4" /> {conference.location || 'Location not published'}</>}</p>
                                            <p className="flex items-center gap-2"><Users className="h-4 w-4" /> {attendeeCount} registered{conference.maxAttendees ? ` / ${conference.maxAttendees}` : ''}</p>
                                        </div>

                                        {conference.scriptureRefs?.length ? (
                                            <div className="mt-5">
                                                <p className={`text-[9px] uppercase tracking-[0.17em] font-bold ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>Scripture anchors</p>
                                                <div className="mt-2 flex flex-wrap gap-2">{conference.scriptureRefs.slice(0, 4).map((reference) => <ScriptureReference key={reference} reference={reference} />)}</div>
                                            </div>
                                        ) : null}

                                        <div className={`mt-6 border-t pt-5 ${isLight ? 'border-stone-100' : 'border-white/7'}`}>
                                            {canJoin ? (
                                                <a href={conference.virtualRoomLink!} target="_blank" rel="noreferrer noopener" className={`sacred-focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl text-xs font-bold ${isLight ? 'bg-stone-900 text-white' : 'bg-rose-400 text-slate-950'}`}>Join published room <ExternalLink className="h-4 w-4" /></a>
                                            ) : conference.status === 'UPCOMING' ? (
                                                <button onClick={() => handleRSVP(conference)} disabled={rsvped[conference.id] || rsvping === conference.id || atCapacity} className={`sacred-focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl text-xs font-bold transition-all disabled:opacity-45 ${rsvped[conference.id] ? isLight ? 'bg-sage-100 text-sage-800' : 'bg-emerald-300/10 text-emerald-300' : isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950'}`}>
                                                    {rsvping === conference.id ? <Loader2 className="h-4 w-4 animate-spin" /> : rsvped[conference.id] ? <><CheckCircle2 className="h-4 w-4" /> Registered</> : atCapacity ? 'At capacity' : <><CheckCircle2 className="h-4 w-4" /> Register</>}
                                                </button>
                                            ) : (
                                                <Link href="/journal" className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border text-xs font-bold ${isLight ? 'border-stone-200 text-stone-600' : 'border-white/8 text-slate-400'}`}><BookOpen className="h-4 w-4" /> Reflect after gathering <ArrowRight className="h-4 w-4" /></Link>
                                            )}
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
