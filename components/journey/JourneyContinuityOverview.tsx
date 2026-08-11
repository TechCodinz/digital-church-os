'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BookOpenText, Footprints, HeartHandshake, Loader2, Music2, ShieldCheck, Sparkles, Sunrise, UsersRound } from 'lucide-react';

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
  privacyBoundary: {
    contentExcluded: boolean;
    financialActivityExcluded: boolean;
    pastoralCaseDataExcluded: boolean;
    childActivityExcluded: boolean;
    spiritualScoring: boolean;
  };
};

type Lane = {
  source: string;
  label: string;
  href: string;
  description: string;
  icon: typeof Footprints;
};

const lanes: Lane[] = [
  { source: 'Daily Guide', label: 'Daily Guide', href: '/daily-guide', description: 'Morning intention, evening examen, and one practical next step.', icon: Sunrise },
  { source: 'Scripture', label: 'Scripture', href: '/scripture', description: 'Chosen observations, questions, prayer, and application from Bible study.', icon: BookOpenText },
  { source: 'Prayer', label: 'Prayer', href: '/prayer-practice', description: 'Intentional prayer reflections and remembered next steps.', icon: HeartHandshake },
  { source: 'Fasting', label: 'Fasting & Prayer', href: '/fasting-prayer', description: 'Purpose, Scripture anchors, reflection, and responsible practice.', icon: Sparkles },
  { source: 'Family Altar', label: 'Family Altar', href: '/family-altar', description: 'Household worship insights intentionally saved for later.', icon: UsersRound },
  { source: 'Choir', label: 'Choir & Worship', href: '/choir', description: 'Scripture foundation, rehearsal learning, and worship-creation next steps.', icon: Music2 },
  { source: 'Sermon', label: 'Sermons', href: '/sermons', description: 'Biblical insight, questions, prayer, and faithful response after a message.', icon: BookOpenText },
  { source: 'Service Response', label: 'Service Response', href: '/service-response', description: 'Intentional follow-through from worship into prayer, care, service, or discipleship.', icon: Footprints },
];

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

  const activeSources = useMemo(() => lanes.filter((lane) => (payload?.sourceCounts?.[lane.source] || 0) > 0).length, [payload]);

  if (loading) {
    return <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"><div className="flex items-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading private continuity…</div></section>;
  }

  if (error) {
    return <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">{error}</section>;
  }

  if (!payload) return null;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-700"><Footprints className="h-5 w-5" /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sage-700">Private continuity map</p>
              <h2 className="mt-2 text-2xl font-light text-stone-900 sm:text-3xl">One Journey across the whole sanctuary.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">See where you intentionally saved a formation moment, then return to the ministry surface that helps you continue. This overview loads titles and source counts only—not the private reflection content.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {lanes.map((lane) => {
              const Icon = lane.icon;
              const count = payload.sourceCounts?.[lane.source] || 0;
              return (
                <Link key={lane.source} href={lane.href} className="group rounded-2xl border border-stone-100 bg-stone-50 p-4 transition hover:border-sage-200 hover:bg-sage-50">
                  <div className="flex items-center justify-between gap-3"><Icon className="h-5 w-5 text-sage-700" /><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-stone-600">{count} saved</span></div>
                  <p className="mt-3 text-sm font-semibold text-stone-900">{lane.label}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{lane.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
          <ShieldCheck className="h-7 w-7 text-sage-300" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-sage-300">Continuity without surveillance</p>
          <p className="mt-3 text-4xl font-light">{activeSources}<span className="ml-2 text-base text-stone-400">active ministry lanes</span></p>
          <p className="mt-3 text-sm leading-6 text-stone-300">A lane becomes active only when you intentionally save a Journey moment from that experience. There is no automatic spiritual scoring, ranking, or holiness prediction.</p>

          <div className="mt-6 space-y-2">
            {payload.moments.slice(0, 5).map((moment) => (
              <div key={moment.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-wider text-sage-300">{moment.source}</span><span className="text-[10px] text-stone-500">{new Date(moment.createdAt).toLocaleDateString()}</span></div>
                <p className="mt-1 truncate text-sm text-stone-200">{moment.title}</p>
              </div>
            ))}
            {!payload.moments.length && <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-stone-400">No continuity moments yet. Start with Scripture, prayer, a sermon, or today’s Daily Guide.</p>}
          </div>

          <p className="mt-5 text-xs leading-5 text-stone-400">Financial activity, pastoral case data, child activity, and the body of private continuity notes are excluded from this overview.</p>
        </aside>
      </div>
    </section>
  );
}
