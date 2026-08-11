'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpenText, CheckCircle2, Loader2, NotebookPen, ShieldCheck } from 'lucide-react';

type AllowedSource = 'Scripture' | 'Prayer' | 'Choir' | 'Sermon';

type Props = {
  source: AllowedSource;
  title: string;
  description: string;
  placeholder?: string;
  nextStepPlaceholder?: string;
  defaultScriptureRef?: string;
};

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 56);
}

export function JourneyCarryForward({
  source,
  title,
  description,
  placeholder = 'What do you want to remember from this moment?',
  nextStepPlaceholder = 'What is one faithful next step?',
  defaultScriptureRef = '',
}: Props) {
  const [reflection, setReflection] = useState('');
  const [scriptureRef, setScriptureRef] = useState(defaultScriptureRef);
  const [nextStep, setNextStep] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const sourceKey = useMemo(() => `carry-forward:${slug(source)}:${dayKey()}`, [source]);

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
          sourceKey,
          title: `${title} · ${dayKey()}`,
          content: reflection.trim(),
          scriptureRefs: scriptureRef.trim() ? [scriptureRef.trim()] : [],
          nextStep: nextStep.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save this private journey moment.');
      setStatus(data.operation === 'updated' ? 'Today’s private journey moment was updated.' : 'Saved privately to your Journey.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save this private journey moment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700"><NotebookPen className="mr-2 h-4 w-4" /> Carry forward</div>
            <h2 className="mt-4 text-3xl font-light text-stone-900">{title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">{description}</p>

            <label className="mt-6 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Private takeaway</span>
              <textarea value={reflection} onChange={(event) => { setReflection(event.target.value); setStatus(''); }} maxLength={2400} rows={5} placeholder={placeholder} className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-800 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
            </label>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Scripture reference · optional</span>
                <input value={scriptureRef} onChange={(event) => { setScriptureRef(event.target.value); setStatus(''); }} maxLength={160} placeholder="e.g. John 15:1-8" className="min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm outline-none focus:border-sage-300" />
              </label>
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">One next step</span>
                <input value={nextStep} onChange={(event) => { setNextStep(event.target.value); setStatus(''); }} maxLength={700} placeholder={nextStepPlaceholder} className="min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm outline-none focus:border-sage-300" />
              </label>
            </div>

            <button type="button" onClick={save} disabled={saving || (!reflection.trim() && !nextStep.trim())} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}{saving ? 'Saving privately…' : 'Save to private Journey'}
            </button>
            {status && <p className="mt-3 text-xs leading-5 text-stone-500" role="status">{status}</p>}
          </div>

          <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:border-l lg:border-t-0">
            <ShieldCheck className="h-7 w-7 text-sage-300" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-sage-300">Private continuity</p>
            <h3 className="mt-2 text-2xl font-light">Keep the insight, not a surveillance trail.</h3>
            <div className="mt-5 space-y-3 text-sm leading-6 text-stone-300">
              <p>This saves only what you intentionally type as a private account reflection.</p>
              <p>It does not turn prayer, Bible study, worship, or sermon engagement into a holiness score.</p>
              <p>Sensitive pastoral, crisis, safeguarding, medical, financial, or child information belongs in its dedicated protected workflow—not here.</p>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <Link href="/journey" className="rounded-xl bg-sage-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-sage-400">Open private Journey</Link>
              {scriptureRef.trim() && <Link href={`/scripture?ref=${encodeURIComponent(scriptureRef.trim())}`} className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-100"><BookOpenText className="mr-2 h-4 w-4" /> Study reference</Link>}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
