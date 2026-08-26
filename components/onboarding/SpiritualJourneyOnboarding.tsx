'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BookOpenText,
  Check,
  Church,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

type JourneyKey = 'exploring' | 'growing' | 'serving';

type Step = {
  id: string;
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
};

type Journey = {
  label: string;
  summary: string;
  icon: typeof Sparkles;
  steps: Step[];
};

const journeys: Record<JourneyKey, Journey> = {
  exploring: {
    label: 'I’m exploring faith',
    summary: 'Start gently with prayer, Scripture, community, and room for honest questions.',
    icon: HeartHandshake,
    steps: [
      { id: 'welcome', title: 'Begin without pressure', description: 'Use Digital Church OS as a place to explore Christian faith, ask questions, and connect with trusted people at your own pace.' },
      { id: 'prayer', title: 'Bring what is on your heart', description: 'Use the prayer room for private reflection or request human pastoral follow-up when you want someone to walk with you.', href: '/prayer-room', actionLabel: 'Open Prayer Room' },
      { id: 'scripture', title: 'Read Scripture with context', description: 'Start with a passage, compare translations, take notes, and use AI only as a study aid—not as a replacement for Scripture or pastoral teaching.', href: '/scripture', actionLabel: 'Open Scripture' },
      { id: 'community', title: 'Connect with a church community', description: 'Discover gatherings, services, and people who can help you continue the journey in real community.', href: '/church-network', actionLabel: 'Explore Church Network' },
    ],
  },
  growing: {
    label: 'I want to deepen my walk',
    summary: 'Build a consistent rhythm of Scripture, prayer, worship, reflection, and service.',
    icon: BookOpenText,
    steps: [
      { id: 'journey', title: 'Shape your private spiritual rhythm', description: 'Use your journey timeline, journal, prayer history, and milestones to reflect on growth without turning faith into public competition.', href: '/journey', actionLabel: 'Open My Journey' },
      { id: 'scripture', title: 'Go deeper in the Word', description: 'Study Scripture with historical, linguistic, and theological context while keeping the biblical text primary.', href: '/scripture', actionLabel: 'Study Scripture' },
      { id: 'worship', title: 'Make room for worship', description: 'Join live services, worship media, prayer gatherings, and community moments that reinforce your daily walk.', href: '/live-service', actionLabel: 'Join Live Worship' },
      { id: 'serve', title: 'Let growth become service', description: 'Find a ministry activity, encourage someone, volunteer, or respond to a practical need in your community.', href: '/activities', actionLabel: 'Find Ways to Serve' },
    ],
  },
  serving: {
    label: 'I’m here to serve or lead',
    summary: 'Organize ministry responsibilities, care for people, and use intelligence tools with accountable human leadership.',
    icon: Church,
    steps: [
      { id: 'command', title: 'See what needs attention', description: 'Use ministry command views to understand care needs, service readiness, volunteer coverage, and operational priorities.', href: '/command-center', actionLabel: 'Open Command Center' },
      { id: 'care', title: 'Keep care human-led', description: 'Review prayer and care needs with clear escalation paths. AI can summarize or assist, but sensitive decisions remain with trusted leaders.', href: '/care', actionLabel: 'Review Care' },
      { id: 'service', title: 'Prepare the next gathering', description: 'Coordinate sermons, presentations, live service, worship, and follow-up from one ministry workflow.', href: '/live-service', actionLabel: 'Open Live Service' },
      { id: 'intelligence', title: 'Use ministry intelligence responsibly', description: 'Review advisory insights about engagement and operations while preserving privacy, consent, and human judgment.', href: '/intelligence', actionLabel: 'Open Ministry Intelligence' },
    ],
  },
};

const journeyTone: Record<JourneyKey, string> = {
  exploring: 'from-rose-200/12 via-transparent to-emerald-300/8',
  growing: 'from-amber-200/12 via-transparent to-emerald-300/8',
  serving: 'from-sky-200/10 via-transparent to-amber-200/8',
};

