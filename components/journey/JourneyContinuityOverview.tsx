'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  Church,
  Footprints,
  HeartHandshake,
  Loader2,
  Music2,
  ShieldCheck,
  Sparkles,
  Sunrise,
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
  privacyBoundary: {
    contentExcluded: boolean;
    financialActivityExcluded: boolean;
    pastoralCaseDataExcluded: boolean;
    childActivityExcluded: boolean;
    spiritualScoring: false;
  };
};

const sourceMeta: Record<string, { href: string; label: string; icon: typeof Sparkles }> = {
  'Daily Guide': { href: '/daily-guide', label: 'Daily Guide', icon: Sunrise },
  Scripture: { href: '/scripture', label: 'Scripture', icon: BookOpenText },
  Prayer: { href: '/prayer-practice', label: 'Prayer', icon: HeartHandshake },
  Fasting: { href: '/fasting-prayer', label: 'Fasting', icon: Sparkles },
  'Family Altar': { href: '/family-altar', label: 'Family Altar', icon: UsersRound },
  Choir: { href: '/choir', label: 'Choir', icon: Music2 },
  Sermon: { href: '/sermons', label: 'Sermon', icon: Church },
  'Service Response': { href: '/service-response', label: 'Service Response', icon: Footprints },
};

export function JourneyContinuityOverview() {
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
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : 'Unable to load continuity.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const lanes = useMemo(() => {
    const counts = payload?.sourceCounts || {};
    return Object.entries(sourceMeta).map(([source, meta]) => ({ source, ...meta, count: counts[source] || 0 }));
  }, [payload]);

  if (loading) {
    return <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"><div className="flex items-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting your private ministry moments…</div></section>;
  }

  if (error) {
    return <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-900">{error}</section>;
  }

  if (!payload) return null;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-700"><Footprints className="h-5 w-5" /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sage-700">Cross-ministry continuity</p>
              <h2 className="mt-2 text-2xl font-light text-stone-900 sm:text-3xl">See how the moments you chose to remember connect across the week.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">This view shows only the source, title, and date of continuity moments you deliberately saved. It does not expose the private reflection text here and does not calculate a spiritual score.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {lanes.map((lane) => {
              const Icon = lane.icon;
              return (
                <Link key={lane.source} href={lane.href} className="group rounded-2xl border border-stone-100 bg-stone-50 p-4 transition hover:border-sage-200 hover:bg-sage-50">
                  <div className="flex items-center justify-between gap-3"><Icon className="h-5 w-5 text-sage-700" /><span className="text-2xl font-light text-stone-800">{lane.count}</span></div>
                  <p className="mt-3 text-sm font-semibold text-stone-800">{lane.label}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-stone-400">saved continuity moments</p>
                </Link>
              );
            })}
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-lg font-semibold text-stone-900">Recent handoffs</h3><span className="text-xs text-stone-400">{payload.moments.length} recent</span></div>
            {payload.moments.length ? (
              <div className="space-y-2">
                {payload.moments.slice(0, 10).map((moment) => {
                  const meta = sourceMeta[moment.source] || { href: '/journey', label: moment.source, icon: Sparkles };
                  return (
                    <div key={moment.id} className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div><p className="text-sm font-semibold text-stone-800">{moment.title}</p><p className="mt-1 text-xs text-stone-500">{meta.label}</p></div>
                      <div className="flex items-center gap-3"><span className="text-xs text-stone-400">{new Date(moment.createdAt).toLocaleDateString()}</span><Link href={meta.href} className="text-xs font-semibold text-sage-700">Revisit →</Link></div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="rounded-2xl bg-stone-50 p-5 text-sm leading-6 text-stone-500">No continuity moments yet. Scripture study, prayer practice, fasting, Family Altar, Choir, sermons, service response, and Daily Guide can each hand off a reflection here only when you intentionally save it.</p>}
          </div>
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 xl:border-l xl:border-t-0">
          <ShieldCheck className="h-7 w-7 text-sage-300" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em] text-sage-300">Privacy boundary</p>
          <h3 className="mt-2 text-2xl font-light">Continuity without surveillance.</h3>
          <div className="mt-5 space-y-3 text-sm leading-6 text-stone-300">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">Private reflection content is excluded from this overview. Only source, title, and date are summarized.</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">Giving amounts, wallet activity, pastoral case data, crisis details, and child activity are excluded from formation signals.</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">Counts describe saved app moments only. They do not measure holiness, salvation, maturity, obedience, or God’s approval.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
