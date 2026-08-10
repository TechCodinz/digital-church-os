'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BookOpenText, Check, Heart, Radio, Sparkles, UsersRound } from 'lucide-react';

type FlowItem = {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Heart;
};

const flow: FlowItem[] = [
  {
    key: 'pray',
    title: 'Pray intentionally',
    description: 'Pray for yourself, someone else, or a need in the community.',
    href: '/prayer-room',
    icon: Heart,
  },
  {
    key: 'scripture',
    title: 'Open Scripture',
    description: 'Read, study, or excavate one passage instead of rushing through many.',
    href: '/scripture',
    icon: BookOpenText,
  },
  {
    key: 'worship',
    title: 'Create an atmosphere of worship',
    description: 'Listen, reflect, or join a worship gathering with attention and purpose.',
    href: '/worship-media',
    icon: Radio,
  },
  {
    key: 'serve',
    title: 'Serve someone',
    description: 'Complete a ministry activity, encourage someone, or respond to a practical need.',
    href: '/activities',
    icon: UsersRound,
  },
  {
    key: 'reflect',
    title: 'Reflect & record',
    description: 'Capture what you learned, what changed, and what you want to carry forward.',
    href: '/journal',
    icon: Sparkles,
  },
];

function storageKey() {
  return `digital-church-daily-flow:${new Date().toISOString().slice(0, 10)}`;
}

export function DailyMinistryFlow() {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey());
      if (stored) setCompleted(JSON.parse(stored));
    } catch {
      // Local progress is optional; the experience still works without browser storage.
    }
  }, []);

  const progress = useMemo(() => Math.round((completed.length / flow.length) * 100), [completed.length]);

  const toggle = (key: string) => {
    setCompleted((current) => {
      const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      try {
        window.localStorage.setItem(storageKey(), JSON.stringify(next));
      } catch {
        // Ignore local-storage failures.
      }
      return next;
    });
  };

  return (
    <section className="mb-12 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
            <Sparkles className="mr-2 h-3.5 w-3.5" /> Today with purpose
          </div>
          <h2 className="text-3xl font-light text-stone-900">A simple daily rhythm that turns engagement into growth.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            This is private on your device. It is designed to encourage consistent spiritual practice without turning faith into a public scorecard.
          </p>
        </div>
        <div className="min-w-[180px] rounded-2xl bg-stone-950 px-5 py-4 text-white">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-stone-400">
            <span>Daily rhythm</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-sage-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-stone-400">{completed.length} of {flow.length} meaningful actions</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {flow.map((item) => {
          const Icon = item.icon;
          const done = completed.includes(item.key);
          return (
            <article key={item.key} className={`rounded-3xl border p-4 transition ${done ? 'border-sage-200 bg-sage-50' : 'border-stone-100 bg-stone-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-2xl p-2.5 ${done ? 'bg-sage-600 text-white' : 'bg-white text-sage-700 shadow-sm'}`}>
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(item.key)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${done ? 'bg-white text-sage-700' : 'bg-stone-200 text-stone-600 hover:bg-sage-100 hover:text-sage-700'}`}
                  aria-pressed={done}
                >
                  {done ? 'Done' : 'Mark done'}
                </button>
              </div>
              <h3 className="mt-4 font-semibold text-stone-900">{item.title}</h3>
              <p className="mt-2 min-h-[72px] text-xs leading-5 text-stone-600">{item.description}</p>
              <Link href={item.href} className="mt-4 inline-flex text-sm font-semibold text-sage-700 hover:text-sage-800">
                Open →
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
