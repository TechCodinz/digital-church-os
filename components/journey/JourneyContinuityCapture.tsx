'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Footprints, Loader2, NotebookPen, X } from 'lucide-react';

type ContinuityContext = {
  source: 'Scripture' | 'Prayer' | 'Fasting' | 'Family Altar' | 'Choir' | 'Sermon' | 'Service Response';
  label: string;
  title: string;
  prompt: string;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function contextFor(pathname: string): ContinuityContext | null {
  if (pathname.startsWith('/scripture')) return { source: 'Scripture', label: 'Scripture moment', title: 'Scripture reflection', prompt: 'What did you notice in the text, and what do you want to remember or practice?' };
  if (pathname.startsWith('/prayer') || pathname.startsWith('/care')) return { source: 'Prayer', label: 'Prayer moment', title: 'Prayer reflection', prompt: 'What are you bringing before God, receiving from Scripture, or entrusting to wise human care?' };
  if (pathname.startsWith('/fasting')) return { source: 'Fasting', label: 'Fasting moment', title: 'Fasting reflection', prompt: 'What are you learning, praying about, or adjusting responsibly during this fast?' };
  if (pathname.startsWith('/family-altar')) return { source: 'Family Altar', label: 'Family altar moment', title: 'Family altar reflection', prompt: 'What did your household read, pray, discuss, or decide to carry into the week?' };
  if (pathname.startsWith('/choir') || pathname.startsWith('/worship-media')) return { source: 'Choir', label: 'Worship creation moment', title: 'Worship reflection', prompt: 'What theme, Scripture, lyric, arrangement, or rehearsal insight should remain connected to your journey?' };
  if (pathname.startsWith('/sermons') || pathname.startsWith('/live-service')) return { source: 'Sermon', label: 'Sermon moment', title: 'Sermon reflection', prompt: 'What truth, question, Scripture reference, or faithful response do you want to remember?' };
  if (pathname.startsWith('/service-response')) return { source: 'Service Response', label: 'Response moment', title: 'Service response', prompt: 'What response are you choosing—prayer, care, discipleship, serving, reconciliation, or another next step?' };
  return null;
}

export function JourneyContinuityCapture() {
  const pathname = usePathname();
  const context = useMemo(() => contextFor(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [reflection, setReflection] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [scriptureRefs, setScriptureRefs] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  if (!context) return null;

  const save = async () => {
    if (saving || (!reflection.trim() && !nextStep.trim())) return;
    setSaving(true);
    setStatus('');
    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: context.source,
          sourceKey: `${context.source.toLowerCase().replace(/\s+/g, '-')}:${pathname}:${todayKey()}`,
          title: context.title,
          content: reflection.trim(),
          nextStep: nextStep.trim(),
          scriptureRefs: scriptureRefs.split(',').map((item) => item.trim()).filter(Boolean),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save this private journey moment.');
      setStatus(data.operation === 'updated' ? 'Updated today’s private Journey moment.' : 'Added to your private Journey.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save this private journey moment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-[9.5rem] right-4 z-30 md:bottom-24 md:right-6">
      {open && (
        <section className="pointer-events-auto mb-3 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-[1.6rem] border border-stone-200 bg-white shadow-2xl" aria-label="Private Journey capture">
          <div className="flex items-start justify-between gap-4 border-b border-stone-100 bg-cream-50 p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage-700">{context.label}</p>
              <h2 className="mt-1 text-lg font-semibold text-stone-900">Carry this into your private Journey</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Journey capture" className="rounded-xl p-2 text-stone-500 hover:bg-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3 p-4">
            <p className="text-xs leading-5 text-stone-500">{context.prompt}</p>
            <textarea value={reflection} onChange={(event) => { setReflection(event.target.value); setStatus(''); }} maxLength={3500} rows={4} placeholder="Private reflection…" className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm leading-6 text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
            <input value={scriptureRefs} onChange={(event) => { setScriptureRefs(event.target.value); setStatus(''); }} placeholder="Scripture references, comma separated (optional)" className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
            <textarea value={nextStep} onChange={(event) => { setNextStep(event.target.value); setStatus(''); }} maxLength={800} rows={2} placeholder="One faithful next step (optional)…" className="w-full rounded-2xl border border-stone-200 bg-white p-3 text-sm leading-6 text-stone-700 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
            <button type="button" onClick={save} disabled={saving || (!reflection.trim() && !nextStep.trim())} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <NotebookPen className="mr-2 h-4 w-4" />}{saving ? 'Saving privately…' : 'Save / update today’s moment'}
            </button>
            {status && <p role="status" className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs leading-5 ${status.includes('Journey') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{status.includes('Journey') && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}{status}</p>}
            <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3 text-[10px] leading-4 text-stone-400">
              <span>Private to your signed-in account. No spiritual score.</span>
              <Link href="/journey" onClick={() => setOpen(false)} className="font-semibold text-sage-700">Open Journey →</Link>
            </div>
          </div>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Close private Journey capture' : `Save ${context.label.toLowerCase()} to private Journey`} className="pointer-events-auto ml-auto flex min-h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-700 shadow-lg transition hover:border-sage-300 hover:text-sage-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sage-100">
        <Footprints className="h-4 w-4 text-sage-700" /> Remember this
      </button>
    </div>
  );
}
