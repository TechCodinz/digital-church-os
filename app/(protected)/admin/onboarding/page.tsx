'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Church,
  HeartHandshake,
  Radio,
  ShieldCheck,
  UsersRound,
  WalletCards,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

type LaunchStep = {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Church;
};

const steps: LaunchStep[] = [
  {
    key: 'identity',
    title: 'Confirm church identity',
    description: 'Set church name, contact details, public profile, service schedule, and core ministry information.',
    href: '/admin/settings',
    icon: Church,
  },
  {
    key: 'people',
    title: 'Set ministry coverage',
    description: 'Review people, departments, volunteers, groups, and the roles needed for healthy ministry operations.',
    href: '/command-center',
    icon: UsersRound,
  },
  {
    key: 'care',
    title: 'Prepare pastoral care',
    description: 'Confirm care escalation, follow-up expectations, human review, and sensitive-response ownership.',
    href: '/care',
    icon: HeartHandshake,
  },
  {
    key: 'live',
    title: 'Configure live service',
    description: 'Set streaming source, service title, interaction posture, and the live-service experience.',
    href: '/live-service',
    icon: Radio,
  },
  {
    key: 'giving',
    title: 'Review giving & stewardship',
    description: 'Confirm offering flows, receipts, transparency expectations, and financial review controls.',
    href: '/transparency',
    icon: WalletCards,
  },
  {
    key: 'release',
    title: 'Run release readiness',
    description: 'Check rights holds, safety queues, provider readiness, public flags, and remaining launch blockers.',
    href: '/release-readiness',
    icon: ShieldCheck,
  },
];

export default function ChurchLaunchOnboardingPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const progress = useMemo(() => Math.round((completed.length / steps.length) * 100), [completed.length]);

  const toggle = (key: string) => {
    setCompleted((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-16 pt-24">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700">
                <Sparkles className="h-3.5 w-3.5" /> Church launch readiness
              </div>
              <h1 className="max-w-3xl text-4xl font-light leading-tight text-stone-900 md:text-5xl">
                Move from signup to a ministry-ready digital sanctuary with a clear launch path.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">
                This checklist keeps technology in service of ministry: people first, human care protected, stewardship reviewed, and public rollout intentional.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const done = completed.includes(step.key);
                  return (
                    <article key={step.key} className={`rounded-3xl border p-5 transition ${done ? 'border-sage-200 bg-sage-50' : 'border-stone-100 bg-stone-50'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <span className={`rounded-2xl p-3 ${done ? 'bg-sage-600 text-white' : 'bg-white text-sage-700 shadow-sm'}`}>
                          {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggle(step.key)}
                          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${done ? 'bg-white text-sage-700' : 'bg-stone-200 text-stone-600'}`}
                        >
                          {done ? 'Ready' : 'Mark ready'}
                        </button>
                      </div>
                      <h2 className="mt-4 text-lg font-semibold text-stone-900">{step.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{step.description}</p>
                      <Link href={step.href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sage-700 hover:text-sage-800">
                        Configure <ArrowRight className="h-4 w-4" />
                      </Link>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-300">Launch posture</p>
              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-stone-400">Readiness progress</p>
                    <p className="mt-1 text-5xl font-light">{progress}%</p>
                  </div>
                  <ShieldCheck className="h-10 w-10 text-sage-300" />
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-sage-400 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-400">
                  Completion here is a planning aid, not a substitute for the automated release-readiness checks and real staging verification.
                </p>
              </div>

              <div className="mt-6 space-y-3 text-sm leading-6 text-stone-300">
                <p>• Keep sensitive care actions human-led.</p>
                <p>• Keep public feature flags controlled until reviewed.</p>
                <p>• Confirm media rights before public distribution.</p>
                <p>• Test giving, notifications, and streams with real staging providers.</p>
              </div>

              <Link href="/release-readiness" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sage-500 px-5 py-3 font-semibold text-white transition hover:bg-sage-400">
                Run release readiness <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
