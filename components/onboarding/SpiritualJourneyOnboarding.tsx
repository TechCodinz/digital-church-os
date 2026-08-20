'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpenText, Check, Church, HeartHandshake, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';

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
    return <div className="flex min-h-screen items-center justify-center bg-cream-50"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sage-500 border-t-transparent" /></div>;
  }

  if (complete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4 text-white">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage-500"><Check className="h-9 w-9" /></div>
          <h1 className="mt-6 text-4xl font-light">Your sanctuary is ready.</h1>
          <p className="mt-4 leading-7 text-stone-300">Your dashboard will organize the next steps around the journey you selected. You can change direction anytime.</p>
        </motion.div>
      </div>
    );
  }

  if (!journeyKey) {
    return (
      <div className="min-h-screen bg-cream-50 px-4 pb-16 pt-28">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-semibold text-sage-700"><Sparkles className="mr-2 h-4 w-4" /> Welcome, {firstName}</div>
            <h1 className="mt-6 text-4xl font-light leading-tight text-stone-900 md:text-5xl">How would you like Digital Church OS to serve your journey?</h1>
            <p className="mt-4 text-lg leading-8 text-stone-600">Choose the path that best reflects this season. This shapes recommendations, not your identity, and you can change it later.</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {(Object.entries(journeys) as [JourneyKey, Journey][]).map(([key, item], index) => {
              const Icon = item.icon;
              return (
                <motion.button key={key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} onClick={() => setJourneyKey(key)} className="group rounded-3xl border border-stone-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-sage-200 hover:shadow-lg">
                  <span className="inline-flex rounded-2xl bg-sage-50 p-3 text-sage-700 transition group-hover:bg-sage-600 group-hover:text-white"><Icon className="h-6 w-6" /></span>
                  <h2 className="mt-5 text-xl font-semibold text-stone-900">{item.label}</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.summary}</p>
                  <span className="mt-5 inline-flex items-center text-sm font-semibold text-sage-700">Choose this path <ArrowRight className="ml-2 h-4 w-4" /></span>
                </motion.button>
              );
            })}
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-600">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sage-600" />
            <span>AI features are supportive tools. Scripture, trusted church leadership, human pastoral care, and appropriate professional services remain primary for sensitive needs.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 px-4 pb-16 pt-28">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-500">
          <span>Step {step + 1} of {journey!.steps.length}</span>
          <button onClick={() => router.push('/dashboard')} className="normal-case tracking-normal text-stone-400 hover:text-stone-700">Finish later</button>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full bg-sage-500 transition-all" style={{ width: `${progress}%` }} /></div>

        <AnimatePresence mode="wait">
          <motion.section key={current?.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mt-7 rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="inline-flex rounded-2xl bg-sage-50 p-3 text-sage-700"><UsersRound className="h-6 w-6" /></div>
            <h1 className="mt-5 text-3xl font-light text-stone-900">{current?.title}</h1>
            <p className="mt-4 text-base leading-7 text-stone-600">{current?.description}</p>

            {current?.href && (
              <button onClick={() => router.push(current.href!)} className="mt-6 inline-flex items-center rounded-full border border-sage-200 bg-sage-50 px-5 py-2.5 text-sm font-semibold text-sage-700 transition hover:bg-sage-100">
                {current.actionLabel} <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            )}
          </motion.section>
        </AnimatePresence>

        <button onClick={next} disabled={saving} className="mt-6 flex w-full items-center justify-center rounded-2xl bg-stone-900 px-6 py-4 font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50">
          {isLast ? 'Complete journey setup' : 'Continue'} <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
