'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Footprints, Loader2, ShieldCheck } from 'lucide-react';

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

const sourceHref: Record<string, string> = {
  'Daily Guide': '/daily-guide',
  Scripture: '/scripture',
  Prayer: '/prayer-room',
  Fasting: '/fasting-prayer',
  'Family Altar': '/family-altar',
  Choir: '/choir',
  Sermon: '/sermons',
  'Service Response': '/service-response',
};

export function DashboardJourneyResume() {
  const [latest, setLatest] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/journey/continuity', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<Payload>;
      })
      .then((data) => {
        if (!active || !data) return;
        setLatest(Array.isArray(data.moments) && data.moments.length ? data.moments[0] : null);
      })
      .catch(() => undefined)
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <section className="mb-12 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="p-6 sm:p-7">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-sage-200"><Footprints className="h-6 w-6" /></span>
        </div>
        <div className="px-6 pb-3 sm:px-7 md:px-0 md:pb-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage-700">Resume your private Journey</p>
          {loading ? (
            <div className="mt-2 flex items-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking your latest saved continuity…</div>
          ) : latest ? (
            <>
              <h2 className="mt-2 text-2xl font-light text-stone-900">{latest.title}</h2>
              <p className="mt-2 text-sm text-stone-500">{latest.source} · {new Date(latest.createdAt).toLocaleDateString()}</p>
              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-stone-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" />Only source/title/date are used here. Your private reflection text stays inside your account-scoped Journey record.</p>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-light text-stone-900">Start a continuity moment when something is worth remembering.</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">Scripture, prayer, fasting, family worship, choir, sermons and service responses can all be intentionally carried into one private Journey.</p>
            </>
          )}
        </div>
        <div className="p-6 sm:p-7">
          <div className="grid gap-2">
            <Link href={latest ? (sourceHref[latest.source] || '/journey') : '/daily-guide'} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white hover:bg-sage-700">
              {latest ? 'Resume source' : 'Begin today'} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/journey" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 hover:border-sage-200">Open Journey</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
