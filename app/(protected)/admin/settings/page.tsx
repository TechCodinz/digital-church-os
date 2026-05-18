'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Tv, Bell, CreditCard, Shield, Users, Globe,
    Save, Eye, EyeOff, CheckCircle, AlertCircle, Loader2,
    ChevronRight, Broadcast, Key, Mail, Database, Palette,
    Volume2, Zap, ToggleLeft, ToggleRight, Church
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// ── Section Types ─────────────────────────────────────────────────────────────
interface SettingSection {
    id: string;
    label: string;
    icon: any;
    description: string;
}

const SECTIONS: SettingSection[] = [
    { id: 'church', label: 'Church Identity', icon: Church, description: 'Name, branding, EIN, contact info' },
    { id: 'stream', label: 'Live Stream', icon: Broadcast, description: 'Stream URLs, service schedule' },
    { id: 'ai', label: 'AI Modules', icon: Zap, description: 'Enable/disable AI features, API keys' },
    { id: 'voice', label: 'Voice Engine', icon: Volume2, description: 'TTS provider, voice profiles' },
    { id: 'payments', label: 'Payments', icon: CreditCard, description: 'Stripe, PayPal, crypto provider keys' },
    { id: 'email', label: 'Email & Notifications', icon: Mail, description: 'Resend, notification preferences' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Auth providers, rate limits, session settings' },
    { id: 'users', label: 'User Management', icon: Users, description: 'Roles, default permissions, onboarding' },
];

// ── Toggle Component ───────────────────────────────────────────────────────────
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-sage-500' : 'bg-stone-300'}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );
}

