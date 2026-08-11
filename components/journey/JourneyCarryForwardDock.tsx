'use client';

import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { BookOpenText, CheckCircle2, Footprints, Loader2, Save, X } from 'lucide-react';

type SourceConfig = {
  source: 'Scripture' | 'Prayer' | 'Fasting' | 'Family Altar' | 'Choir' | 'Sermon' | 'Service Response';
  title: string;
  prompt: string;
};

function configFor(pathname: string): SourceConfig | null {
  if (pathname.startsWith('/scripture')) return { source: 'Scripture', title: 'Carry this Scripture study forward', prompt: 'What truth, question, prayer, or application do you want to remember?' };
  if (pathname.startsWith('/prayer-room') || pathname.startsWith('/prayer-practice') || pathname.startsWith('/prayer-watch')) return { source: 'Prayer', title: 'Carry this prayer moment forward', prompt: 'What prayer, gratitude, burden, answer, or next step do you want to remember privately?' };
  if (pathname.startsWith('/fasting-prayer') || pathname.startsWith('/fasting-companion')) return { source: 'Fasting', title: 'Carry this fasting reflection forward', prompt: 'What Scripture, prayer focus, insight, or responsible next step do you want to remember?' };
  if (pathname.startsWith('/family-altar')) return { source: 'Family Altar', title: 'Carry this family worship moment forward', prompt: 'What household theme, prayer, Scripture, or next family step should be remembered?' };
  if (pathname.startsWith('/choir') || pathname.startsWith('/choir-studio')) return { source: 'Choir', title: 'Carry this worship-creation moment forward', prompt: 'What lyric idea, Scripture anchor, rehearsal insight, or service direction should be remembered?' };
  if (pathname.startsWith('/sermons')) return { source: 'Sermon', title: 'Carry this sermon insight forward', prompt: 'What teaching point, Scripture anchor, question, or application do you want to revisit?' };
  if (pathname.startsWith('/service-response') || pathname.startsWith('/live-service')) return { source: 'Service Response', title: 'Carry this service response forward', prompt: 'What prayer, response, commitment, or follow-up step do you want to remember privately?' };
  return null;
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function JourneyCarryForwardDock() {
  const pathname = usePathname();
  const config = useMemo(() => configFor(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [refs, setRefs] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  if (!config) return null;

  const save = async () => {
    if ((!content.trim() && !nextStep.trim()) || saving) return;
    setSaving(true);
    setStatus('');
    try {
      const scriptureRefs = refs.split(/[,\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 12);
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: config.source,
          sourceKey: `${config.source.toLowerCase().replace(/\s+/g, '-')}:${dayKey()}`,
          title: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          content: content.trim(),
          scriptureRefs,
          nextStep: nextStep.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save this moment.');
      setStatus(data.operation === 'updated' ? 'Today’s private Journey moment was updated.' : 'Saved privately to your Journey.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save this moment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-[9.5rem] right-4 z-30 md:bottom-24 md:right-6">
      {open && (
        <section className="pointer-events-auto mb-3 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-2xl" aria-label="Carry this ministry moment to Journey">
          <div className="flex items-start justify-between gap-4 border-b border-stone-100 bg-cream-50 p-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage-700">Private Journey continuity</p>
              <h2 className="mt-1 text-lg font-semibold text-stone-900">{config.title}</h2>
              <p className="mt-2 text-xs leading-5 text-stone-500">{config.prompt}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close carry-forward form" className="rounded-xl p-2 text-stone-500 hover:bg-white"><X className="h-4 w-4" /></button>
          </div>

          <div className="space-y-4 p-5">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-stone-700">Private reflection</span>
              <textarea value={content} onChange={(event) => { setContent(event.target.value); setStatus(''); }} maxLength={3500} rows={5} placeholder="Jot what matters…" className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm leading-6 text-stone-800 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-stone-700"><BookOpenText className="h-3.5 w-3.5" /> Scripture references <span className="font-normal text-stone-400">optional</span></span>
              <input value={refs} onChange={(event) => setRefs(event.target.value)} maxLength={500} placeholder="John 15:1-8, Psalm 23" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-stone-700">One next step <span className="font-normal text-stone-400">optional</span></span>
              <input value={nextStep} onChange={(event) => { setNextStep(event.target.value); setStatus(''); }} maxLength={800} placeholder="One faithful, practical response…" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
            </label>

            <button type="button" onClick={save} disabled={saving || (!content.trim() && !nextStep.trim())} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? 'Saving privately…' : 'Carry to private Journey'}
            </button>
            {status && <p role="status" className={`flex items-start gap-2 text-xs leading-5 ${status.startsWith('Saved') || status.startsWith('Today') ? 'text-emerald-700' : 'text-amber-800'}`}>{(status.startsWith('Saved') || status.startsWith('Today')) && <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />}{status}</p>}
            <p className="text-[10px] leading-4 text-stone-400">This is private to your signed-in account. It is not a spiritual score, public testimony, pastoral case note, or financial record.</p>
          </div>
        </section>
      )}

      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Close Journey carry-forward' : 'Carry this moment to private Journey'} className="pointer-events-auto ml-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-lg transition hover:border-sage-300 hover:text-sage-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400">
        <Footprints className="h-4 w-4 text-sage-700" /> Carry to Journey
      </button>
    </div>
  );
}
