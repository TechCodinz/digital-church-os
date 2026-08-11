'use client';

import { useState } from 'react';
import { BookOpenText, CheckCircle2, Loader2, NotebookPen, Sparkles } from 'lucide-react';

const sources = [
  { label: 'Scripture', value: 'Scripture' },
  { label: 'Prayer', value: 'Prayer' },
  { label: 'Fasting & Prayer', value: 'Fasting' },
  { label: 'Live Sermon', value: 'Sermon' },
  { label: 'Sermon Preparation', value: 'Sermon' },
  { label: 'Service Response', value: 'Service Response' },
  { label: 'Daily Guide', value: 'Daily Guide' },
  { label: 'Family Altar', value: 'Family Altar' },
  { label: 'Choir Studio', value: 'Choir' },
] as const;

type SourceValue = (typeof sources)[number]['value'];

export function QuickContinuityCapture() {
  const [source, setSource] = useState<SourceValue>('Scripture');
  const [title, setTitle] = useState('');
  const [scriptureRefs, setScriptureRefs] = useState('');
  const [content, setContent] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const save = async () => {
    const trimmed = content.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setStatus('');

    const refs = scriptureRefs
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);

    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          title: title.trim() || undefined,
          content: trimmed,
          scriptureRefs: refs,
          nextStep: nextStep.trim() || undefined,
          sourceKey: `manual:${source.toLowerCase().replace(/[^a-z0-9]+/g, '-')}:${Date.now()}`,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save this private moment.');

      setTitle('');
      setScriptureRefs('');
      setContent('');
      setNextStep('');
      setStatus('Saved privately to your Journey.');
      window.dispatchEvent(new CustomEvent('digital-church:journey-updated'));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save this private moment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-sage-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="bg-gradient-to-br from-sage-950 via-stone-950 to-violet-950 p-6 text-white sm:p-8">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-sage-300">
            <Sparkles className="mr-2 h-4 w-4" /> Journey quick capture
          </div>
          <h2 className="mt-5 text-3xl font-light leading-tight">Keep one meaningful ministry moment instead of losing it after the screen closes.</h2>
          <p className="mt-4 text-sm leading-6 text-stone-300">Capture a Scripture insight, prayer reflection, fasting observation, sermon response, family worship note, or choir rehearsal insight. This is private continuity—not a spiritual score.</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-stone-300">
            Financial amounts, counseling/crisis case details, child activity, and private pastoral case notes should not be entered here. Sensitive care belongs in the appropriate human-led care workflow.
          </div>
        </aside>

        <div className="p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Ministry source</span>
              <select value={source} onChange={(event) => setSource(event.target.value as SourceValue)} className="min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100">
                {sources.map((item, index) => <option key={`${item.label}-${index}`} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Title · optional</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="What was this moment about?" className="min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500"><BookOpenText className="h-4 w-4" /> Scripture references · optional</span>
            <input value={scriptureRefs} onChange={(event) => setScriptureRefs(event.target.value)} maxLength={500} placeholder="John 15:1-8, Psalm 23" className="min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Private reflection</span>
            <textarea value={content} onChange={(event) => { setContent(event.target.value); setStatus(''); }} maxLength={3500} rows={6} placeholder="What did you notice, learn, pray, question, or want to remember?" className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">One faithful next step · optional</span>
            <input value={nextStep} onChange={(event) => setNextStep(event.target.value)} maxLength={800} placeholder="Pray, study, reconcile, serve, rest, ask a leader…" className="min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
          </label>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-stone-400">{content.length}/3500 · private to your signed-in account</p>
            <button type="button" onClick={save} disabled={!content.trim() || saving} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <NotebookPen className="mr-2 h-4 w-4" />}
              {saving ? 'Saving privately…' : 'Save to Journey'}
            </button>
          </div>
          {status && <p role="status" className={`mt-3 flex items-center gap-2 text-xs ${status.startsWith('Saved') ? 'text-emerald-700' : 'text-red-600'}`}>{status.startsWith('Saved') && <CheckCircle2 className="h-4 w-4" />}{status}</p>}
        </div>
      </div>
    </section>
  );
}
