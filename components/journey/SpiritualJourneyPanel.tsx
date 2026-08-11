'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Footprints,
  Heart,
  HeartHandshake,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

type JourneyPayload = {
  spiritualScore: number;
  metrics: Record<string, number>;
  timeline: Array<{ type: string; title: string; date: string; meta?: string }>;
};

type FormationLane = {
  id: string;
  label: string;
  description: string;
  href: string;
  cta: string;
  terms: string[];
};

const formationLanes: FormationLane[] = [
  {
    id: 'scripture',
    label: 'Scripture & learning',
    description: 'Reading, study, teaching, and truth carried into daily life.',
    href: '/scripture',
    cta: 'Study Scripture',
    terms: ['scripture', 'bible', 'study', 'sermon', 'lesson', 'reading'],
  },
  {
    id: 'prayer',
    label: 'Prayer & reflection',
    description: 'Prayer, gratitude, lament, discernment, journaling, and listening.',
    href: '/prayer-room',
    cta: 'Open Prayer Room',
    terms: ['prayer', 'pray', 'journal', 'reflection', 'fasting'],
  },
  {
    id: 'community',
    label: 'Community & care',
    description: 'Fellowship, pastoral care, encouragement, family, and belonging.',
    href: '/community-wall',
    cta: 'Visit community',
    terms: ['community', 'care', 'family', 'group', 'fellowship', 'pastoral'],
  },
  {
    id: 'service',
    label: 'Service & mission',
    description: 'Serving people, outreach, generosity, responsibility, and witness.',
    href: '/outreach',
    cta: 'Explore service',
    terms: ['service', 'serve', 'outreach', 'mission', 'giving', 'offering', 'volunteer'],
  },
];

function normalizedText(item: JourneyPayload['timeline'][number]) {
  return `${item.type} ${item.title} ${item.meta || ''}`.toLowerCase();
}

export function SpiritualJourneyPanel() {
  const [payload, setPayload] = useState<JourneyPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch('/api/journey', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load journey.');
        if (mounted) setPayload(data);
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const formation = useMemo(() => {
    if (!payload) return [];
    return formationLanes.map((lane) => {
      const matchedMoments = payload.timeline.filter((item) => {
        const text = normalizedText(item);
        return lane.terms.some((term) => text.includes(term));
      });
      const metricHits = Object.entries(payload.metrics).reduce((total, [key, value]) => {
        const lower = key.toLowerCase();
        return total + (lane.terms.some((term) => lower.includes(term)) ? Number(value || 0) : 0);
      }, 0);
      return {
        ...lane,
        moments: matchedMoments.length,
        signal: matchedMoments.length + metricHits,
        latest: matchedMoments[0]?.date || null,
      };
    });
  }, [payload]);

  const nextLane = useMemo(() => {
    if (!formation.length) return null;
    return [...formation].sort((a, b) => a.signal - b.signal)[0];
  }, [formation]);

  const activityCoverage = Math.max(0, Math.min(100, Number(payload?.spiritualScore || 0)));

  const saveReflection = () => {
    try {
      window.localStorage.setItem(
        'digital-church-growth-dna-reflection',
        JSON.stringify({ reflection, savedAt: new Date().toISOString() }),
      );
    } catch {
      // Private browser persistence is optional.
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
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">The system can summarize activity patterns, but it cannot measure holiness, faithfulness, salvation, God’s approval, or spiritual worth. Use these signals for reflection—not comparison.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {formation.map((lane) => (
                <div key={lane.id} className="rounded-2xl border border-cream-200 bg-white/80 p-4">
                  <p className="text-sm font-semibold text-stone-800">{lane.label}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{lane.description}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div><p className="text-2xl font-light text-sage-700">{lane.moments}</p><p className="text-[10px] uppercase tracking-wider text-stone-400">recent moments</p></div>
                    <Link href={lane.href} className="text-xs font-semibold text-sage-700 hover:underline">{lane.cta}</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="border-t border-cream-200 bg-stone-900 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
            <ShieldCheck className="h-7 w-7 text-sage-300" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-sage-200">Activity coverage signal</p>
            <div className="mt-2 flex items-end gap-3"><p className="text-5xl font-light">{activityCoverage}</p><span className="pb-1 text-sm text-stone-400">/ 100</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sage-400" style={{ width: `${activityCoverage}%` }} /></div>
            <p className="mt-4 text-xs leading-5 text-stone-300">This preserves the existing backend signal but labels it accurately: it represents app activity coverage, not spiritual maturity.</p>

            {nextLane && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-sage-200">Gentle next invitation</p>
                <p className="mt-2 font-semibold">{nextLane.label}</p>
                <p className="mt-1 text-xs leading-5 text-stone-300">This lane has fewer visible activity signals. That may simply mean you have not used this app for it.</p>
                <Link href={nextLane.href} className="mt-4 inline-flex items-center text-sm font-semibold text-sage-200">{nextLane.cta}<ArrowRight className="ml-2 h-4 w-4" /></Link>
              </div>
            )}
          </aside>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="sanctuary-card p-6">
          <h3 className="mb-5 flex items-center gap-2 text-xl font-medium text-stone-800"><Sparkles className="h-5 w-5 text-sage-600" /> Recent journey moments</h3>
          <div className="space-y-3">
            {payload.timeline.length === 0 ? <p className="text-sm text-stone-500">No journey moments yet. Begin with Scripture, prayer, reflection, community, or service.</p> : payload.timeline.slice(0, 12).map((item, index) => (
              <div key={`${item.type}-${item.title}-${index}`} className="rounded-2xl border border-cream-200 bg-white/70 p-4">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div><p className="font-medium text-stone-800">{item.title}</p><p className="text-sm text-stone-500">{item.type}{item.meta ? ` · ${item.meta}` : ''}</p></div>
                  <span className="text-xs text-stone-400">{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="sanctuary-card p-6">
            <div className="flex items-center gap-2"><Target className="h-5 w-5 text-sage-600" /><h3 className="text-xl font-medium text-stone-800">Formation reflection</h3></div>
            <p className="mt-2 text-sm leading-6 text-stone-500">What is God’s Word inviting you to practice, repair, receive, or discuss with a trusted person? Keep AI suggestions subordinate to Scripture, wisdom, and accountable human care.</p>
            <textarea value={reflection} onChange={(event) => setReflection(event.target.value)} rows={6} maxLength={2500} placeholder="Write a private reflection, question, prayer, or next step…" className="mt-4 w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
            <button type="button" onClick={saveReflection} className="mt-3 min-h-11 w-full rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white">Save private reflection</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/scripture" className="rounded-2xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-700"><BookOpen className="mb-3 h-5 w-5 text-sage-600" />Scripture</Link>
            <Link href="/prayer-room" className="rounded-2xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-700"><Heart className="mb-3 h-5 w-5 text-sage-600" />Prayer</Link>
            <Link href="/care" className="rounded-2xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-700"><HeartHandshake className="mb-3 h-5 w-5 text-sage-600" />Human care</Link>
            <Link href="/daily-guide" className="rounded-2xl border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-700"><Sparkles className="mb-3 h-5 w-5 text-sage-600" />Daily guide</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
