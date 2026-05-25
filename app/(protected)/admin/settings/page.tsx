'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Bell,
  CheckCircle,
  CreditCard,
  Loader2,
  Mail,
  Radio,
  Save,
  Settings,
  Shield,
  Users,
  Volume2,
  Zap,
} from 'lucide-react';

type SettingsState = {
  churchName: string;
  churchEmail: string;
  churchWebsite: string;
  streamUrl: string;
  streamTitle: string;
  openaiApiKey: string;
  aiPastorEnabled: boolean;
  voiceEnabled: boolean;
  paymentsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  rateLimitEnabled: boolean;
  allowRegistration: boolean;
};

const defaultSettings: SettingsState = {
  churchName: 'Digital Church OS',
  churchEmail: '',
  churchWebsite: '',
  streamUrl: '',
  streamTitle: 'Sunday Morning Worship',
  openaiApiKey: '',
  aiPastorEnabled: true,
  voiceEnabled: true,
  paymentsEnabled: true,
  emailNotificationsEnabled: true,
  rateLimitEnabled: true,
  allowRegistration: true,
};

const sections = [
  { title: 'Church Identity', icon: Settings, text: 'Branding, website, and contact configuration.' },
  { title: 'Live Stream', icon: Radio, text: 'Broadcast URLs, service title, and live gathering defaults.' },
  { title: 'AI Modules', icon: Zap, text: 'AI Pastor, prayer, sermon, and scripture modules.' },
  { title: 'Voice Engine', icon: Volume2, text: 'Speech, worship atmosphere, and voice interaction defaults.' },
  { title: 'Payments', icon: CreditCard, text: 'Giving, receipts, marketplace, and provider readiness.' },
  { title: 'Notifications', icon: Mail, text: 'Email, reminders, prayer digests, and follow-up messages.' },
  { title: 'Security', icon: Shield, text: 'Session, rate limit, and protected route settings.' },
  { title: 'Users', icon: Users, text: 'Registration, roles, onboarding, and approval settings.' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-sage-600' : 'bg-stone-300'}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
}

function TextInput({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sage-400"
      />
    </label>
  );
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.settings) setSettings((current) => ({ ...current, ...data.settings }));
      })
      .catch(() => undefined);
  }, []);

  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (response.ok) {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-cream-50 px-4 py-24">
        <div className="mx-auto max-w-2xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <Shield className="mx-auto mb-4 h-10 w-10 text-sage-600" />
          <h1 className="text-2xl font-semibold text-stone-900">Admin access required</h1>
          <p className="mt-2 text-stone-600">Sign in as a church admin to manage platform settings.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <Settings className="mr-2 h-4 w-4" /> Admin Settings
            </div>
            <h1 className="text-4xl font-light text-stone-900">Platform command settings</h1>
            <p className="mt-3 max-w-2xl text-stone-600">Configure church identity, streams, AI modules, payments, notifications, security, and user controls from one production-safe admin page.</p>
          </div>
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sage-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-sage-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>

        {saved && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle className="h-4 w-4" /> Settings saved successfully.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <section className="rounded-3xl border border-stone-100 bg-white p-4 shadow-sm">
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.title} className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl bg-white p-2 text-sage-700 shadow-sm">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <h2 className="text-sm font-semibold text-stone-900">{section.title}</h2>
                        <p className="text-xs leading-5 text-stone-500">{section.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <TextInput label="Church Name" value={settings.churchName} onChange={(value) => update('churchName', value)} placeholder="Digital Church OS" />
              <TextInput label="Church Email" value={settings.churchEmail} onChange={(value) => update('churchEmail', value)} placeholder="info@church.com" type="email" />
              <TextInput label="Church Website" value={settings.churchWebsite} onChange={(value) => update('churchWebsite', value)} placeholder="https://church.com" />
              <TextInput label="Primary Stream URL" value={settings.streamUrl} onChange={(value) => update('streamUrl', value)} placeholder="https://youtube.com/..." />
              <TextInput label="Stream Title" value={settings.streamTitle} onChange={(value) => update('streamTitle', value)} placeholder="Sunday Morning Worship" />
              <TextInput label="OpenAI API Key" value={settings.openaiApiKey} onChange={(value) => update('openaiApiKey', value)} placeholder="Stored securely by admin API" type="password" />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                ['aiPastorEnabled', 'AI Pastor Enabled', Zap],
                ['voiceEnabled', 'Voice Engine Enabled', Volume2],
                ['paymentsEnabled', 'Payments Enabled', CreditCard],
                ['emailNotificationsEnabled', 'Email Notifications', Bell],
                ['rateLimitEnabled', 'Rate Limiting', Shield],
                ['allowRegistration', 'Allow Registration', Users],
              ].map(([key, label, Icon]) => (
                <div key={String(key)} className="flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-white p-2 text-sage-700 shadow-sm">
                      {/* @ts-expect-error Icon is selected from lucide components above */}
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-stone-800">{String(label)}</span>
                  </div>
                  <Toggle checked={Boolean(settings[key as keyof SettingsState])} onChange={() => update(key as keyof SettingsState, !settings[key as keyof SettingsState] as never)} />
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-stone-100 pt-6">
              <button type="button" onClick={() => router.back()} className="rounded-2xl border border-stone-200 px-5 py-3 font-medium text-stone-600 transition hover:bg-stone-50">
                Back
              </button>
              <button type="button" onClick={saveSettings} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-sage-600 px-5 py-3 font-medium text-white transition hover:bg-sage-700 disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Settings
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
