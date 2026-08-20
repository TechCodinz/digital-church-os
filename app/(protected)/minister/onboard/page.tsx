'use client';

import { useEffect, useState } from 'react';
import {
    ArrowRight,
    BookOpen,
    Building2,
    CheckCircle2,
    Globe,
    HeartHandshake,
    Loader2,
    Radio,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

const DENOMINATIONS = [
    'Evangelical',
    'Pentecostal / Charismatic',
    'Baptist',
    'Reformed / Presbyterian',
    'Anglican / Episcopal',
    'Methodist',
    'Lutheran',
    'Catholic',
    'Orthodox',
    'Non-Denominational',
];

const WORSHIP_STYLES = [
    'Expositional / Evangelical',
    'Charismatic / Pentecostal',
    'Liturgical / Traditional',
    'Reformed',
    'Contemporary',
];

const GUIDANCE_STYLES = [
    'Scholarly & Exegetical',
    'Pastoral & Encouraging',
    'Gentle Reflection',
    'Concise Scripture Study',
];

export default function MinisterOnboardPage() {
    const { theme } = useSanctuaryTheme();
    const [onboardingReady, setOnboardingReady] = useState(false);
    const [checking, setChecking] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        churchName: '',
        denomination: 'Evangelical',
        country: '',
        city: '',
        preferredWorshipStyle: 'Expositional / Evangelical',
        guidanceStyle: 'Scholarly & Exegetical',
    });

    const isLight = theme === 'light';

    useEffect(() => {
        fetch('/api/minister/portal', { cache: 'no-store' })
            .then(async (response) => response.ok ? response.json() : null)
            .then((data) => setOnboardingReady(Boolean(data?.onboardingReady)))
            .catch(() => setOnboardingReady(false))
            .finally(() => setChecking(false));
    }, []);

    const update = (key: keyof typeof form, value: string) => setForm((previous) => ({ ...previous, [key]: value }));

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/minister/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Church workspace could not be created.');
            setError('');
        } catch (submitError: any) {
            setError(submitError?.message || 'Church workspace could not be created.');
        } finally {
            setSubmitting(false);
        }
    };

    const capabilityCards = [
        { icon: Users, title: 'Tenant-safe team roles', copy: 'Owners, pastors, staff, and viewers need church-scoped permissions rather than global product roles.' },
        { icon: Radio, title: 'Truthful broadcast', copy: 'Approved stream sources only, with no fabricated viewer counts, timers, or reactions.' },
        { icon: BookOpen, title: 'Teaching & formation', copy: 'Scripture study, sermon preparation, prayer, discipleship, and care with clear AI boundaries.' },
        { icon: HeartHandshake, title: 'Pastoral continuity', copy: 'Care, follow-up, prayer, events, and ministry activity should remain accountable to real people.' },
    ];

    return (
        <div className={`sanctuary-page-shell min-h-screen pt-24 pb-24 ${isLight ? 'bg-[#f8f3eb]/92 text-stone-900' : 'bg-[#020807]/92 text-white'}`}>
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] px-6 py-10 sm:px-10 sm:py-12 text-white shadow-2xl">
                    <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                    <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/18 bg-amber-300/7 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-amber-200">
                                <Building2 className="h-3.5 w-3.5" /> Church leader workspace
                            </div>
                            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.03]">Bring a real church into a workspace built for real ministry.</h1>
                            <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-400">Configure church identity, worship tradition, study style, broadcast, teams, pastoral care, and community operations — but only claim activation after the tenant-safe workspace is actually persisted.</p>
                        </div>

                        <div className={`rounded-3xl border p-6 ${onboardingReady ? 'border-emerald-300/18 bg-emerald-300/[0.045]' : 'border-amber-300/16 bg-amber-300/[0.035]'}`}>
                            {checking ? <Loader2 className="h-5 w-5 animate-spin text-amber-300" /> : onboardingReady ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <ShieldCheck className="h-5 w-5 text-amber-300" />}
                            <h2 className="mt-4 text-lg font-semibold">{checking ? 'Checking workspace registry' : onboardingReady ? 'Workspace registry connected' : 'Tenant-safe registry required'}</h2>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">{onboardingReady ? 'This environment can create a persistent church workspace.' : 'This experience branch intentionally fails closed rather than creating an in-memory church and falsely saying it is live.'}</p>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {capabilityCards.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.title} className={`rounded-3xl border p-5 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.03]'}`}>
                                <Icon className={`h-4 w-4 ${isLight ? 'text-sage-700' : 'text-emerald-300'}`} />
                                <h3 className={`mt-4 text-sm font-semibold ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>{item.title}</h3>
                                <p className={`mt-2 text-[11px] leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-600'}`}>{item.copy}</p>
                            </div>
                        );
                    })}
                </section>

                <section className={`mt-8 rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-stone-200 bg-white/85 shadow-xl shadow-stone-200/20' : 'border-white/8 bg-white/[0.03]'}`}>
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                        <div>
                            <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Workspace profile</p>
                            <h2 className={`mt-3 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Prepare the church identity</h2>
                            <p className={`mt-3 max-w-2xl text-sm leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>These settings describe the ministry. AI guidance style affects presentation only; it never grants an AI prophetic, revelatory, or pastoral-office identity.</p>
                        </div>
                        <Link href="/churches" className={`inline-flex items-center gap-2 text-xs font-bold ${isLight ? 'text-sage-700' : 'text-amber-300'}`}><Globe className="h-4 w-4" /> View church directory</Link>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Minister full name" value={form.fullName} onChange={(value) => update('fullName', value)} placeholder="Name" isLight={isLight} />
                            <Field label="Ministry email" value={form.email} onChange={(value) => update('email', value)} placeholder="pastor@church.org" type="email" isLight={isLight} />
                        </div>
                        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-4">
                            <Field label="Church / ministry name" value={form.churchName} onChange={(value) => update('churchName', value)} placeholder="Church name" isLight={isLight} />
                            <SelectField label="Denomination / tradition" value={form.denomination} onChange={(value) => update('denomination', value)} options={DENOMINATIONS} isLight={isLight} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Country" value={form.country} onChange={(value) => update('country', value)} placeholder="Country" isLight={isLight} />
                            <Field label="City" value={form.city} onChange={(value) => update('city', value)} placeholder="City" isLight={isLight} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <SelectField label="Worship style" value={form.preferredWorshipStyle} onChange={(value) => update('preferredWorshipStyle', value)} options={WORSHIP_STYLES} isLight={isLight} />
                            <SelectField label="AI guidance presentation" value={form.guidanceStyle} onChange={(value) => update('guidanceStyle', value)} options={GUIDANCE_STYLES} isLight={isLight} />
                        </div>

                        {error && <div className={`rounded-2xl border p-4 text-xs leading-relaxed ${isLight ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-amber-300/15 bg-amber-300/[0.04] text-amber-200'}`}>{error}</div>}

                        <button
                            type="submit"
                            disabled={submitting || !onboardingReady}
                            className={`sacred-focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-45 ${isLight ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-amber-200 text-slate-950 hover:bg-amber-100'}`}
                        >
                            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating persistent workspace…</> : onboardingReady ? <><Sparkles className="h-4 w-4" /> Create church workspace</> : <><ShieldCheck className="h-4 w-4" /> Workspace registry connection required</>}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, type = 'text', isLight }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; isLight: boolean }) {
    return (
        <label className="block">
            <span className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>{label}</span>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                required
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-300/15 ${isLight ? 'border-stone-200 bg-[#fbf8f3] text-stone-900 placeholder:text-stone-400' : 'border-white/8 bg-black/18 text-white placeholder:text-slate-700'}`}
            />
        </label>
    );
}

function SelectField({ label, value, onChange, options, isLight }: { label: string; value: string; onChange: (value: string) => void; options: string[]; isLight: boolean }) {
    return (
        <label className="block">
            <span className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>{label}</span>
            <select value={value} onChange={(event) => onChange(event.target.value)} className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-300/15 ${isLight ? 'border-stone-200 bg-[#fbf8f3] text-stone-900' : 'border-white/8 bg-[#07110f] text-white'}`}>
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
        </label>
    );
}
