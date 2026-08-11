'use client';

import Link from 'next/link';
import { ArrowRight, Footprints, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { JourneyContinuityAction } from './JourneyContinuityAction';

type JourneySource =
  | 'Daily Guide'
  | 'Scripture'
  | 'Prayer'
  | 'Fasting'
  | 'Family Altar'
  | 'Choir'
  | 'Sermon'
  | 'Service Response';

type JourneyContinuityComposerProps = {
  source: JourneySource;
  title: string;
  prompt: string;
  sourceKey?: string;
  scriptureRefs?: string[];
  nextHref?: string;
  nextLabel?: string;
  privacyNote?: string;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function JourneyContinuityComposer({
  source,
  title,
  prompt,
  sourceKey,
  scriptureRefs = [],
  nextHref = '/daily-guide',
  nextLabel = 'Continue in Daily Guide',
  privacyNote = 'Only what you type here is carried into your private Journey. The rest of this page is not copied automatically.',
}: JourneyContinuityComposerProps) {
  const [reflection, setReflection] = useState('');
  const [nextStep, setNextStep] = useState('');
  const keyedSource = useMemo(() => sourceKey || `${source.toLowerCase().replace(/\s+/g, '-')}:${todayKey()}`, [source, sourceKey]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-sage-100 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1fr_0.42fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-700"><Footprints className="h-5 w-5" /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sage-700">Private Journey continuity · {source}</p>
              <h2 className="mt-2 text-2xl font-light text-stone-900">{title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{prompt}</p>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">What do you want to remember?</span>
            <textarea
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              maxLength={3500}
              rows={5}
              placeholder="Write the insight, prayer, question, lesson, or reflection you intentionally want to carry forward…"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-800 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">One next step · optional</span>
            <input
              value={nextStep}
              onChange={(event) => setNextStep(event.target.value)}
              maxLength={800}
              placeholder="A practical action, conversation, prayer, rehearsal, or follow-up…"
              className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-800 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100"
            />
          </label>

          <div className="mt-4 flex flex-wrap items-start gap-3">
            <JourneyContinuityAction
              source={source}
              sourceKey={keyedSource}
              title={title}
              content={reflection}
              scriptureRefs={scriptureRefs}
              nextStep={nextStep}
            />
            <Link href={nextHref} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-sage-200 hover:text-sage-700">
              {nextLabel}<ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        <aside className="border-t border-sage-100 bg-sage-50 p-6 sm:p-8 lg:border-l lg:border-t-0">
          <ShieldCheck className="h-6 w-6 text-sage-700" />
          <h3 className="mt-4 text-lg font-semibold text-stone-900">You control the handoff.</h3>
          <p className="mt-2 text-xs leading-5 text-stone-600">{privacyNote}</p>
          <p className="mt-4 text-xs leading-5 text-stone-500">Journey continuity is reflective memory, not a holiness score. Giving amounts, child activity, pastoral case details, and crisis/care records are excluded.</p>
          <Link href="/journey" className="mt-5 inline-flex text-xs font-semibold text-sage-700">Review private Journey →</Link>
        </aside>
      </div>
    </section>
  );
}
