'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AlertCircle, CheckCircle, KeyRound, Loader2, Radio, Save, Settings, Shield } from 'lucide-react';

type SettingsState = {
  churchName: string;
  churchEmail: string;
  churchWebsite: string;
  streamUrl: string;
  streamTitle: string;
};

const defaultSettings: SettingsState = {
  churchName: 'Digital Church OS',
  churchEmail: '',
  churchWebsite: '',
  streamUrl: '',
  streamTitle: 'Sunday Morning Worship',
};

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const [persistentStorageConfigured, setPersistentStorageConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!active) return;

        if (data?.settings && typeof data.settings === 'object') {
          setSettings((current) => ({ ...current, ...data.settings }));
        }
        setPersistentStorageConfigured(data?.persistentStorageConfigured === true);

        if (!response.ok) {
          setStatus({
            kind: data?.migrationRequired ? 'warning' : 'error',
            message: data?.error || 'Settings could not be loaded.',
          });
        }
      } catch {
        if (active) setStatus({ kind: 'error', message: 'Settings could not be loaded.' });
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, []);

  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await response.json().catch(() => ({}));
      setPersistentStorageConfigured(data?.persistentStorageConfigured === true);

      if (!response.ok) {
        setStatus({
          kind: data?.migrationRequired ? 'warning' : 'error',
          message: data?.error || 'Settings could not be saved.',
        });
        return;
      }

      if (data?.settings && typeof data.settings === 'object') {
        setSettings((current) => ({ ...current, ...data.settings }));
      }
      setStatus({ kind: 'success', message: 'Settings persisted successfully.' });
    } catch {
      setStatus({ kind: 'error', message: 'Settings could not be saved.' });
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
          <p className="mt-2 text-stone-600">Sign in as a platform church admin to manage these settings.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <Settings className="mr-2 h-4 w-4" /> Platform Settings
            </div>
            <h1 className="text-4xl font-light text-stone-900">Truthful runtime configuration</h1>
            <p className="mt-3 max-w-2xl text-stone-600">Edit only configuration that is consumed by the current application. Provider credentials remain deployment secrets and unsupported “toggle” controls are not presented as runtime switches.</p>
          </div>
          <button type="button" onClick={saveSettings} disabled={saving || loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sage-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-sage-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>

        {status && (
          <div className={`mb-6 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-medium ${status.kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : status.kind === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {status.kind === 'success' ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
              <Shield className="h-6 w-6 text-sage-600" />
              <h2 className="mt-4 text-xl font-semibold text-stone-900">Persistence status</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {persistentStorageConfigured === true
                  ? 'The non-secret site settings store is available.'
                  : persistentStorageConfigured === false
                    ? 'Persistent settings are unavailable until the site settings migration is applied.'
                    : 'Checking persistent settings storage…'}
              </p>
            </section>

            <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
              <KeyRound className="h-6 w-6 text-blue-700" />
              <h2 className="mt-4 text-lg font-semibold text-blue-950">Provider credentials</h2>
              <p className="mt-2 text-sm leading-6 text-blue-900">OpenAI, Stripe, Resend, OAuth, and other provider secrets are configured in the deployment environment. They are never accepted or returned by this settings page.</p>
            </section>
          </div>

          <section className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><Settings className="h-5 w-5 text-sage-600" /><h2 className="text-xl font-semibold text-stone-900">Identity & contact</h2></div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <TextInput label="Church / Platform Name" value={settings.churchName} onChange={(value) => update('churchName', value)} placeholder="Digital Church OS" />
              <TextInput label="Contact Email" value={settings.churchEmail} onChange={(value) => update('churchEmail', value)} placeholder="info@church.com" type="email" />
              <div className="md:col-span-2"><TextInput label="Website" value={settings.churchWebsite} onChange={(value) => update('churchWebsite', value)} placeholder="https://church.com" /></div>
            </div>

            <div className="my-8 border-t border-stone-100" />

            <div className="flex items-center gap-3"><Radio className="h-5 w-5 text-sage-600" /><h2 className="text-xl font-semibold text-stone-900">Live Service provider</h2></div>
            <p className="mt-2 text-sm leading-6 text-stone-600">The member-facing Live Service page reads these two values through a safe endpoint. Playback, quality, volume, viewer analytics, and actual live status remain controlled by the stream provider.</p>
            <div className="mt-5 grid gap-5">
              <TextInput label="Primary Stream URL" value={settings.streamUrl} onChange={(value) => update('streamUrl', value)} placeholder="https://youtube.com/..." />
              <TextInput label="Stream Title" value={settings.streamTitle} onChange={(value) => update('streamTitle', value)} placeholder="Sunday Morning Worship" />
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-stone-100 pt-6">
              <button type="button" onClick={() => router.back()} className="rounded-2xl border border-stone-200 px-5 py-3 font-medium text-stone-600 transition hover:bg-stone-50">Back</button>
              <button type="button" onClick={saveSettings} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-2xl bg-sage-600 px-5 py-3 font-medium text-white transition hover:bg-sage-700 disabled:opacity-60">
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
