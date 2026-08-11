'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpenText, Church, Compass, RotateCcw, Save, Scale, ShieldCheck } from 'lucide-react';

type TraditionDraft = {
  first: string;
  second: string;
  questions: string;
  sharedGround: string;
  differences: string;
  localPractice: string;
  sourcesToVerify: string;
  updatedAt: string;
};

const emptyDraft: TraditionDraft = {
  first: '', second: '', questions: '', sharedGround: '', differences: '', localPractice: '', sourcesToVerify: '', updatedAt: '',
};

const lenses = [
  'History & origins',
  'Worship & liturgy',
  'Church governance',
  'Baptism & communion',
  'Spiritual formation',
  'Mission & evangelism',
  'Leadership & ministry roles',
  'Statement of faith & doctrine',
];

export function DenominationExplorer() {
  const [draft, setDraft] = useState<TraditionDraft>(emptyDraft);
  const [activeLens, setActiveLens] = useState(lenses[0]);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('digital-church-os:denomination-explorer');
      if (!raw) return;
      const saved = { ...emptyDraft, ...(JSON.parse(raw) as Partial<TraditionDraft>) };
      setDraft(saved);
      setSavedAt(saved.updatedAt || null);
    } catch {
      // Private browser recovery is best-effort.
    }
  }, []);

  const prompt = useMemo(() => {
    const a = draft.first.trim() || 'Tradition A';
    const b = draft.second.trim() || 'Tradition B';
    return `Compare ${a} and ${b} through the lens of ${activeLens.toLowerCase()}. Begin with shared Christian ground, distinguish official teaching from local practice, and list primary sources that should be verified before drawing conclusions.`;
  }, [activeLens, draft.first, draft.second]);

  function update(key: keyof TraditionDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function save() {
    const updatedAt = new Date().toISOString();
    const next = { ...draft, updatedAt };
    window.localStorage.setItem('digital-church-os:denomination-explorer', JSON.stringify(next));
    setDraft(next);
    setSavedAt(updatedAt);
  }

  function reset() {
    setDraft(emptyDraft);
    setSavedAt(null);
    window.localStorage.removeItem('digital-church-os:denomination-explorer');
  }

  return (
    <section className="border-y border-cream-200 bg-white/75 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Tradition comparison workspace</p>
            <h2 className="mt-2 text-3xl font-light text-stone-900 sm:text-4xl">Compare carefully, verify sources, and preserve charity.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Use this as a research notebook—not as an authority that declares what a denomination believes. Official documents and local church statements remain the source of truth.</p>
          </div>
          <div className="inline-flex items-center rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-800"><Scale className="mr-2 h-4 w-4" /> No ranking</div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-stone-700">First tradition<input value={draft.first} onChange={(e) => update('first', e.target.value)} placeholder="e.g. Anglican" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400" /></label>
              <label className="text-sm font-medium text-stone-700">Second tradition<input value={draft.second} onChange={(e) => update('second', e.target.value)} placeholder="e.g. Pentecostal" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400" /></label>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Comparison lens</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lenses.map((lens) => <button key={lens} type="button" onClick={() => setActiveLens(lens)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${activeLens === lens ? 'border-sage-300 bg-sage-50 text-sage-800' : 'border-stone-200 bg-white text-stone-600'}`}>{lens}</button>)}
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="text-sm font-medium text-stone-700">Questions I want answered<textarea value={draft.questions} onChange={(e) => update('questions', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" placeholder="What am I trying to understand rather than prove?" /></label>
              <label className="text-sm font-medium text-stone-700">Shared Christian ground<textarea value={draft.sharedGround} onChange={(e) => update('sharedGround', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" placeholder="Record verified areas of common confession or practice." /></label>
              <label className="text-sm font-medium text-stone-700">Differences to examine<textarea value={draft.differences} onChange={(e) => update('differences', e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" placeholder="Describe differences neutrally and note internal diversity." /></label>
              <label className="text-sm font-medium text-stone-700">Local church practice<textarea value={draft.localPractice} onChange={(e) => update('localPractice', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" placeholder="How does the local church describe its own practice?" /></label>
              <label className="text-sm font-medium text-stone-700">Primary sources to verify<textarea value={draft.sourcesToVerify} onChange={(e) => update('sourcesToVerify', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" placeholder="Confessions, catechisms, denominational statements, church constitution, official pages..." /></label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2"><button onClick={save} type="button" className="inline-flex min-h-11 items-center rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white"><Save className="mr-2 h-4 w-4" /> Save private comparison</button><button onClick={reset} type="button" className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-600"><RotateCcw className="mr-2 h-4 w-4" /> Reset</button></div>
            <p className="mt-3 text-xs text-stone-500">{savedAt ? `Private browser notes saved ${new Date(savedAt).toLocaleString()}.` : 'Private comparison notes have not been saved yet.'}</p>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage-300">Research prompt</p>
              <p className="mt-4 text-sm leading-7 text-stone-200">{prompt}</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-stone-300">Any AI-generated comparison should be treated as a draft research aid. It must not fabricate official beliefs, quotes, councils, confessions, or denominational positions.</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Link href="/church-network" className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-sage-300"><Church className="h-5 w-5 text-sage-600" /><p className="mt-3 font-semibold text-stone-800">Inspect church profiles</p><p className="mt-1 text-sm leading-5 text-stone-500">See what a local church says about itself instead of inferring from a label.</p></Link>
              <Link href="/scripture" className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-sage-300"><BookOpenText className="h-5 w-5 text-sage-600" /><p className="mt-3 font-semibold text-stone-800">Study Scripture</p><p className="mt-1 text-sm leading-5 text-stone-500">Move disputed passages into translation-aware, context-first study.</p></Link>
            </div>
            <div className="rounded-2xl border border-sage-200 bg-sage-50 p-5 text-sm leading-6 text-sage-900"><ShieldCheck className="mb-2 h-5 w-5" /> The aim is informed Christian understanding and respectful dialogue—not doctrinal scoring, conversion pressure, or caricature.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
