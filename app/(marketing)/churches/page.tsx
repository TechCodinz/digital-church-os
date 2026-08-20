'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Building2,
    Globe,
    MapPin,
    Radio,
    Search,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

interface Church {
    id: string;
    name: string;
    city: string;
    country: string;
    denomination?: string | null;
    leadPastor?: string | null;
    memberCount?: number | null;
    streamUrl?: string | null;
    isLiveNow?: boolean;
    activities?: string[];
}

export default function GlobalChurchesPage() {
    const { theme } = useSanctuaryTheme();
    const [churches, setChurches] = useState<Church[]>([]);
    const [loading, setLoading] = useState(true);
    const [directoryReady, setDirectoryReady] = useState(true);
    const [query, setQuery] = useState('');

    const isLight = theme === 'light';

    useEffect(() => {
        fetch('/api/churches/global', { cache: 'no-store' })
            .then(async (response) => {
                if (!response.ok) throw new Error('Directory unavailable');
                return response.json();
            })
            .then((data) => {
                setChurches(Array.isArray(data.churches) ? data.churches : []);
                setDirectoryReady(data.directoryReady !== false);
            })
            .catch(() => {
                setChurches([]);
                setDirectoryReady(false);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredChurches = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return churches;
        return churches.filter((church) =>
            [church.name, church.city, church.country, church.denomination, church.leadPastor]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalized))
        );
    }, [churches, query]);

    return (
        <div className={`sanctuary-page-shell min-h-screen pt-24 pb-24 ${isLight ? 'bg-[#f8f3eb]/92 text-stone-900' : 'bg-[#020807]/92 text-white'}`}>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] px-6 py-10 sm:px-10 sm:py-12 text-white shadow-2xl shadow-black/20">
                    <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                    <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/7 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-emerald-200">
                                <Globe className="h-3.5 w-3.5" /> Verified church network
                            </div>
                            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.03]">Discover real congregations without simulated churches or fake live activity.</h1>
                            <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-400">Church profiles, locations, leaders, activities, and broadcasts should appear only when they come from an accountable church workspace and a real configured source.</p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Link href="/minister/onboard" className="sacred-primary-button group">Church leader onboarding <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
                                <Link href="/live-service" className="sacred-secondary-button"><Radio className="h-4 w-4" /> Worship</Link>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                            <ShieldCheck className="h-5 w-5 text-emerald-300" />
                            <h2 className="mt-4 text-lg font-semibold">Verified before visible</h2>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">The directory no longer invents churches, pastors, membership numbers, or “LIVE NOW” badges. Empty is better than false; the production church registry will populate this surface when connected.</p>
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    <div className={`rounded-3xl border p-3 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.025]'}`}>
                        <div className="relative">
                            <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${isLight ? 'text-stone-400' : 'text-slate-600'}`} />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search church name, city, country, denomination, or leader..."
                                className={`w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-300/15 ${isLight ? 'border-stone-100 bg-[#fbf8f3] text-stone-900 placeholder:text-stone-400' : 'border-white/7 bg-black/15 text-white placeholder:text-slate-700'}`}
                            />
                        </div>
                    </div>

                    <div className="mt-7 flex items-end justify-between gap-4">
                        <div>
                            <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Directory</p>
                            <h2 className={`mt-2 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Churches</h2>
                        </div>
                        <p className={`text-[10px] ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>{filteredChurches.length} verified {filteredChurches.length === 1 ? 'church' : 'churches'}</p>
                    </div>

                    {loading ? (
                        <div className="py-24 text-center">
                            <Sparkles className={`mx-auto h-6 w-6 animate-pulse ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                            <p className={`mt-4 text-xs ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>Checking the verified church directory…</p>
                        </div>
                    ) : filteredChurches.length === 0 ? (
                        <div className={`mt-6 rounded-[2rem] border border-dashed p-10 sm:p-14 text-center ${isLight ? 'border-stone-200 bg-white/60' : 'border-white/10 bg-white/[0.02]'}`}>
                            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${isLight ? 'border-stone-200 bg-white text-sage-700' : 'border-white/8 bg-white/[0.035] text-emerald-300'}`}><Building2 className="h-6 w-6" /></div>
                            <h3 className={`mt-6 text-2xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>{query ? 'No verified church matches that search.' : directoryReady ? 'No churches are published yet.' : 'The verified tenant directory is not connected on this branch yet.'}</h3>
                            <p className={`mt-3 max-w-2xl mx-auto text-sm leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>We deliberately show no synthetic fallback data. Church leaders can begin the onboarding journey, and public discovery should activate only after the authoritative workspace registry is connected.</p>
                            <Link href="/minister/onboard" className={`mt-7 inline-flex items-center gap-2 text-xs font-bold ${isLight ? 'text-sage-700' : 'text-amber-300'}`}>Church leader pathway <ArrowRight className="h-3.5 w-3.5" /></Link>
                        </div>
                    ) : (
                        <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredChurches.map((church, index) => (
                                <motion.article
                                    key={church.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.04, 0.2) }}
                                    className={`rounded-[2rem] border p-6 transition-all ${isLight ? 'border-stone-200 bg-white/85 hover:border-sage-300 hover:shadow-xl' : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.05] hover:border-emerald-300/14'}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isLight ? 'bg-sage-50 text-sage-700' : 'bg-emerald-300/8 text-emerald-300'}`}><Building2 className="h-5 w-5" /></span>
                                        {church.isLiveNow && church.streamUrl && <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/18 bg-rose-300/7 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-rose-300"><Radio className="h-3 w-3" /> Live source</span>}
                                    </div>
                                    <h3 className={`mt-5 text-xl font-semibold ${isLight ? 'text-stone-900' : 'text-white'}`}>{church.name}</h3>
                                    <p className={`mt-2 flex items-center gap-2 text-xs ${isLight ? 'text-stone-500' : 'text-slate-500'}`}><MapPin className="h-3.5 w-3.5" /> {church.city}, {church.country}</p>
                                    {church.denomination && <p className={`mt-3 text-xs ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>{church.denomination}</p>}
                                    {church.leadPastor && <p className={`mt-1 text-xs ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Leader: {church.leadPastor}</p>}
                                    {typeof church.memberCount === 'number' && <p className={`mt-3 flex items-center gap-2 text-[10px] ${isLight ? 'text-stone-400' : 'text-slate-600'}`}><Users className="h-3.5 w-3.5" /> {church.memberCount.toLocaleString()} members</p>}
                                    {church.activities?.length ? <div className="mt-5 flex flex-wrap gap-2">{church.activities.slice(0, 4).map((activity) => <span key={activity} className={`rounded-full border px-2.5 py-1 text-[9px] ${isLight ? 'border-stone-200 bg-[#fbf8f3] text-stone-500' : 'border-white/8 bg-black/15 text-slate-500'}`}>{activity}</span>)}</div> : null}
                                </motion.article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
