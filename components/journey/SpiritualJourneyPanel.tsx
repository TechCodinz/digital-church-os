'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Footprints,
  Heart,
  HeartHandshake,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

type JourneyPayload = {
  timeline: Array<{ type: string; title: string; date: string; meta?: string }>;
  recentCounts: {
    prayers: number;
    reflections: number;
    goals: number;
    sermonNotes: number;
    milestones: number;
  };
  privacyBoundary: {
    spiritualScoring: false;
    financialActivityExcluded: boolean;
    pastoralCaseDataExcluded: boolean;
    childActivityExcluded: boolean;
  };
};

type FormationLane = {
  id: string;
  label: string;
  description: string;
  href: string;
  cta: string;
  terms: string[];
};

type Continuation = { href: string; label: string };

const formationLanes: FormationLane[] = [
  { id: 'scripture', label: 'Scripture & learning', description: 'Reading, study, teaching, and truth carried into daily life.', href: '/scripture', cta: 'Study Scripture', terms: ['scripture', 'bible', 'study', 'sermon', 'lesson', 'reading'] },
  { id: 'prayer', label: 'Prayer & reflection', description: 'Prayer, gratitude, lament, discernment, journaling, and listening.', href: '/prayer-room', cta: 'Open Prayer Room', terms: ['prayer', 'pray', 'journal', 'reflection', 'fasting'] },
  { id: 'community', label: 'Community & care', description: 'Fellowship, encouragement, family, belonging, and accountable human care.', href: '/community-wall', cta: 'Visit community', terms: ['community', 'family', 'group', 'fellowship', 'pastoral'] },
  { id: 'service', label: 'Service & mission', description: 'Serving people, outreach, responsibility, generosity, and witness.', href: '/outreach', cta: 'Explore service', terms: ['service', 'serve', 'outreach', 'mission', 'volunteer'] },
];

const continuationRoutes: Record<string, Continuation> = {
  'Daily Guide': { href: '/daily-guide', label: 'Continue daily guide' },
  Scripture: { href: '/scripture', label: 'Return to Scripture' },
  Prayer: { href: '/prayer-practice', label: 'Continue prayer' },
  Fasting: { href: '/fasting-prayer', label: 'Continue fasting' },
  'Family Altar': { href: '/family-altar', label: 'Open family altar' },
  Choir: { href: '/choir', label: 'Open choir studio' },
  Sermon: { href: '/sermons', label: 'Open sermons' },
  'Sermon Note': { href: '/sermons', label: 'Open sermons' },
  'Service Response': { href: '/service-response', label: 'Continue response' },
  Journal: { href: '/journal', label: 'Open journal' },
  Goal: { href: '/journey', label: 'Review journey' },
  Milestone: { href: '/journey', label: 'Review journey' },
};

function normalizedText(item: JourneyPayload['timeline'][number]) {
  return `${item.type} ${item.title} ${item.meta || ''}`.toLowerCase();
}

function continuationFor(type: string) {
  return continuationRoutes[type] || { href: '/daily-guide', label: 'Choose next step' };
}

