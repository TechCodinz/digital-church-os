'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BookOpenText, Compass, HeartHandshake, Loader2, Music2, ShieldCheck, Sparkles, Sunrise, UsersRound } from 'lucide-react';

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

type Lane = {
  id: string;
  label: string;
  href: string;
  icon: typeof Sparkles;
  sources: string[];
  invitation: string;
};

const lanes: Lane[] = [
  {
    id: 'word',
    label: 'Scripture & teaching',
    href: '/scripture',
    icon: BookOpenText,
    sources: ['Scripture', 'Sermon', 'Live Sermon'],
    invitation: 'Revisit one passage in context and carry one truth into prayer or practice.',
  },
  {
    id: 'prayer',
    label: 'Prayer & fasting',
    href: '/prayer-practice',
    icon: HeartHandshake,
    sources: ['Prayer', 'Fasting', 'Fasting & Prayer'],
    invitation: 'Make room for honest prayer, gratitude, lament, intercession, or quiet reflection.',
  },
  {
    id: 'response',
    label: 'Daily response',
    href: '/daily-guide',
    icon: Sunrise,
    sources: ['Daily Guide', 'Service Response'],
    invitation: 'Choose one realistic response for today rather than carrying too many intentions at once.',
  },
  {
    id: 'family',
    label: 'Family & community',
    href: '/family-altar',
    icon: UsersRound,
    sources: ['Family Altar'],
    invitation: 'Turn one formation theme outward through household worship, encouragement, reconciliation, or service.',
  },
  {
    id: 'worship',
    label: 'Worship & creativity',
    href: '/choir',
    icon: Music2,
    sources: ['Choir', 'Choir Studio'],
    invitation: 'Revisit the Scripture or ministry purpose behind a worship-creation session before adding more material.',
  },
];

function withinLastDays(value: string, days: number) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  return time >= Date.now() - days * 24 * 60 * 60 * 1000;
}

export function WeeklyFormationSynthesis() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch('/api/journey/continuity', { cache: 'no-store' });
        const data = await response.json().catch(() => ({})) as Payload & { error?: string };
        if (!active) return;
        if (!response.ok) {
          setMessage(response.status === 401 ? 'Sign in to see your private weekly synthesis.' : (data.error || 'Weekly synthesis is temporarily unavailable.'));
          return;
        }
        setMoments(Array.isArray(data.moments) ? data.moments : []);
        setMessage('');
      } catch {
        if (active) setMessage('Weekly synthesis is temporarily unavailable.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    const refresh = () => void load();
    window.addEventListener('digital-church:journey-updated', refresh);
    return () => {
      active = false;
      window.removeEventListener('digital-church:journey-updated', refresh);
    };
  }, []);

  const weekly = useMemo(() => moments.filter((moment) => withinLastDays(moment.createdAt, 7)), [moments]);

  const laneStats = useMemo(() => lanes.map((lane) => ({
    ...lane,
    count: weekly.filter((moment) => lane.sources.includes(moment.source)).length,
  })), [weekly]);

  const strongest = useMemo(() => [...laneStats].sort((a, b) => b.count - a.count)[0], [laneStats]);
  const quietest = useMemo(() => [...laneStats].sort((a, b) => a.count - b.count)[0], [laneStats]);
  const mostRecent = weekly[0];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.18fr_0.82fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><Compass className="h-5 w-5" /></span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-700">Weekly reflection synthesis</p>
              <h2 className="mt-1 text-2xl font-light text-stone-900">Notice what you have been carrying without turning it into a score.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">This synthesis looks only at the source and date of moments you deliberately saved during the last seven days. It does not read the private reflection text or infer holiness, maturity, God’s approval, or spiritual health.</p>
            </div>
          </div>

          {loading ? (
            <div className="mt-7 flex min-h-[150px] items-center justify-center text-sm text-stone-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing your private weekly view…</div>
          ) : message ? (
            <p className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">{message}</p>
          ) : (
            <>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {laneStats.map((lane) => {
                  const Icon = lane.icon;
                  return (
                    <Link key={lane.id} href={lane.href} className="rounded-2xl border border-stone-100 bg-stone-50 p-4 transition hover:border-violet-200 hover:bg-violet-50/40">
                      <div className="flex items-center justify-between gap-2"><Icon className="h-4 w-4 text-violet-700" /><span className="text-2xl font-light text-stone-800">{lane.count}</span></div>
                      <p className="mt-3 text-xs font-semibold leading-5 text-stone-700">{lane.label}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-stone-400">saved this week</p>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-sage-100 bg-sage-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sage-700">Most present lane</p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">{strongest?.count ? strongest.label : 'No saved lane yet'}</p>
                  <p className="mt-2 text-xs leading-5 text-stone-600">{strongest?.count ? `You intentionally saved ${strongest.count} moment${strongest.count === 1 ? '' : 's'} here this week.` : 'Save only what you actually want to remember.'}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">A quieter lane</p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">{quietest?.label || 'Formation'}</p>
                  <p className="mt-2 text-xs leading-5 text-stone-600">A low count is not a failure. If this lane matters in your season, consider one gentle visit rather than chasing balance for its own sake.</p>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">Most recent handoff</p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">{mostRecent ? mostRecent.source : 'Nothing saved yet'}</p>
                  <p className="mt-2 text-xs leading-5 text-stone-600">{mostRecent ? `Saved ${new Date(mostRecent.createdAt).toLocaleDateString()}. You can revisit the source rather than starting from zero.` : 'Your Journey can remain empty until you intentionally save something.'}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8">
          <ShieldCheck className="h-7 w-7 text-violet-300" />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300">One faithful next step</p>
          <h3 className="mt-2 text-2xl font-light">Choose depth over activity volume.</h3>
          <p className="mt-3 text-sm leading-6 text-stone-300">The system deliberately avoids recommending “more app activity.” Instead, use the lane that genuinely needs attention in your present life and church context.</p>

          <div className="mt-5 space-y-3">
            {quietest && (
              <Link href={quietest.href} className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-300">Optional invitation · {quietest.label}</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">{quietest.invitation}</p>
              </Link>
            )}
            <Link href="/daily-guide" className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
              <p className="text-xs font-bold uppercase tracking-wider text-sage-300">Daily Guide</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">Turn one remembered theme into a calm morning intention, prayer, act of service, or evening reflection.</p>
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-[11px] leading-5 text-stone-400">
            This is a reflective organization tool, not prophecy, diagnosis, pastoral judgment, or a spiritual-performance dashboard. Sensitive care belongs with trusted human support.
          </div>
        </aside>
      </div>
    </section>
  );
}