// ── Masked Input ───────────────────────────────────────────────────────────────
function SecretInput({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-sage-400 focus:outline-none bg-white"
                />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-2.5 text-stone-400">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
}

// ── Text Input ─────────────────────────────────────────────────────────────────
function TextInput({ value, onChange, placeholder, label, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; type?: string }) {
    return (
        <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-sage-400 focus:outline-none bg-white"
            />
        </div>
    );
}

export default function AdminSettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState('church');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // ── Complete settings state ─────────────────────────────────────────────
    const [settings, setSettings] = useState({
        // Church Identity
        churchName: 'Digital Church OS',
        churchTagline: 'Where Faith Meets Technology',
        churchEIN: '',
        churchEmail: '',
        churchWebsite: '',
        churchPhone: '',
        churchAddress: '',

        // Live Stream
        streamUrl: '',
        streamBackupUrl: '',
        streamType: 'youtube', // youtube | twitch | custom | vimeo
        serviceDay: 'Sunday',
        serviceTime: '10:00',
        serviceTimezone: 'America/New_York',
        streamTitle: 'Sunday Morning Worship',
        streamAutoStart: false,

        // AI Modules
        openaiApiKey: '',
        aiPastorEnabled: true,
        aiPrayerWarriorEnabled: true,
        aiCounselorEnabled: true,
        aiChildrenEnabled: true,
        aiSermonEnabled: true,
        aiScriptureEnabled: true,
        aiMaxRequestsPerMinute: 20,

        // Voice Engine
        elevenLabsApiKey: '',
        voiceProvider: 'openai', // elevenlabs | openai | browser
        voiceSermonId: '',
        voicePrayerId: '',
        voiceScriptureId: '',
        voiceChildrenId: '',

        // Payments
        stripeSecretKey: '',
        stripePublishableKey: '',
        stripeWebhookSecret: '',
        paypalClientId: '',
        paypalClientSecret: '',
        coinbaseCommerceApiKey: '',
        bitpayApiKey: '',
        churchWallet: '',
        organizationEIN: '',

        // Email
        resendApiKey: '',
        emailFrom: 'noreply@digitalchurchos.com',
        welcomeEmailEnabled: true,
        prayerReminderEmailEnabled: true,
        donationReceiptEmailEnabled: true,
        weeklyDigestEnabled: false,

        // Security
        sessionMaxAge: 30,
        requireEmailVerification: false,
        enableGoogleAuth: true,
        enableEmailAuth: true,
        rateLimitAI: 20,
        rateLimitAnon: 5,

        // Users
        defaultRole: 'MEMBER',
        requireOnboarding: true,
        allowSelfRegistration: true,
        memberApprovalRequired: false,
    });

    useEffect(() => {
        // Load saved settings from API
        fetch('/api/admin/settings')
            .then(r => r.json())
            .then(data => { if (data && !data.error) setSettings(s => ({ ...s, ...data })); })
            .catch(() => { });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            // show error
        } finally {
            setSaving(false);
        }
    };

    const set = (key: string, value: any) => setSettings(s => ({ ...s, [key]: value }));

    // ── Section Renderers ─────────────────────────────────────────────────────
    const renderSection = () => {
        switch (activeSection) {
            case 'church': return (
                <div className="space-y-5">
                    <TextInput label="Church Name" value={settings.churchName} onChange={v => set('churchName', v)} placeholder="Grace Community Church" />
                    <TextInput label="Tagline" value={settings.churchTagline} onChange={v => set('churchTagline', v)} placeholder="Where faith meets community" />
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput label="EIN (Tax ID)" value={settings.churchEIN} onChange={v => set('churchEIN', v)} placeholder="12-3456789" />
                        <TextInput label="Phone" value={settings.churchPhone} onChange={v => set('churchPhone', v)} placeholder="+1 (555) 000-0000" />
                    </div>
                    <TextInput label="Email" value={settings.churchEmail} onChange={v => set('churchEmail', v)} placeholder="admin@yourchurch.com" type="email" />
                    <TextInput label="Website" value={settings.churchWebsite} onChange={v => set('churchWebsite', v)} placeholder="https://yourchurch.com" />
                    <TextInput label="Address" value={settings.churchAddress} onChange={v => set('churchAddress', v)} placeholder="123 Faith Street, Springfield, IL 62701" />
                </div>
            );

            case 'stream': return (
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Stream Type</label>
                        <select value={settings.streamType} onChange={e => set('streamType', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-sage-400 focus:outline-none">
                            <option value="youtube">YouTube Live</option>
                            <option value="vimeo">Vimeo Live</option>
                            <option value="twitch">Twitch</option>
                            <option value="custom">Custom RTMP / HLS URL</option>
                        </select>
                    </div>
                    <TextInput label="Primary Stream URL" value={settings.streamUrl} onChange={v => set('streamUrl', v)} placeholder="https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID" />
                    <TextInput label="Backup Stream URL (optional)" value={settings.streamBackupUrl} onChange={v => set('streamBackupUrl', v)} placeholder="https://backup-stream.yourchurch.com/live" />
                    <TextInput label="Service Title" value={settings.streamTitle} onChange={v => set('streamTitle', v)} placeholder="Sunday Morning Worship" />
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Service Day</label>
                            <select value={settings.serviceDay} onChange={e => set('serviceDay', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm">
                                {['Sunday', 'Saturday', 'Friday', 'Wednesday'].map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <TextInput label="Service Time" value={settings.serviceTime} onChange={v => set('serviceTime', v)} placeholder="10:00" type="time" />
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Timezone</label>
                            <select value={settings.serviceTimezone} onChange={e => set('serviceTimezone', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm">
                                {['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Africa/Lagos'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div>
                            <p className="text-sm font-medium text-stone-700">Auto-start stream at service time</p>
                            <p className="text-xs text-stone-400">Automatically show the live player when service starts</p>
                        </div>
                        <Toggle enabled={settings.streamAutoStart} onToggle={() => set('streamAutoStart', !settings.streamAutoStart)} />
                    </div>
                    {settings.streamUrl && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
                            <CheckCircle size={16} /> Stream URL configured — the live service player will embed this stream.
                        </div>
                    )}
                </div>
            );

            case 'ai': return (
                <div className="space-y-5">
                    <SecretInput label="OpenAI API Key" value={settings.openaiApiKey} onChange={v => set('openaiApiKey', v)} placeholder="sk-..." />
                    <p className="text-xs text-stone-400 -mt-3">Powers all AI Modules: Pastor, Prayer Warrior, Counselor, Children, Sermon Engine, Scripture Depth</p>
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider pt-2">Enable / Disable AI Modules</div>
                    {[
                        { key: 'aiPastorEnabled', label: 'AI Pastor', desc: 'Personal pastoral counseling & sermons' },
                        { key: 'aiPrayerWarriorEnabled', label: 'Prayer Warriors', desc: 'AI-powered intercession & prayer guidance' },
                        { key: 'aiCounselorEnabled', label: 'AI Counselor', desc: 'Emotional & spiritual support counseling' },
                        { key: 'aiChildrenEnabled', label: "Children's Ministry AI", desc: 'Bible stories, games, moral lessons' },
                        { key: 'aiSermonEnabled', label: 'Sermon Generator', desc: 'Full sermon outline generation' },
                        { key: 'aiScriptureEnabled', label: 'Scripture Depth Engine', desc: 'Multi-translation scripture excavation' },
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                            <div>
                                <p className="text-sm font-medium text-stone-700">{label}</p>
                                <p className="text-xs text-stone-400">{desc}</p>
                            </div>
                            <Toggle enabled={(settings as any)[key]} onToggle={() => set(key, !(settings as any)[key])} />
                        </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Requests/min (Authenticated)</label>
                            <input type="number" min={1} max={100} value={settings.aiMaxRequestsPerMinute} onChange={e => set('aiMaxRequestsPerMinute', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Requests/min (Anonymous)</label>
                            <input type="number" min={1} max={20} value={settings.rateLimitAnon} onChange={e => set('rateLimitAnon', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm" />
                        </div>
                    </div>
                </div>
            );

            case 'voice': return (
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Voice Provider</label>
                        <select value={settings.voiceProvider} onChange={e => set('voiceProvider', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm">
                            <option value="elevenlabs">⚡ ElevenLabs (Ultra-realistic)</option>
                            <option value="openai">🤖 OpenAI TTS-HD (High quality)</option>
                            <option value="browser">🌐 Browser Web Speech (Free, device)</option>
                        </select>
                    </div>
                    <SecretInput label="ElevenLabs API Key" value={settings.elevenLabsApiKey} onChange={v => set('elevenLabsApiKey', v)} placeholder="elevenlabs_key_..." />
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                        💡 ElevenLabs gives the most realistic preacher voice. Get a free key at elevenlabs.io — 10,000 characters/month free.
                    </div>
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider pt-2">ElevenLabs Voice IDs (per context)</div>
                    <p className="text-xs text-stone-400 -mt-2">Find voice IDs at elevenlabs.io/voice-library. Leave blank to use defaults.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput label="Sermon Voice ID" value={settings.voiceSermonId} onChange={v => set('voiceSermonId', v)} placeholder="pNInz6obpgDQGcFmaJgB" />
                        <TextInput label="Prayer Voice ID" value={settings.voicePrayerId} onChange={v => set('voicePrayerId', v)} placeholder="EXAVITQu4vr4xnSDxMaL" />
                        <TextInput label="Scripture Voice ID" value={settings.voiceScriptureId} onChange={v => set('voiceScriptureId', v)} placeholder="VR6AewLTigWG4xSOukaG" />
                        <TextInput label="Children Voice ID" value={settings.voiceChildrenId} onChange={v => set('voiceChildrenId', v)} placeholder="MF3mGyEYCl7XYWbV9V6O" />
                    </div>
                </div>
            );

            case 'payments': return (
                <div className="space-y-5">
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Stripe (Cards, USDC, Apple/Google Pay)</div>
                    <SecretInput label="Stripe Secret Key" value={settings.stripeSecretKey} onChange={v => set('stripeSecretKey', v)} placeholder="sk_live_..." />
                    <TextInput label="Stripe Publishable Key" value={settings.stripePublishableKey} onChange={v => set('stripePublishableKey', v)} placeholder="pk_live_..." />
                    <SecretInput label="Stripe Webhook Secret" value={settings.stripeWebhookSecret} onChange={v => set('stripeWebhookSecret', v)} placeholder="whsec_..." />
                    <div className="border-t border-stone-100 pt-4 text-xs font-bold text-stone-500 uppercase tracking-wider">PayPal</div>
                    <TextInput label="PayPal Client ID" value={settings.paypalClientId} onChange={v => set('paypalClientId', v)} placeholder="AYjzAs..." />
                    <SecretInput label="PayPal Client Secret" value={settings.paypalClientSecret} onChange={v => set('paypalClientSecret', v)} placeholder="EBhBJq..." />
                    <div className="border-t border-stone-100 pt-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Crypto Providers</div>
                    <SecretInput label="Coinbase Commerce API Key" value={settings.coinbaseCommerceApiKey} onChange={v => set('coinbaseCommerceApiKey', v)} placeholder="coinbase_key..." />
                    <SecretInput label="BitPay API Key" value={settings.bitpayApiKey} onChange={v => set('bitpayApiKey', v)} placeholder="bitpay_key..." />
                    <TextInput label="Church Crypto Wallet Address (non-custodial)" value={settings.churchWallet} onChange={v => set('churchWallet', v)} placeholder="0x..." />
                </div>
            );

            case 'email': return (
                <div className="space-y-5">
                    <SecretInput label="Resend API Key" value={settings.resendApiKey} onChange={v => set('resendApiKey', v)} placeholder="re_..." />
                    <TextInput label="From Email Address" value={settings.emailFrom} onChange={v => set('emailFrom', v)} placeholder="noreply@yourchurch.com" type="email" />
                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider pt-2">Email Triggers</div>
                    {[
                        { key: 'welcomeEmailEnabled', label: 'Welcome Email', desc: 'Send on new user registration' },
                        { key: 'donationReceiptEmailEnabled', label: 'Donation Receipts', desc: 'Tax receipt after every offering' },
                        { key: 'prayerReminderEmailEnabled', label: 'Prayer Reminders', desc: 'Daily cron prayer notifications' },
                        { key: 'weeklyDigestEnabled', label: 'Weekly Digest', desc: 'Sunday activity summary email' },
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                            <div>
                                <p className="text-sm font-medium text-stone-700">{label}</p>
                                <p className="text-xs text-stone-400">{desc}</p>
                            </div>
                            <Toggle enabled={(settings as any)[key]} onToggle={() => set(key, !(settings as any)[key])} />
                        </div>
                    ))}
                </div>
            );

            case 'security': return (
                <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div>
                            <p className="text-sm font-medium text-stone-700">Google Sign-In</p>
                            <p className="text-xs text-stone-400">Allow users to sign in with Google</p>
                        </div>
                        <Toggle enabled={settings.enableGoogleAuth} onToggle={() => set('enableGoogleAuth', !settings.enableGoogleAuth)} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div>
                            <p className="text-sm font-medium text-stone-700">Magic Link (Email) Sign-In</p>
                            <p className="text-xs text-stone-400">Allow passwordless email sign-in</p>
                        </div>
                        <Toggle enabled={settings.enableEmailAuth} onToggle={() => set('enableEmailAuth', !settings.enableEmailAuth)} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div>
                            <p className="text-sm font-medium text-stone-700">Require Email Verification</p>
                            <p className="text-xs text-stone-400">New users must verify email before accessing content</p>
                        </div>
                        <Toggle enabled={settings.requireEmailVerification} onToggle={() => set('requireEmailVerification', !settings.requireEmailVerification)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Session Max Age (days)</label>
                        <input type="number" min={1} max={365} value={settings.sessionMaxAge} onChange={e => set('sessionMaxAge', Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm" />
                    </div>
                </div>
            );

            case 'users': return (
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Default Role for New Users</label>
                        <select value={settings.defaultRole} onChange={e => set('defaultRole', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm">
                            <option value="VISITOR">Visitor (read-only access)</option>
                            <option value="MEMBER">Member (standard access)</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div>
                            <p className="text-sm font-medium text-stone-700">Self-Registration</p>
                            <p className="text-xs text-stone-400">Allow new users to register without admin invite</p>
                        </div>
                        <Toggle enabled={settings.allowSelfRegistration} onToggle={() => set('allowSelfRegistration', !settings.allowSelfRegistration)} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div>
                            <p className="text-sm font-medium text-stone-700">Require Onboarding Flow</p>
                            <p className="text-xs text-stone-400">New users complete onboarding before dashboard access</p>
                        </div>
                        <Toggle enabled={settings.requireOnboarding} onToggle={() => set('requireOnboarding', !settings.requireOnboarding)} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div>
                            <p className="text-sm font-medium text-stone-700">Admin Approval Required</p>
                            <p className="text-xs text-stone-400">Admins must approve new member accounts</p>
                        </div>
                        <Toggle enabled={settings.memberApprovalRequired} onToggle={() => set('memberApprovalRequired', !settings.memberApprovalRequired)} />
                    </div>
                </div>
            );

            default: return null;
        }
    };

    const activeInfo = SECTIONS.find(s => s.id === activeSection);

    return (
        <div className="min-h-screen bg-stone-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-light text-stone-800 flex items-center gap-3">
                            <Settings className="text-sage-500" size={28} />
                            Admin Settings
                        </h1>
                        <p className="text-stone-500 mt-1">Configure every aspect of your Digital Church OS</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-2xl hover:bg-sage-700 transition-all font-semibold disabled:opacity-60 shadow-md"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
                        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                            {SECTIONS.map((section, i) => {
                                const Icon = section.icon;
                                const isActive = activeSection === section.id;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-stone-50 last:border-0 ${isActive ? 'bg-sage-50 text-sage-700' : 'text-stone-600 hover:bg-stone-50'}`}
                                    >
                                        <Icon size={17} className={isActive ? 'text-sage-500' : 'text-stone-400'} />
                                        <span className="text-sm font-medium">{section.label}</span>
                                        {isActive && <ChevronRight size={14} className="ml-auto text-sage-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Panel */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
                            <div className="px-6 py-5 border-b border-stone-100">
                                <h2 className="text-lg font-semibold text-stone-800">{activeInfo?.label}</h2>
                                <p className="text-stone-400 text-sm mt-0.5">{activeInfo?.description}</p>
                            </div>
                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeSection}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {renderSection()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