export function SpiritualJourneyPanel() {
  const [payload, setPayload] = useState<JourneyPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reflection, setReflection] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);
  const [reflectionStatus, setReflectionStatus] = useState('');

  const loadJourney = async () => {
    const res = await fetch('/api/journey', { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Unable to load journey.');
    setPayload(data);
  };

  useEffect(() => {
    let mounted = true;
    fetch('/api/journey', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Unable to load journey.');
        if (mounted) setPayload(data);
      })
      .catch((err) => mounted && setError(err instanceof Error ? err.message : 'Unable to load journey.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const formation = useMemo(() => {
    if (!payload) return [];
    return formationLanes.map((lane) => {
      const matchedMoments = payload.timeline.filter((item) => lane.terms.some((term) => normalizedText(item).includes(term)));
      return { ...lane, moments: matchedMoments.length };
    });
  }, [payload]);

  const sourceSummary = useMemo(() => {
    if (!payload) return [] as Array<{ type: string; count: number; href: string }>;
    const counts = payload.timeline.reduce<Record<string, number>>((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([type, count]) => ({ type, count, href: continuationFor(type).href }));
  }, [payload]);

  const saveReflection = async () => {
    const content = reflection.trim();
    if (!content || savingReflection) return;
    setSavingReflection(true);
    setReflectionStatus('');
    try {
      const response = await fetch('/api/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, source: 'Formation' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save reflection.');
      setReflection('');
      setReflectionStatus('Saved privately to your journey.');
      await loadJourney();
    } catch (err) {
      setReflectionStatus(err instanceof Error ? err.message : 'Unable to save reflection.');
    } finally {
      setSavingReflection(false);
    }
  };

  if (loading) return <div className="sanctuary-card flex items-center justify-center p-10 text-stone-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your private journey…</div>;
  if (error) return <div className="sanctuary-card border-red-100 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  if (!payload) return null;

  return (
    <div className="space-y-6">
      <div className="sanctuary-card overflow-hidden p-0 shadow-2xl">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <Footprints className="mt-1 h-8 w-8 shrink-0 text-sage-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-600">Growth DNA · private formation view</p>
                <h2 className="mt-1 text-2xl font-light text-stone-800 sm:text-3xl">Notice your rhythms without turning faith into a score.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Recent moments help you remember where Scripture, prayer, service, family formation, sermons, and reflection intersect. They do not measure holiness, salvation, faithfulness, maturity, God’s approval, or spiritual worth—and they are never used to rank you against another person.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {formation.map((lane) => (
                <div key={lane.id} className="rounded-2xl border border-cream-200 bg-white/80 p-4">
                  <p className="text-sm font-semibold text-stone-800">{lane.label}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{lane.description}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-2xl font-light text-sage-700">{lane.moments}</p>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400">recent app moments</p>
                    </div>
                    <Link href={lane.href} className="text-xs font-semibold text-sage-700 hover:underline">{lane.cta}</Link>
                  </div>
                </div>
              ))}
            </div>

            {sourceSummary.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2" aria-label="Recent journey sources">
                {sourceSummary.map((item) => (
                  <Link key={item.type} href={item.href} className="inline-flex min-h-9 items-center rounded-full border border-sage-100 bg-sage-50 px-3 text-xs font-semibold text-sage-800 transition hover:border-sage-200 hover:bg-white">
                    {item.type}<span className="ml-2 rounded-full bg-white px-1.5 py-0.5 text-[10px] text-sage-700">{item.count}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="border-t border-cream-200 bg-stone-900 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
            <ShieldCheck className="h-7 w-7 text-sage-300" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-sage-200">No spiritual score</p>
            <h3 className="mt-2 text-2xl font-light">Formation stays reflective, not competitive.</h3>
            <p className="mt-3 text-sm leading-6 text-stone-300">Digital Church OS does not convert prayer frequency, giving, AI use, badges, children, pastoral needs, quizzes, wallet points, or ministry activity into a spiritual rating.</p>

            <div className="mt-6 space-y-3 text-sm text-stone-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Financial activity excluded.</span> Giving amounts and wallet balances are not formation signals.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Pastoral case data excluded.</span> Care escalation or crisis details do not appear in this journey summary.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><span className="font-semibold text-white">Child activity excluded.</span> A parent’s formation view is not increased by a child profile or child activity.</div>
            </div>
          </aside>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="sanctuary-card p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-medium text-stone-800"><Sparkles className="h-5 w-5 text-sage-600" /> Recent journey moments</h3>
              <p className="mt-1 text-xs leading-5 text-stone-500">Each continuity moment keeps its source visible so you can resume the experience instead of starting over on another page.</p>
            </div>
            <Link href="/daily-guide" className="text-xs font-semibold text-sage-700">Choose today’s next step →</Link>
          </div>
          <div className="space-y-3">
            {payload.timeline.length === 0 ? (
              <p className="text-sm text-stone-500">No journey moments yet. Begin with Scripture, prayer, reflection, community, or service.</p>
            ) : payload.timeline.slice(0, 12).map((item, index) => {
              const continuation = continuationFor(item.type);
              return (
                <article key={`${item.type}-${item.title}-${index}`} className="rounded-2xl border border-cream-200 bg-white/70 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-sage-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sage-700">{item.type}</span>
                        <span className="text-xs text-stone-400">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <p className="font-medium text-stone-800">{item.title}</p>
                      {item.meta && <p className="mt-1 text-xs leading-5 text-stone-500">{item.meta}</p>}
                    </div>
                    <Link href={continuation.href} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-sage-200 hover:text-sage-700">
                      {continuation.label}<ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="sanctuary-card p-6">
            <div className="flex items-center gap-2"><Target className="h-5 w-5 text-sage-600" /><h3 className="text-xl font-medium text-stone-800">Formation reflection</h3></div>
            <p className="mt-2 text-sm leading-6 text-stone-500">Reflect on what Scripture, prayer, wise counsel, and responsible action are bringing to your attention. AI assistance remains subordinate to Scripture and accountable human care.</p>
            <textarea value={reflection} onChange={(event) => { setReflection(event.target.value); setReflectionStatus(''); }} rows={6} maxLength={2500} placeholder="Write a private reflection, question, prayer, or next step…" className="mt-4 w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-stone-400"><span>Private to your account</span><span>{reflection.length}/2500</span></div>
            <button type="button" onClick={saveReflection} disabled={!reflection.trim() || savingReflection} className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{savingReflection ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Save to private journey'}</button>
            {reflectionStatus && <p className={`mt-3 flex items-center gap-2 text-xs ${reflectionStatus.startsWith('Saved') ? 'text-emerald-700' : 'text-red-600'}`}>{reflectionStatus.startsWith('Saved') && <CheckCircle2 className="h-4 w-4" />}{reflectionStatus}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/scripture" className="rounded-2xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-700"><BookOpen className="mb-3 h-5 w-5 text-sage-600" />Scripture</Link>
            <Link href="/prayer-practice" className="rounded-2xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-700"><Heart className="mb-3 h-5 w-5 text-sage-600" />Prayer practice</Link>
            <Link href="/care" className="rounded-2xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-700"><HeartHandshake className="mb-3 h-5 w-5 text-sage-600" />Human care</Link>
            <Link href="/daily-guide" className="rounded-2xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-700"><Sparkles className="mb-3 h-5 w-5 text-sage-600" />Daily guide</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
