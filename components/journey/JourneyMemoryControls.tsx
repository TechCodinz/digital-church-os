'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Download, Loader2, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';

type Moment = {
  id: string;
  source: string;
  sourceKey: string;
  title: string;
  createdAt: string;
};

type Payload = {
  moments?: Moment[];
};

export function JourneyMemoryControls() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/journey/continuity', { cache: 'no-store' });
      const data = await response.json().catch(() => ({})) as Payload & { error?: string };
      if (!response.ok) throw new Error(data.error || 'Unable to load private continuity.');
      setMoments(Array.isArray(data.moments) ? data.moments : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load private continuity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async (moment: Moment) => {
    if (deletingId) return;
    if (!window.confirm(`Remove “${moment.title}” from your private Journey continuity? This does not delete unrelated journal entries.`)) return;

    setDeletingId(moment.id);
    setMessage('');
    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: moment.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to remove this private continuity moment.');
      setMoments((current) => current.filter((item) => item.id !== moment.id));
      setMessage('Private continuity moment removed.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to remove this private continuity moment.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="bg-sage-950 p-6 text-white sm:p-8">
          <ShieldCheck className="h-7 w-7 text-sage-300" />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-sage-300">Member-owned memory</p>
          <h2 className="mt-2 text-2xl font-light">Review, export, and remove what you intentionally saved.</h2>
          <p className="mt-3 text-sm leading-6 text-stone-300">Continuity is not a permanent black box. You can export your broader account data and remove individual continuity moments without deleting unrelated journal records.</p>

          <div className="mt-6 grid gap-2">
            <a href="/api/user/export" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-stone-900"><Download className="mr-2 h-4 w-4" /> Export my account data</a>
            <Link href="/profile/settings" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-stone-200 hover:bg-white/10">Privacy & account settings</Link>
          </div>

          <p className="mt-5 text-[10px] leading-4 text-stone-400">Export can include private account records such as journal entries, prayers, goals and other user-owned data. Store downloaded files carefully.</p>
        </aside>

        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-700">Continuity controls</p>
              <h3 className="mt-2 text-2xl font-light text-stone-900">Your saved continuity moments</h3>
              <p className="mt-2 text-sm leading-6 text-stone-500">Only continuity metadata is listed here. Reflection content remains inside the private journal record.</p>
            </div>
            <button type="button" onClick={() => void load()} disabled={loading} aria-label="Refresh continuity moments" className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-500 hover:border-sage-200 hover:text-sage-700 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>

          {loading ? (
            <div className="mt-6 flex items-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading private continuity…</div>
          ) : moments.length ? (
            <div className="mt-6 space-y-2">
              {moments.map((moment) => (
                <div key={moment.id} className="flex flex-col gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sage-700">{moment.source}</span><span className="text-xs text-stone-400">{new Date(moment.createdAt).toLocaleDateString()}</span></div>
                    <p className="mt-2 truncate text-sm font-semibold text-stone-800">{moment.title}</p>
                  </div>
                  <button type="button" onClick={() => void remove(moment)} disabled={Boolean(deletingId)} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                    {deletingId === moment.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-2 h-3.5 w-3.5" />}Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-6 text-sm leading-6 text-stone-500">No saved continuity moments are currently listed.</div>
          )}

          {message && <p role="status" className={`mt-4 rounded-xl px-3 py-2 text-xs ${message.includes('removed') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{message}</p>}
        </div>
      </div>
    </section>
  );
}
