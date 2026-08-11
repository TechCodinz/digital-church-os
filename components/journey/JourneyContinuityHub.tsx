'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BookOpenText, Church, HeartHandshake, Loader2, Music2, Radio, Sparkles, Sunrise, UsersRound } from 'lucide-react';

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

const sourceMeta: Record<string, { href: string; label: string; icon: typeof Sparkles; description: string }> = {
  'Daily Guide': { href: '/daily-guide', label: 'Daily Guide', icon: Sunrise, description: 'Morning intention, evening examen, and one faithful next step.' },
  Scripture: { href: '/scripture', label: 'Scripture', icon: BookOpenText, description: 'Study reflections and passages intentionally carried forward.' },
  Prayer: { href: '/prayer-room', label: 'Prayer', icon: HeartHandshake, description: 'Private prayer reflections and answered-prayer remembrance.' },
  Fasting: { href: '/fasting-prayer', label: 'Fasting', icon: Sparkles, description: 'Responsible fasting reflections, Scripture anchors, and follow-through.' },
  'Family Altar': { href: '/family-altar', label: 'Family Altar', icon: UsersRound, description: 'Household worship themes and family discipleship next steps.' },
  Choir: { href: '/choir', label: 'Choir', icon: Music2, description: 'Original worship composition, rehearsal insights, and service preparation.' },
  Sermon: { href: '/sermons', label: 'Sermon', icon: Church, description: 'Teaching notes, Scripture anchors, listener takeaways, and application.' },
  'Service Response': { href: '/live-service', label: 'Service Response', icon: Radio, description: 'Prayer, discipleship, serving, and follow-up responses from live worship.' },
};

export function JourneyContinuityHub() {
  const [payload, setPayload] = useState<ContinuityPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/journey/continuity', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Unable to load journey continuity.');
        if (active) setPayload(data);
      })
      .catch((err) => active && setError(err instanceof Error ? err.message : 'Unable to load journey continuity.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const lanes = useMemo(() => Object.entries(sourceMeta).map(([source, meta]) => ({ source, ...meta, count: payload?.sourceCounts?.[source] || 0 })), [payload]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
            <Sparkles className="mr-2 h-4 w-4" /> Private continuity
          </div>
          <h2 className="mt-5 text-3xl font-light leading-tight text-stone-900">Carry what matters across the whole sanctuary.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">When you intentionally save a ministry moment, Digital Church OS can remember its source and title in your private Journey. The continuity summary never exposes reflection content, financial activity, pastoral case details, child activity, or a spiritual score.</p>

          {loading ? (
            <div className="mt-8 flex items-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading private continuity…</div>
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>
          ) : (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {lanes.map((lane) => {
                const Icon = lane.icon;
                return (
                  <Link key={lane.source} href={lane.href} className="group rounded-2xl border border-stone-200 bg-stone-50 p-4 transition hover:border-sage-200 hover:bg-sage-50">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sage-700 shadow-sm"><Icon className="h-5 w-5" /></span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-stone-600">{lane.count}</span>
                    </div>
                    <p className="mt-4 font-semibold text-stone-900">{lane.label}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">{lane.description}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-300">Recent carried-forward moments</p>
          <h3 className="mt-3 text-2xl font-light">A memory map, not a faith score.</h3>
          <div className="mt-6 space-y-3">
            {!loading && !error && payload?.moments?.length ? payload.moments.slice(0, 8).map((moment) => (
              <div key={moment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-300">{moment.source}</span>
                  <span className="text-[10px] text-stone-500">{new Date(moment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-200">{moment.title}</p>
              </div>
            )) : <p className="text-sm leading-6 text-stone-400">Saved continuity moments will appear here as you intentionally carry insights forward from ministry experiences.</p>}
          </div>
          <div className="mt-6 rounded-2xl border border-sage-300/20 bg-sage-300/10 p-4 text-xs leading-5 text-sage-100">Only metadata needed for continuity is shown here. Reflection content remains in your signed-in private journal entries.</div>
        </aside>
      </div>
    </section>
  );
}
