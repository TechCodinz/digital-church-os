'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BookOpenText, CheckCircle2, Footprints, HeartHandshake, Loader2, Music2, NotebookPen, RefreshCw, Sparkles } from 'lucide-react';

type Moment = {
  id: string;
  source: string;
  sourceKey: string;
  title: string;
  createdAt: string;
};

type ContinuityPayload = {
  moments: Moment[];
  sourceCounts: Record<string, number>;
  privacyBoundary?: {
    contentExcluded?: boolean;
    financialActivityExcluded?: boolean;
    pastoralCaseDataExcluded?: boolean;
    childActivityExcluded?: boolean;
    spiritualScoring?: boolean;
  };
};

const sourceMeta: Record<string, { href: string; label: string }> = {
  'Daily Guide': { href: '/daily-guide', label: 'Daily Guide' },
  Scripture: { href: '/scripture', label: 'Scripture' },
  Prayer: { href: '/prayer-room', label: 'Prayer' },
  Fasting: { href: '/fasting-prayer', label: 'Fasting' },
  'Family Altar': { href: '/family-altar', label: 'Family Altar' },
  Choir: { href: '/choir', label: 'Choir' },
  Sermon: { href: '/sermons', label: 'Sermons' },
  'Service Response': { href: '/service-response', label: 'Service Response' },
};

const quickSources = ['Scripture', 'Prayer', 'Sermon', 'Daily Guide'] as const;

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function JourneyContinuityHub() {
  const [payload, setPayload] = useState<ContinuityPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState<(typeof quickSources)[number]>('Scripture');
  const [takeaway, setTakeaway] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const load = async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/journey/continuity', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to load continuity.');
      setPayload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load continuity.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const activeSources = useMemo(() => Object.entries(payload?.sourceCounts || {}).sort((a, b) => b[1] - a[1]), [payload]);

  const saveTakeaway = async () => {
    if ((!takeaway.trim() && !nextStep.trim()) || saving) return;
    setSaving(true);
    setStatus('');
    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          sourceKey: `manual:${source.toLowerCase().replace(/\s+/g, '-')}:${dayKey()}`,
          title: `${source} takeaway · ${dayKey()}`,
          content: takeaway.trim(),
          nextStep: nextStep.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save this moment.');
      setTakeaway('');
      setNextStep('');
      setStatus(data.operation === 'updated' ? 'Today’s private takeaway was updated.' : 'Private takeaway added to your Journey.');
      await load(true);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Unable to save this moment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm"><div className="flex items-center justify-center text-sm text-stone-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connecting your private ministry journey…</div></section>;
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700"><Footprints className="mr-2 h-4 w-4" /> Journey continuity</div>
              <h2 className="mt-4 text-3xl font-light text-stone-900">See how your ministry moments connect without exposing the private contents.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">This overview counts source-tagged moments from Scripture, prayer, fasting, family worship, sermons, service response, choir, and Daily Guide. It does not calculate holiness, spiritual rank, or God’s approval.</p>
            </div>
            <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex min-h-11 shrink-0 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-600 disabled:opacity-60"><RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button>
          </div>

          {error && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div>}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(activeSources.length ? activeSources : Object.keys(sourceMeta).map((name) => [name, 0] as [string, number])).map(([name, count]) => {
              const meta = sourceMeta[name] || { href: '/journey', label: name };
              return <Link key={name} href={meta.href} className="rounded-2xl border border-stone-100 bg-stone-50 p-4 transition hover:border-sage-200 hover:bg-sage-50"><p className="text-sm font-semibold text-stone-800">{meta.label}</p><p className="mt-2 text-3xl font-light text-sage-700">{count}</p><p className="text-[10px] uppercase tracking-wider text-stone-400">private moments</p></Link>;
            })}
          </div>

          <div className="mt-7">
            <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-sage-600" /><h3 className="text-lg font-semibold text-stone-900">Recent continuity moments</h3></div>
            <div className="mt-4 space-y-3">
              {payload?.moments?.length ? payload.moments.slice(0, 8).map((moment) => (
                <div key={moment.id} className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-medium text-stone-800">{moment.title}</p><p className="mt-1 text-xs text-stone-500">{moment.source}</p></div>
                  <span className="text-xs text-stone-400">{new Date(moment.createdAt).toLocaleDateString()}</span>
                </div>
              )) : <p className="rounded-2xl border border-dashed border-stone-200 p-5 text-sm text-stone-500">No continuity moments yet. Save a takeaway from Scripture, prayer, Daily Guide, fasting, Family Altar, sermons, service response, or choir work.</p>}
            </div>
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8">
          <NotebookPen className="h-7 w-7 text-sage-300" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-sage-300">One takeaway</p>
          <h3 className="mt-2 text-2xl font-light">Carry one meaningful thing forward.</h3>
          <p className="mt-3 text-sm leading-6 text-stone-300">Use this when a ministry page gives you something worth remembering but you do not want to create a long journal entry.</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {quickSources.map((item) => <button key={item} type="button" onClick={() => { setSource(item); setStatus(''); }} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${source === item ? 'border-sage-300 bg-sage-400/15 text-sage-200' : 'border-white/10 bg-white/5 text-stone-300'}`}>{item}</button>)}
          </div>

          <label className="mt-5 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">What do you want to remember?</span><textarea value={takeaway} onChange={(event) => { setTakeaway(event.target.value); setStatus(''); }} maxLength={2400} rows={5} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-sage-400" placeholder="A truth, conviction, question, gratitude, or prayer…" /></label>
          <label className="mt-4 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">One next step</span><textarea value={nextStep} onChange={(event) => { setNextStep(event.target.value); setStatus(''); }} maxLength={700} rows={3} className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-sage-400" placeholder="What will you do, pray, study, repair, or revisit?" /></label>

          <button type="button" onClick={saveTakeaway} disabled={saving || (!takeaway.trim() && !nextStep.trim())} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sage-500 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}{saving ? 'Saving privately…' : 'Save to private Journey'}</button>
          {status && <p className="mt-3 text-xs leading-5 text-stone-300" role="status">{status}</p>}

          <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-xs leading-5 text-stone-400">
            <p className="flex gap-2"><HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-sage-300" /> Pastoral case details and crisis records stay outside this continuity summary.</p>
            <p className="flex gap-2"><BookOpenText className="mt-0.5 h-4 w-4 shrink-0 text-sage-300" /> Giving amounts and child activity are excluded from formation signals.</p>
            <p className="flex gap-2"><Music2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-300" /> Counts are memory aids, never spiritual scores or rankings.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
