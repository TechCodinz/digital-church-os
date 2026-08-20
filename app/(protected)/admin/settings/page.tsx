'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    ArrowRight,
    Bot,
    Church,
    CreditCard,
    Database,
    Globe,
    Loader2,
    LockKeyhole,
    Mail,
    Radio,
    Save,
    ShieldCheck,
    Sparkles,
    Volume2,
} from 'lucide-react';
import Link from 'next/link';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

type SafeSettings = {
    churchName: string;
    churchEmail: string;
    churchWebsite: string;
    streamUrl: string;
    streamTitle: string;
};

type IntegrationStatus = {
    openai: boolean;
    stripe: boolean;
    voice: boolean;
    email: boolean;
    paypal: boolean;
    coinbase: boolean;
};

const EMPTY_SETTINGS: SafeSettings = {
    churchName: '',
    churchEmail: '',
    churchWebsite: '',
    streamUrl: '',
    streamTitle: '',
};

const EMPTY_INTEGRATIONS: IntegrationStatus = {
    openai: false,
    stripe: false,
    voice: false,
    email: false,
    paypal: false,
    coinbase: false,
};

export default function AdminSettingsPage() {
    const { data: session, status } = useSession();
    const { theme } = useSanctuaryTheme();
    const [settings, setSettings] = useState<SafeSettings>(EMPTY_SETTINGS);
    const [integrations, setIntegrations] = useState<IntegrationStatus>(EMPTY_INTEGRATIONS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [persistentStorageConfigured, setPersistentStorageConfigured] = useState(true);
    const [credentialsManagedByEnvironment, setCredentialsManagedByEnvironment] = useState(true);

    const isLight = theme === 'light';
    const isAdmin = (session?.user as any)?.role === 'CHURCH_ADMIN';

    useEffect(() => {
        if (status === 'loading') return;
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        fetch('/api/admin/settings', { cache: 'no-store' })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok && response.status !== 503) throw new Error(data.error || 'Unable to load settings.');
                return data;
            })
            .then((data) => {
                setSettings({ ...EMPTY_SETTINGS, ...(data.settings || {}) });
                setIntegrations({ ...EMPTY_INTEGRATIONS, ...(data.integrations || {}) });
                setPersistentStorageConfigured(data.persistentStorageConfigured !== false);
                setCredentialsManagedByEnvironment(data.credentialsManagedByEnvironment !== false);
                if (data.error) setError(data.error);
            })
            .catch((loadError: any) => setError(loadError?.message || 'Unable to load settings.'))
            .finally(() => setLoading(false));
    }, [isAdmin, status]);

    const configuredCount = useMemo(() => Object.values(integrations).filter(Boolean).length, [integrations]);

    const saveSettings = async () => {
        setSaving(true);
        setMessage('');
        setError('');
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Settings could not be saved.');
            setSettings({ ...EMPTY_SETTINGS, ...(data.settings || settings) });
            setIntegrations({ ...EMPTY_INTEGRATIONS, ...(data.integrations || integrations) });
            setPersistentStorageConfigured(data.persistentStorageConfigured !== false);
            setCredentialsManagedByEnvironment(data.credentialsManagedByEnvironment !== false);
            setMessage('Non-secret church settings saved successfully.');
        } catch (saveError: any) {
            setError(saveError?.message || 'Settings could not be saved.');
        } finally {
            setSaving(false);
        }
    };

    const set = (key: keyof SafeSettings, value: string) => setSettings((current) => ({ ...current, [key]: value }));

    if (status === 'loading' || loading) {
        return (
            <div className={`min-h-screen pt-24 flex items-center justify-center ${isLight ? 'bg-[#f8f3eb]' : 'bg-[#020807] text-white'}`}>
                <div className="text-center">
                    <Loader2 className={`mx-auto h-7 w-7 animate-spin ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                    <p className={`mt-4 text-xs ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Loading safe church configuration…</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className={`min-h-screen pt-24 pb-24 ${isLight ? 'bg-[#f8f3eb] text-stone-900' : 'bg-[#020807] text-white'}`}>
                <div className="max-w-xl mx-auto px-4 py-20 text-center">
                    <LockKeyhole className={`mx-auto h-7 w-7 ${isLight ? 'text-stone-400' : 'text-slate-600'}`} />
                    <h1 className="mt-5 text-3xl font-light">Church-admin access required</h1>
                    <p className={`mt-3 text-sm leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>This configuration surface is restricted to authorized church administrators.</p>
                    <Link href="/dashboard" className={`mt-7 inline-flex items-center gap-2 text-xs font-bold ${isLight ? 'text-sage-700' : 'text-amber-300'}`}>Return to Personal Sanctuary <ArrowRight className="h-4 w-4" /></Link>
                </div>
            </div>
        );
    }

    const integrationCards = [
        { key: 'openai' as const, title: 'AI provider', icon: Bot, description: 'Scripture, prayer, study, and bounded assistant features.' },
        { key: 'stripe' as const, title: 'Stripe giving', icon: CreditCard, description: 'Secure checkout plus webhook confirmation.' },
        { key: 'voice' as const, title: 'Voice engine', icon: Volume2, description: 'Configured server-side TTS provider.' },
        { key: 'email' as const, title: 'Email delivery', icon: Mail, description: 'Receipts, notices, and ministry email delivery.' },
        { key: 'paypal' as const, title: 'PayPal', icon: CreditCard, description: 'Alternate payment rail; only shown active when secrets exist.' },
        { key: 'coinbase' as const, title: 'Coinbase Commerce', icon: Globe, description: 'Crypto rail readiness; not surfaced as active without credentials.' },
    ];

    return (
        <div className={`sanctuary-page-shell min-h-screen pt-24 pb-24 ${isLight ? 'bg-[#f8f3eb]/92 text-stone-900' : 'bg-[#020807]/92 text-white'}`}>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] px-6 py-10 sm:px-10 sm:py-12 text-white shadow-2xl shadow-black/25">
                    <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                    <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/18 bg-amber-300/7 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-amber-200">
                                <Church className="h-3.5 w-3.5" /> Church configuration
                            </div>
                            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.03]">Configure the sanctuary without putting secrets inside the sanctuary database.</h1>
                            <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-400">Manage public church identity and approved broadcast details here. API keys, webhook secrets, payment credentials, and provider tokens remain deployment-environment secrets and are never returned to this page.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                                <p className="text-3xl font-light">{configuredCount}/{Object.keys(integrations).length}</p>
                                <p className="mt-2 text-[9px] uppercase tracking-[0.17em] text-slate-500">integrations configured</p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                                <p className={`text-sm font-semibold ${persistentStorageConfigured ? 'text-emerald-300' : 'text-amber-300'}`}>{persistentStorageConfigured ? 'Ready' : 'Migration needed'}</p>
                                <p className="mt-2 text-[9px] uppercase tracking-[0.17em] text-slate-500">safe settings storage</p>
                            </div>
                            <div className="col-span-2 rounded-3xl border border-emerald-300/12 bg-emerald-300/[0.035] p-5">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                                    <p className="text-[11px] leading-relaxed text-slate-500">{credentialsManagedByEnvironment ? 'Provider credentials are environment-managed. This page exposes readiness only — never secret values.' : 'Credential-management state could not be confirmed.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {(message || error) && (
                    <div className={`mt-5 rounded-2xl border p-4 text-xs ${error ? isLight ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-rose-300/15 bg-rose-300/[0.04] text-rose-300' : isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-emerald-300/15 bg-emerald-300/[0.04] text-emerald-300'}`}>
                        {error || message}
                    </div>
                )}

                <section className="mt-8 grid xl:grid-cols-[1fr_0.85fr] gap-6 items-start">
                    <div className="space-y-6">
                        <div className={`rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-stone-200 bg-white/85 shadow-xl shadow-stone-200/20' : 'border-white/8 bg-white/[0.03]'}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Public identity</p>
                                    <h2 className={`mt-3 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>What members are allowed to see.</h2>
                                </div>
                                <Church className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                            </div>

                            <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                <Field label="Church name" value={settings.churchName} onChange={(value) => set('churchName', value)} placeholder="Your church name" isLight={isLight} />
                                <Field label="Public email" value={settings.churchEmail} onChange={(value) => set('churchEmail', value)} placeholder="hello@church.org" type="email" isLight={isLight} />
                                <div className="sm:col-span-2"><Field label="Public website" value={settings.churchWebsite} onChange={(value) => set('churchWebsite', value)} placeholder="https://church.org" type="url" isLight={isLight} /></div>
                            </div>
                        </div>

                        <div className={`rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-stone-200 bg-white/85' : 'border-white/8 bg-white/[0.03]'}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Approved broadcast</p>
                                    <h2 className={`mt-3 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Truthful Live Service source.</h2>
                                    <p className={`mt-3 text-xs leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Only approved HTTPS YouTube, Vimeo, or Twitch URLs are embedded by the public Live Service experience.</p>
                                </div>
                                <Radio className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-rose-300'}`} />
                            </div>

                            <div className="mt-7 space-y-4">
                                <Field label="Service title" value={settings.streamTitle} onChange={(value) => set('streamTitle', value)} placeholder="Sunday Worship" isLight={isLight} />
                                <Field label="Public stream URL" value={settings.streamUrl} onChange={(value) => set('streamUrl', value)} placeholder="https://www.youtube.com/watch?v=…" type="url" isLight={isLight} />
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <button onClick={saveSettings} disabled={saving || !persistentStorageConfigured} className={`sacred-focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold disabled:opacity-40 ${isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950'}`}>
                                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save non-secret settings</>}
                                </button>
                                <Link href="/live-service" className={`inline-flex min-h-12 items-center gap-2 rounded-2xl border px-5 text-sm font-bold ${isLight ? 'border-stone-200 text-stone-700' : 'border-white/10 text-slate-300'}`}>Preview Live Service <ArrowRight className="h-4 w-4" /></Link>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-6 xl:sticky xl:top-24">
                        <div className={`rounded-[2rem] border p-6 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.03]'}`}>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Integration readiness</p>
                                    <h2 className={`mt-3 text-2xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Secrets stay outside the UI.</h2>
                                </div>
                                <LockKeyhole className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                            </div>

                            <div className="mt-6 space-y-2">
                                {integrationCards.map((integration) => {
                                    const Icon = integration.icon;
                                    const ready = integrations[integration.key];
                                    return (
                                        <div key={integration.key} className={`rounded-2xl border p-4 ${ready ? isLight ? 'border-emerald-200 bg-emerald-50/70' : 'border-emerald-300/12 bg-emerald-300/[0.035]' : isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/7 bg-black/15'}`}>
                                            <div className="flex items-start gap-3">
                                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ready ? isLight ? 'bg-white text-emerald-700' : 'bg-emerald-300/8 text-emerald-300' : isLight ? 'bg-white text-stone-400' : 'bg-white/[0.035] text-slate-600'}`}><Icon className="h-4 w-4" /></span>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className={`text-xs font-semibold ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>{integration.title}</p>
                                                        <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${ready ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-300/10 text-emerald-300' : isLight ? 'bg-stone-100 text-stone-500' : 'bg-white/[0.04] text-slate-600'}`}>{ready ? 'Configured' : 'Not configured'}</span>
                                                    </div>
                                                    <p className={`mt-2 text-[10px] leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-600'}`}>{integration.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="sacred-panel-dark p-6 text-white">
                            <Database className="h-5 w-5 text-emerald-300" />
                            <h3 className="mt-4 text-lg font-semibold">Deployment-owned credentials</h3>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">OpenAI, Stripe, webhook, PayPal, Coinbase, voice-provider, and email-provider secrets belong in the deployment/VPS environment or a dedicated secret manager. This page intentionally has no secret-value inputs.</p>
                        </div>

                        <div className="sacred-panel-dark p-6 text-white">
                            <Sparkles className="h-5 w-5 text-amber-300" />
                            <h3 className="mt-4 text-lg font-semibold">Next architecture handoff</h3>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">When this Living Sanctuary experience is reconciled with Phase 11, these settings should inherit tenant-scoped church permissions rather than remain a global CHURCH_ADMIN surface.</p>
                        </div>
                    </aside>
                </section>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, type = 'text', isLight }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; isLight: boolean }) {
    return (
        <label className="block">
            <span className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>{label}</span>
            <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-300/15 ${isLight ? 'border-stone-200 bg-[#fbf8f3] text-stone-900 placeholder:text-stone-400' : 'border-white/8 bg-black/18 text-white placeholder:text-slate-700'}`} />
        </label>
    );
}
