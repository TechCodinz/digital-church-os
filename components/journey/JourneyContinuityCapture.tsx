'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CheckCircle2, Footprints, Loader2, NotebookPen, ShieldCheck } from 'lucide-react';

type JourneySource =
  | 'Scripture'
  | 'Prayer'
  | 'Fasting'
  | 'Fasting & Prayer'
  | 'Family Altar'
  | 'Choir'
  | 'Choir Studio'
  | 'Sermon'
  | 'Live Sermon'
  | 'Service Response'
  | 'Pastoral Reflection';

type JourneyContinuityCaptureProps = {
  source: JourneySource;
  sourceKey?: string;
  title: string;
  prompt: string;
  nextStepPrompt?: string;
  scriptureRefs?: string[];
  compact?: boolean;
};

function dailyKey(source: string) {
  return `${source.toLowerCase().replace(/[^a-z0-9]+/g, '-')}:${new Date().toISOString().slice(0, 10)}`;
}

export function JourneyContinuityCapture({
  source,
  sourceKey,
  title,
  prompt,
  nextStepPrompt = 'What is one faithful next step you want to remember?',
  scriptureRefs = [],
  compact = false,
}: JourneyContinuityCaptureProps) {
  const [reflection, setReflection] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const resolvedKey = useMemo(() => sourceKey || dailyKey(source), [source, sourceKey]);

  const save = async () => {
    if (saving || (!reflection.trim() && !nextStep.trim())) return;
    setSaving(true);
    setStatus('');
    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          sourceKey: resolvedKey,
          title,
          content: reflection.trim(),
          scriptureRefs,
          nextStep: nextStep.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(data.error || 'Unable to save this private Journey moment.');
        return;
      }
      setStatus(data.operation === 'updated' ? 'Your private Journey moment was updated.' : 'Saved privately to your Journey.');
    } catch {
      setStatus('Journey sync is temporarily unavailable. Your text remains on this page.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={`rounded-[1.75rem] border border-sage-100 bg-gradient-to-br from-white via-cream-50 to-sage-50 shadow-sm ${compact ? 'p-5' : 'p-6 sm:p-7'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sage-700">
            <Footprints className="h-4 w-4" /> Carry this into Journey
          </div>
          <h3 className={`mt-2 font-light text-stone-900 ${compact ? 'text-xl' : 'text-2xl'}`}>{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{prompt}</p>
        </div>
        <ShieldCheck className="h-6 w-6 shrink-0 text-sage-600" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label>
          <span className="mb-2 block text-xs font-semibold text-stone-600">Private reflection</span>
          <textarea
            value={reflection}
            onChange={(event) => { setReflection(event.target.value); setStatus(''); }}
            maxLength={6000}
            rows={compact ? 4 : 5}
            placeholder="Write only what you intentionally want remembered in your private Journey…"
            className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100"
          />
        </label>
        <label>
          <span className="mb-2 block text-xs font-semibold text-stone-600">One next step</span>
          <textarea
            value={nextStep}
            onChange={(event) => { setNextStep(event.target.value); setStatus(''); }}
            maxLength={1000}
            rows={compact ? 4 : 5}
            placeholder={nextStepPrompt}
            className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-[11px] leading-5 text-stone-500">Nothing is saved automatically. This is private to the signed-in account, is not used for spiritual scoring, and should not contain counseling, crisis, medical, safeguarding, financial, or child-sensitive details.</p>
        <div className="flex shrink-0 gap-2">
          <Link href="/journey" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700">Open Journey</Link>
          <button type="button" onClick={save} disabled={saving || (!reflection.trim() && !nextStep.trim())} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <NotebookPen className="mr-2 h-4 w-4" />}
            {saving ? 'Saving…' : 'Save privately'}
          </button>
        </div>
      </div>

      {status && (
        <p role="status" className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${status.startsWith('Saved') || status.startsWith('Your') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
          {(status.startsWith('Saved') || status.startsWith('Your')) && <CheckCircle2 className="h-4 w-4" />}
          {status}
        </p>
      )}
    </section>
  );
}
