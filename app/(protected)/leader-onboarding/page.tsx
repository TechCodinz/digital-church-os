'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Church,
  HeartHandshake,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const steps = [
  {
    id: 'identity',
    title: 'Church identity',
    description: 'Confirm ministry name, location, service rhythm, leadership role, and the ministries you want to activate first.',
    icon: Church,
    actionHref: '/church-network',
    actionLabel: 'Review church profile',
  },
  {
    id: 'team',
    title: 'Team and roles',
    description: 'Prepare pastors, admins, care leaders, media teams, children/youth workers, worship teams, and volunteers for role-based access.',
    icon: Users,
    actionHref: '/admin',
    actionLabel: 'Open admin operations',
  },
  {
    id: 'service',
    title: 'Service experience',
    description: 'Set service times, live stream links, sermon preparation, presentation flow, prayer requests, giving, attendance, and follow-up.',
    icon: Radio,
    actionHref: '/live-service',
    actionLabel: 'Review live service',
  },
  {
    id: 'care',
    title: 'Human care readiness',
    description: 'Assign care ownership, escalation routing, trusted contacts, human review, and appropriate crisis safeguards before opening sensitive workflows.',
    icon: HeartHandshake,
    actionHref: '/care',
    actionLabel: 'Review care workflows',
  },
  {
    id: 'launch',
    title: 'Release readiness',
    description: 'Review media rights, feature flags, safety queues, provider readiness, and launch blockers before enabling broad public participation.',
    icon: ShieldCheck,
    actionHref: '/release-readiness',
    actionLabel: 'Check readiness',
  },
];

export default function LeaderOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const current = steps[step];
  const complete = step === steps.length - 1;
  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);

  const saveStep = async (stepId: string) => {
    setSaving(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'leader', step: stepId }),
      });
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    await saveStep(current.id);
    if (complete) {
      await saveStep('complete');
      router.push('/ministry-command-center');
      return;
    }
    setStep((value) => value + 1);
  };

  const Icon = current.icon;

  return (
    <main className="min-h-screen bg-cream-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center rounded-full border border-sage-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sage-700 shadow-sm">
            <Sparkles className="mr-2 h-4 w-4" /> Leader launch pathway
          </div>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-light leading-tight text-stone-800 md:text-6xl">
            Set up your ministry like an operating system, not a pile of tools.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-600">
            Five focused steps help your team prepare church identity, roles, services, human care, and launch readiness before broader rollout.
          </p>
        </div>

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-400">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{progress}% ready</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full rounded-full bg-sage-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <section className="grid gap-8 rounded-[2rem] border border-stone-100 bg-white p-7 shadow-xl md:grid-cols-[0.75fr_1.25fr] md:p-10">
          <div>
            <div className="inline-flex rounded-3xl bg-sage-100 p-5 text-sage-700">
              <Icon className="h-9 w-9" />
            </div>
            <h2 className="mt-6 text-3xl font-light text-stone-800">{current.title}</h2>
            <p className="mt-4 leading-7 text-stone-600">{current.description}</p>
            <Link href={current.actionHref} className="mt-6 inline-flex items-center text-sm font-semibold text-sage-700 hover:text-sage-800">
              {current.actionLabel} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {steps.map((item, index) => {
              const StepIcon = item.icon;
              const active = index === step;
              const done = index < step;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${active ? 'border-sage-300 bg-sage-50' : 'border-stone-100 bg-stone-50 hover:border-sage-200'}`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${done ? 'bg-sage-600 text-white' : 'bg-white text-sage-700'}`}>
                    {done ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-stone-800">{item.title}</p>
                    <p className="mt-1 text-xs text-stone-500">{index === step ? 'Current focus' : done ? 'Reviewed' : 'Upcoming'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-7 flex flex-col justify-between gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0 || saving}
            className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => void next()}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-sage-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-sage-100 transition hover:bg-sage-700 disabled:opacity-60"
          >
            {complete ? 'Complete leader setup' : 'Save and continue'} <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