export function SpiritualJourneyOnboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [journeyKey, setJourneyKey] = useState<JourneyKey | null>(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/signin');
  }, [status, router]);

  const journey = journeyKey ? journeys[journeyKey] : null;
  const current = journey?.steps[step];
  const progress = journey ? Math.round(((step + 1) / journey.steps.length) * 100) : 0;
  const isLast = journey ? step === journey.steps.length - 1 : false;
  const firstName = useMemo(() => session?.user?.name?.split(' ')[0] || 'Friend', [session]);

  const persist = async (nextStep: string) => {
    if (!journeyKey) return;
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: nextStep, type: journeyKey }),
      });
    } catch {
      // Onboarding remains usable if persistence is temporarily unavailable.
    }
  };

  const next = async () => {
    if (!journey || !current || !journeyKey || saving) return;
    setSaving(true);
    await persist(current.id);
    if (isLast) {
      await persist('complete');
      setComplete(true);
      setTimeout(() => router.push('/dashboard'), 900);
    } else {
      setStep((value) => value + 1);
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="sanctuary-cinematic-hero relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06110f] text-white">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-vignette" />
        <div className="relative text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-white/12 border-t-amber-200" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Preparing your sanctuary</p>
        </div>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="sanctuary-cinematic-hero relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06110f] px-4 text-white">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="sacred-panel-dark relative z-10 max-w-xl p-8 text-center sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200/25 bg-emerald-300/12 text-emerald-100 shadow-[0_0_70px_rgba(52,211,153,.14)]"><Check className="h-9 w-9" /></div>
          <p className="mt-6 sanctuary-section-label text-amber-100/55">Entrance prepared</p>
          <h1 className="mt-2 text-4xl font-light">Your sanctuary is ready.</h1>
          <p className="mt-4 leading-7 text-white/48">Your dashboard will organize next steps around the path you selected. This is a starting orientation, not a permanent label, and you can change direction anytime.</p>
        </motion.div>
      </div>
    );
  }

  if (!journeyKey) {
    return (
      <main className="sanctuary-page-shell min-h-screen bg-[#06110f] pb-20 pt-20 text-white sm:pt-24">
        <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="sanctuary-light-column" />
          <div className="sanctuary-nave" />
          <div className="sanctuary-vignette" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl"><Sparkles className="mr-2 h-4 w-4" /> Welcome, {firstName}</div>
              <h1 className="mt-6 text-4xl font-light leading-[1.03] text-white md:text-7xl">How should this sanctuary meet you in this season?</h1>
              <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/55 sm:text-lg">Choose the path that best reflects where you want to begin. It shapes navigation and suggestions—not your identity, worth, holiness, or standing before God.</p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {(Object.entries(journeys) as [JourneyKey, Journey][]).map(([key, item], index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => { setJourneyKey(key); setStep(0); }}
                    className="group sacred-panel-dark relative min-h-[280px] overflow-hidden p-6 text-left transition hover:-translate-y-1"
                  >
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${journeyTone[key]} opacity-70`} />
                    <div className="relative">
                      <div className="flex items-start justify-between"><span className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-amber-100"><Icon className="h-6 w-6" /></span><span className="text-[10px] font-bold tracking-[0.2em] text-white/20">0{index + 1}</span></div>
                      <h2 className="mt-8 text-2xl font-light text-white">{item.label}</h2>
                      <p className="mt-3 text-sm leading-7 text-white/45">{item.summary}</p>
                      <span className="mt-8 inline-flex items-center text-sm font-semibold text-emerald-200">Enter this path <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mx-auto mt-8 flex max-w-3xl gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/45 backdrop-blur-xl">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
              <span>AI features remain supportive tools. Scripture, trusted church leadership, human pastoral care, and appropriate professional services remain primary for sensitive needs.</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const JourneyIcon = journey?.icon || Compass;

  return (
    <main className="sanctuary-page-shell min-h-screen bg-[#06110f] px-4 pb-20 pt-28 text-white sm:px-6 lg:px-8">
      <div className="sanctuary-global-aurora" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => { setJourneyKey(null); setStep(0); }} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/55 hover:border-amber-200/20 hover:text-white">Change path</button>
          <button onClick={() => router.push('/dashboard')} className="text-xs font-semibold text-white/35 transition hover:text-white/70">Finish later</button>
        </div>

        <div className="sacred-panel-dark overflow-hidden">
          <div className="relative border-b border-white/8 px-6 py-6 sm:px-8">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200/[0.035] via-transparent to-emerald-300/[0.035]" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-100"><JourneyIcon className="h-5 w-5" /></span>
                <div><p className="sanctuary-section-label text-emerald-200/50">{journey?.label}</p><p className="mt-1 text-sm text-white/40">Step {step + 1} of {journey!.steps.length}</p></div>
              </div>
              <div className="min-w-[180px]">
                <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-white/28"><span>Orientation</span><span>{progress}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-200 transition-all" style={{ width: `${progress}%` }} /></div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.section key={current?.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.26 }} className="relative p-7 sm:p-10">
              <div className="pointer-events-none absolute right-8 top-8 h-40 w-40 rounded-full bg-amber-200/[0.035] blur-3xl" />
              <div className="relative inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-emerald-200"><UsersRound className="h-6 w-6" /></div>
              <h1 className="relative mt-6 max-w-2xl text-4xl font-light leading-tight text-white sm:text-5xl">{current?.title}</h1>
              <p className="relative mt-5 max-w-2xl text-base leading-8 text-white/48">{current?.description}</p>

              {current?.href && (
                <button onClick={() => router.push(current.href!)} className="relative mt-7 inline-flex items-center rounded-full border border-emerald-200/20 bg-emerald-300/8 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/12">
                  {current.actionLabel} <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              )}
            </motion.section>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex gap-3">
          {step > 0 && <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={saving} className="rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white/55 transition hover:text-white disabled:opacity-40">Previous</button>}
          <button onClick={next} disabled={saving} className="flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-amber-200 to-amber-100 px-6 py-4 font-semibold text-[#07110f] shadow-[0_18px_46px_rgba(245,201,120,.15)] transition hover:-translate-y-0.5 disabled:opacity-50">
            {saving ? 'Saving…' : isLast ? 'Complete journey setup' : 'Continue'} <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </main>
  );
}
