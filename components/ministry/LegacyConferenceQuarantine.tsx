'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarDays, ShieldCheck, Trash2 } from 'lucide-react';

type LegacyConference = {
  id: string;
  title: string;
  theme: string;
  startDate: string;
  endDate: string;
  status: string;
  attendeeCount?: number;
};

export function LegacyConferenceQuarantine() {
  const [items, setItems] = useState<LegacyConference[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading pre-tenant conference records…');
  const [workingId, setWorkingId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/conferences', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) {
        setItems([]);
        setMessage(data?.migrationRequired
          ? 'Conference tenant migration must be applied before legacy records can be reviewed.'
          : data?.error || 'Legacy conference records are unavailable.');
        return;
      }
      setItems(Array.isArray(data) ? data : []);
      setMessage('Only conferences with no church tenant are shown here. New conferences cannot be created from this legacy surface.');
    } catch {
      setItems([]);
      setMessage('Legacy conference records are unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const remove = async (conference: LegacyConference) => {
    if (!window.confirm(`Permanently delete legacy conference “${conference.title}”? This is only for records that should not be retained or assigned.`)) return;
    setWorkingId(conference.id);
    try {
      const response = await fetch(`/api/conferences?id=${encodeURIComponent(conference.id)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || 'Legacy conference could not be deleted.');
        return;
      }
      await load();
      setMessage('Legacy conference deleted.');
    } finally {
      setWorkingId('');
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-800"><AlertTriangle className="mr-2 h-4 w-4" /> Legacy conference quarantine</div>
          <h1 className="mt-4 max-w-4xl text-3xl font-light leading-tight text-stone-900 md:text-5xl">Review pre-tenant conferences without pretending they belong to a church.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Historical records with no `church_profile_id` stay quarantined here. The safe path for new events is the tenant-scoped Events workspace.</p>
          <div className="mt-4 inline-flex items-start gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /> {loading ? 'Loading…' : message}</div>

          <div className="mt-7 space-y-3">
            {items.map((conference) => (
              <article key={conference.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-stone-900">{conference.title}</h2><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-600">{conference.status}</span></div><p className="mt-2 text-sm leading-6 text-stone-600">{conference.theme}</p><p className="mt-3 text-xs text-stone-500">{new Date(conference.startDate).toLocaleString()} · {conference.attendeeCount || 0} registered</p></div>
                  <button type="button" disabled={workingId === conference.id} onClick={() => void remove(conference)} className="inline-flex items-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50"><Trash2 className="mr-1.5 h-4 w-4" /> Delete legacy record</button>
                </div>
              </article>
            ))}
            {!loading && !items.length && <div className="rounded-3xl border border-dashed border-stone-300 p-10 text-center"><CalendarDays className="mx-auto h-8 w-8 text-stone-300" /><p className="mt-3 font-semibold text-stone-700">No unscoped legacy conferences remain.</p></div>}
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <ShieldCheck className="h-8 w-8 text-amber-300" />
          <h2 className="mt-5 text-3xl font-light">No automatic ownership guesses.</h2>
          <p className="mt-4 text-sm leading-6 text-stone-300">Assigning an old conference to the wrong church would be a cross-tenant data error. This compatibility surface therefore supports review/deletion only; ownership assignment should be a separate explicit migration workflow with human evidence.</p>
          <div className="mt-6 grid gap-3">
            <Link href="/events/manage" className="rounded-xl bg-amber-500 px-4 py-3 text-center text-sm font-semibold text-stone-950">Open tenant Events workspace</Link>
            <Link href="/sermons" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white">Open sermon workspace</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
