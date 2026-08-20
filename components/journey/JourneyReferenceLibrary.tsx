'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpenText, Filter, Footprints, Loader2, Search, ShieldCheck, Trash2 } from 'lucide-react';

type Entry = {
  id: string;
  source: string;
  sourceKey: string;
  title: string;
  content: string;
  createdAt: string;
};

type Payload = {
  entries: Entry[];
  sources: string[];
  privacyBoundary: {
    ownerOnly: boolean;
    financialActivityExcluded: boolean;
    pastoralCaseDataExcluded: boolean;
    childActivityExcluded: boolean;
    spiritualScoring: boolean;
  };
};

const sourceHref: Record<string, string> = {
  'Daily Guide': '/daily-guide',
  Scripture: '/scripture',
  Prayer: '/prayer-practice',
  Fasting: '/fasting-prayer',
  'Fasting & Prayer': '/fasting-prayer',
  'Family Altar': '/family-altar',
  Choir: '/choir',
  'Choir Studio': '/choir',
  Sermon: '/sermons',
  'Live Sermon': '/live-service',
  'Service Response': '/service-response',
  'Pastoral Reflection': '/care',
};

const defaultSources = [
  'Daily Guide',
  'Scripture',
  'Prayer',
  'Fasting',
  'Fasting & Prayer',
  'Family Altar',
  'Choir',
  'Choir Studio',
  'Sermon',
  'Live Sermon',
  'Service Response',
  'Pastoral Reflection',
];

export function JourneyReferenceLibrary() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('');
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        if (source) params.set('source', source);
        const response = await fetch(`/api/journey/library?${params.toString()}`, { cache: 'no-store', signal: controller.signal });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Unable to load your private reference library.');
        setPayload(data);
      } catch (reason) {
        if ((reason as Error)?.name !== 'AbortError') setError(reason instanceof Error ? reason.message : 'Unable to load your private reference library.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, source]);

  const sources = useMemo(() => payload?.sources?.length ? payload.sources : defaultSources, [payload]);

  const removeEntry = async (entry: Entry) => {
    if (deletingId) return;
    const confirmed = window.confirm(`Remove “${entry.title}” from your private Journey reference library? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(entry.id);
    setActionStatus('');
    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to remove this Journey moment.');
      setPayload((current) => current ? { ...current, entries: current.entries.filter((item) => item.id !== entry.id) } : current);
      setExpanded((current) => current === entry.id ? null : current);
      setActionStatus('Removed from your private Journey.');
      window.dispatchEvent(new Event('digital-church:journey-updated'));
    } catch (reason) {
      setActionStatus(reason instanceof Error ? reason.message : 'Unable to remove this Journey moment.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-700"><BookOpenText className="h-5 w-5" /></span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sage-700">Private reference library</p>
                <h2 className="mt-1 text-2xl font-light text-stone-900 sm:text-3xl">Find what you intentionally chose to remember.</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Search your own saved continuity moments by words in the title or reflection, then return to the ministry experience that shaped them.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search grace, John 15, forgiveness, prayer…" className="min-h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 pl-10 pr-4 text-sm text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
              </label>
              <label className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <select value={source} onChange={(event) => setSource(event.target.value)} className="min-h-12 w-full appearance-none rounded-2xl border border-stone-200 bg-white pl-10 pr-4 text-sm text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100">
                  <option value="">All ministry sources</option>
                  {sources.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>
          </div>

          <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
            <ShieldCheck className="h-7 w-7 text-sage-300" />
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-sage-300">Owner-only retrieval</p>
            <h3 className="mt-2 text-2xl font-light">Reference without spiritual surveillance.</h3>
            <p className="mt-3 text-sm leading-6 text-stone-300">This library searches only your signed-in continuity journal entries. Giving amounts, pastoral case details, child activity, and spiritual ranking are excluded.</p>
          </aside>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-700">Saved references</p><h3 className="mt-1 text-xl font-semibold text-stone-900">{payload?.entries.length || 0} matching moments</h3></div>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-sage-700" />}
        </div>

        {actionStatus ? <p className={`mt-4 rounded-2xl p-4 text-sm ${actionStatus.startsWith('Removed') ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-amber-200 bg-amber-50 text-amber-800'}`}>{actionStatus}</p> : null}
        {error ? <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</p> : null}

        {!loading && payload?.entries.length === 0 ? (
          <div className="py-12 text-center text-sm text-stone-500">
            <Footprints className="mx-auto mb-3 h-7 w-7 text-stone-300" />
            No saved continuity moments match this search yet.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {payload?.entries.map((entry) => {
              const isOpen = expanded === entry.id;
              return (
                <article key={entry.id} className="overflow-hidden rounded-2xl border border-stone-100 bg-stone-50">
                  <button type="button" onClick={() => setExpanded(isOpen ? null : entry.id)} className="flex w-full items-start justify-between gap-4 p-4 text-left sm:p-5">
                    <span>
                      <span className="inline-flex rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sage-700">{entry.source}</span>
                      <span className="mt-2 block text-sm font-semibold text-stone-900">{entry.title}</span>
                      <span className="mt-1 block text-xs text-stone-400">{new Date(entry.createdAt).toLocaleString()}</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-sage-700">{isOpen ? 'Hide' : 'Open'}</span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-stone-200 bg-white p-4 sm:p-5">
                      <div className="whitespace-pre-wrap text-sm leading-7 text-stone-700">{entry.content}</div>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link href={sourceHref[entry.source] || '/journey'} className="rounded-xl bg-sage-600 px-4 py-2.5 text-xs font-semibold text-white">Return to {entry.source}</Link>
                        <Link href="/journey" className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700">Back to Journey</Link>
                        <button type="button" onClick={() => removeEntry(entry)} disabled={deletingId === entry.id} className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50">{deletingId === entry.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-2 h-3.5 w-3.5" />}{deletingId === entry.id ? 'Removing…' : 'Remove from Journey'}</button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
