'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpenText, Footprints, HeartHandshake, Loader2, Music2, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';

type Moment = {
  id: string;
  source: string;
  sourceKey: string;
  title: string;
  createdAt: string;
};

type Payload = {
  moments: Moment[];
  sourceCounts: Record<string, number>;
  privacyBoundary: {
    contentExcluded: boolean;
    financialActivityExcluded: boolean;
    pastoralCaseDataExcluded: boolean;
    childActivityExcluded: boolean;
    spiritualScoring: boolean;
  };
};

const lanes = [
  { source: 'Scripture', label: 'Scripture', href: '/scripture', icon: BookOpenText },
  { source: 'Prayer', label: 'Prayer', href: '/prayer-room', icon: HeartHandshake },
  { source: 'Fasting', label: 'Fasting', href: '/fasting-prayer', icon: Sparkles },
  { source: 'Family Altar', label: 'Family Altar', href: '/family-altar', icon: UsersRound },
  { source: 'Choir', label: 'Worship creation', href: '/choir', icon: Music2 },
  { source: 'Sermon', label: 'Sermons', href: '/sermons', icon: BookOpenText },
  { source: 'Service Response', label: 'Service response', href: '/service-response', icon: Footprints },
] as const;

export function JourneyContinuityOverview() {
  const [payload, setPayload] = useState<Payload | null>(null);
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

  const recent = useMemo(() => payload?.moments.slice(0, 6) || [], [payload]);

  if (loading) return <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"><div className="flex items-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting your private journey moments…</div></section>;
  if (error) return <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">{error}</section>;
  if (!payload) return null;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <Footprints className="mt-1 h-7 w-7 shrink-0 text-sage-700" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-700">Journey continuity</p>
              <h2 className="mt-2 text-2xl font-light text-stone-900 sm:text-3xl">See what you chose to carry forward across the sanctuary.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">This overview counts explicit private Journey saves from ministry experiences. It does not infer faith, maturity, holiness, salvation, or God’s approval.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {lanes.map((lane) => {
              const Icon = lane.icon;
              const count = payload.sourceCounts[lane.source] || 0;
              return (
                <Link key={lane.source} href={lane.href} className="rounded-2xl border border-stone-100 bg-stone-50 p-4 transition hover:border-sage-200 hover:bg-sage-50">
                  <div className="flex items-center justify-between gap-3"><Icon className="h-5 w-5 text-sage-700" /><span className="text-2xl font-light text-stone-800">{count}</span></div>
                  <p className="mt-3 text-sm font-semibold text-stone-800">{lane.label}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-stone-400">saved moments</p>
                </Link>
              );
            })}
          </div>

          <div className="mt-7">
            <h3 className="text-sm font-semibold text-stone-800">Recent continuity moments</h3>
            {recent.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {recent.map((moment) => (
                  <div key={moment.id} className="rounded-2xl border border-stone-100 bg-white p-4">
                    <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wider text-sage-700">{moment.source}</span><span className="text-[10px] text-stone-400">{new Date(moment.createdAt).toLocaleDateString()}</span></div>
                    <p className="mt-2 text-sm font-medium text-stone-800">{moment.title}</p>
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 text-sm text-stone-500">No explicit continuity moments yet. Use “Remember this” on Scripture, prayer, fasting, sermon, worship, family, or service-response pages.</p>}
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8">
          <ShieldCheck className="h-7 w-7 text-sage-300" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-sage-300">Privacy boundary</p>
          <h3 className="mt-2 text-2xl font-light">Memory without surveillance.</h3>
          <div className="mt-5 space-y-3 text-sm leading-6 text-stone-300">
            <p>Raw reflection content is excluded from this overview.</p>
            <p>Giving amounts and financial activity are excluded.</p>
            <p>Pastoral, crisis, counseling, abuse, safeguarding, and medical case details are excluded.</p>
            <p>Children’s activity is excluded from the adult formation view.</p>
            <p>No spiritual score, leaderboard, holiness ranking, or automated judgment is produced.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
