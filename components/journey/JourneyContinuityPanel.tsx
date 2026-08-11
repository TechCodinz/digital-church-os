'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BookOpenText, Church, Footprints, HeartHandshake, Loader2, Music2, ShieldCheck, Sparkles, Sunrise } from 'lucide-react';

type ContinuityMoment = {
  id: string;
  source: string;
  sourceKey: string;
  title: string;
  createdAt: string;
};

type ContinuityPayload = {
  moments: ContinuityMoment[];
  sourceCounts: Record<string, number>;
  privacyBoundary?: {
    contentExcluded?: boolean;
    financialActivityExcluded?: boolean;
    pastoralCaseDataExcluded?: boolean;
    childActivityExcluded?: boolean;
    spiritualScoring?: boolean;
  };
};

const sourceMeta: Record<string, { href: string; label: string; icon: typeof Sparkles }> = {
  'Daily Guide': { href: '/daily-guide', label: 'Daily Guide', icon: Sunrise },
  Scripture: { href: '/scripture', label: 'Scripture', icon: BookOpenText },
  Prayer: { href: '/prayer-room', label: 'Prayer', icon: HeartHandshake },
  Fasting: { href: '/fasting-prayer', label: 'Fasting', icon: Sparkles },
  'Family Altar': { href: '/family-altar', label: 'Family Altar', icon: Church },
  Choir: { href: '/choir', label: 'Choir', icon: Music2 },
  Sermon: { href: '/sermons', label: 'Sermon', icon: BookOpenText },
  'Service Response': { href: '/service-response', label: 'Service Response', icon: HeartHandshake },
};

export function JourneyContinuityPanel() {
  const [payload, setPayload] = useState<ContinuityPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/journey/continuity', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (!response.ok) {
          setMessage(response.status === 401 ? 'Sign in to see continuity across your private ministry moments.' : (data.error || 'Continuity is temporarily unavailable.'));
          return;
        }
        setPayload(data);
      })
      .catch(() => active && setMessage('Continuity is temporarily unavailable.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const activeSources = useMemo(() => {
    if (!payload) return [];
    return Object.entries(payload.sourceCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [payload]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-700"><Footprints className="h-5 w-5" /></span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sage-700">Private continuity</p>
              <h2 className="mt-1 text-2xl font-light text-stone-900">One journey across Scripture, prayer, fasting, sermons, family worship, service response and worship creation.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">This view remembers which ministry experiences you intentionally carried into Journey. The summary does not expose the private note text, rank your faith, or treat activity volume as spiritual maturity.</p>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 flex items-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading continuity…</div>
          ) : message ? (
            <p className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">{message}</p>
          ) : payload ? (
            <>
              <div className="mt-6 flex flex-wrap gap-2">
                {activeSources.length ? activeSources.map(([source, count]) => {
                  const meta = sourceMeta[source];
                  const Icon = meta?.icon || Sparkles;
                  return (
                    <Link key={source} href={meta?.href || '/journey'} className="inline-flex items-center rounded-full border border-sage-100 bg-sage-50 px-3 py-2 text-xs font-semibold text-sage-800 transition hover:border-sage-300">
                      <Icon className="mr-2 h-3.5 w-3.5" /> {meta?.label || source} · {count}
                    </Link>
                  );
                }) : <p className="text-sm text-stone-500">No continuity moments yet. Save a reflection from Daily Guide or another connected ministry workspace when you want it remembered here.</p>}
              </div>

              <div className="mt-7 space-y-3">
                {payload.moments.slice(0, 8).map((moment) => {
                  const meta = sourceMeta[moment.source];
                  return (
                    <div key={moment.id} className="flex flex-col gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2"><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sage-700">{meta?.label || moment.source}</span><span className="text-xs text-stone-400">{new Date(moment.createdAt).toLocaleDateString()}</span></div>
                        <p className="mt-2 text-sm font-semibold text-stone-800">{moment.title}</p>
                      </div>
                      <Link href={meta?.href || '/journey'} className="text-xs font-semibold text-sage-700 hover:underline">Open source →</Link>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
          <ShieldCheck className="h-7 w-7 text-sage-300" />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-sage-300">Continuity boundaries</p>
          <h3 className="mt-2 text-2xl font-light">Remember formation without surveillance.</h3>
          <div className="mt-5 space-y-3 text-sm leading-6 text-stone-300">
            <p>Private reflection text stays out of this summary; only source, title and date are surfaced.</p>
            <p>Giving amounts, pastoral case details and child activity are excluded from formation continuity.</p>
            <p>There is no spiritual score, faith rank, holiness score, or algorithmic claim about God’s approval.</p>
          </div>
          <div className="mt-6 grid gap-2">
            <Link href="/daily-guide" className="rounded-xl bg-sage-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-sage-400">Continue today’s rhythm</Link>
            <Link href="/journal" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-stone-200 hover:bg-white/10">Open private journal</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
