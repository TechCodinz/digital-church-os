'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  Church,
  HeartHandshake,
  Loader2,
  Music2,
  NotebookPen,
  Radio,
  Sparkles,
  UsersRound,
} from 'lucide-react';

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
  'Daily Guide': { href: '/daily-guide', label: 'Daily Guide', icon: Sparkles },
  Scripture: { href: '/scripture', label: 'Scripture', icon: BookOpenText },
  Prayer: { href: '/prayer-room', label: 'Prayer', icon: HeartHandshake },
  Fasting: { href: '/fasting-prayer', label: 'Fasting & Prayer', icon: HeartHandshake },
  'Family Altar': { href: '/family-altar', label: 'Family Altar', icon: UsersRound },
  Choir: { href: '/choir', label: 'Choir Studio', icon: Music2 },
  Sermon: { href: '/sermons', label: 'Sermons', icon: Radio },
  'Service Response': { href: '/live-service', label: 'Live Service', icon: Church },
};

function friendlyDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function JourneyContinuityMap() {
  const [payload, setPayload] = useState<ContinuityPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/journey/continuity', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Unable to load continuity.');
        if (active) setPayload(data);
      })
      .catch((err) => active && setError(err instanceof Error ? err.message : 'Unable to load continuity.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const activeSources = useMemo(() => {
    if (!payload) return [];
    return Object.entries(payload.sourceCounts || {})
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [payload]);

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting your recent ministry moments…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-stone-600">{error}</p>
      </section>
    );
  }

  if (!payload) return null;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-700">Private continuity map</p>
              <h2 className="mt-2 text-3xl font-light text-stone-900">See how your recent ministry moments connect.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
                This view shows where your private Journey moments came from so you can resume a formation lane without exposing the reflection content itself or turning activity into a spiritual score.
              </p>
            </div>
            <NotebookPen className="h-6 w-6 shrink-0 text-sage-600" />
          </div>

          {activeSources.length ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {activeSources.map(([source, count]) => {
                const meta = sourceMeta[source] || { href: '/journey', label: source, icon: Sparkles };
                const Icon = meta.icon;
                return (
                  <Link key={source} href={meta.href} className="group rounded-2xl border border-stone-100 bg-stone-50 p-4 transition hover:border-sage-200 hover:bg-sage-50">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sage-700 shadow-sm"><Icon className="h-4 w-4" /></span>
                      <span className="text-2xl font-light text-sage-700">{count}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-stone-900">{meta.label}</p>
                    <p className="mt-1 text-xs text-stone-500">private journey moment{count === 1 ? '' : 's'} · resume →</p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-6 text-sm leading-6 text-stone-500">
              No continuity moments yet. Save a reflection from Daily Guide, Scripture, prayer, fasting, Family Altar, Choir, a sermon, or a live-service response and it can appear here privately.
            </div>
          )}

          {payload.moments.length > 0 && (
            <div className="mt-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Recent handoffs</p>
              <div className="mt-3 space-y-2">
                {payload.moments.slice(0, 8).map((moment) => {
                  const meta = sourceMeta[moment.source] || { href: '/journey', label: moment.source, icon: Sparkles };
                  return (
                    <Link key={moment.id} href={meta.href} className="flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-stone-100 px-4 py-3 transition hover:border-sage-200 hover:bg-sage-50">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-stone-800">{moment.title}</p>
                        <p className="mt-0.5 text-xs text-stone-500">{moment.source}</p>
                      </div>
                      <span className="shrink-0 text-xs text-stone-400">{friendlyDate(moment.createdAt)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-300">Continuity boundaries</p>
          <h3 className="mt-2 text-2xl font-light">Memory without surveillance.</h3>
          <div className="mt-5 space-y-3 text-sm leading-6 text-stone-300">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">Reflection text is not returned by this continuity summary. Only source, title, date, and private account-scoped linkage are shown.</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">Giving amounts, pastoral case data, crisis details, child activity, and spiritual rankings stay outside this continuity map.</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">The map helps you remember and resume. It does not infer God’s approval, holiness, maturity, or salvation from app activity.</p>
          </div>
          <Link href="/daily-guide" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sage-500 px-4 text-sm font-semibold text-white hover:bg-sage-400">Choose today’s next step</Link>
        </aside>
      </div>
    </section>
  );
}
