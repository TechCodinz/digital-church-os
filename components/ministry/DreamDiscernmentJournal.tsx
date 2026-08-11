'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpenText, Brain, HeartHandshake, MoonStar, RotateCcw, Save, ShieldCheck } from 'lucide-react';

type DreamDraft = {
  title: string;
  account: string;
  emotions: string;
  wakingContext: string;
  observations: string;
  assumptions: string;
  recurring: string;
  scriptureThemes: string;
  response: string;
  trustedPerson: boolean;
  updatedAt: string;
};

const emptyDraft: DreamDraft = {
  title: '', account: '', emotions: '', wakingContext: '', observations: '', assumptions: '', recurring: '', scriptureThemes: '', response: '', trustedPerson: false, updatedAt: '',
};

export function DreamDiscernmentJournal() {
  const [draft, setDraft] = useState<DreamDraft>(emptyDraft);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('digital-church-os:dream-discernment');
      if (!raw) return;
      const saved = { ...emptyDraft, ...(JSON.parse(raw) as Partial<DreamDraft>) };
      setDraft(saved);
      setSavedAt(saved.updatedAt || null);
    } catch {
      // Private browser recovery is best-effort.
    }
  }, []);

  const prompts = useMemo(() => {
    const emotion = draft.emotions.trim() || 'the strongest emotion you remember';
    const context = draft.wakingContext.trim() || 'what has been happening in waking life';
    return [
      `What in the dream is directly observed, and what is an interpretation you added afterward?`,
      `How might ${emotion} relate to ${context}?`,
      `Does any recurring theme point you toward prayer, rest, reconciliation, Scripture study, or a trusted conversation rather than a prediction?`,
    ];
  }, [draft.emotions, draft.wakingContext]);

  function update<K extends keyof DreamDraft>(key: K, value: DreamDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function save() {
    const updatedAt = new Date().toISOString();
    const next = { ...draft, updatedAt };
    window.localStorage.setItem('digital-church-os:dream-discernment', JSON.stringify(next));
    setDraft(next);
    setSavedAt(updatedAt);
  }

  function reset() {
    setDraft(emptyDraft);
    setSavedAt(null);
    window.localStorage.removeItem('digital-church-os:dream-discernment');
  }

  return (
    <section className="border-y border-cream-200 bg-white/75 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Private discernment journal</p>
            <h2 className="mt-2 text-3xl font-light text-stone-900 sm:text-4xl">Separate memory, observation, interpretation, and response.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">This workspace helps organize a dream without declaring what it means. Your notes stay in this browser unless you deliberately move context into another Church OS pathway.</p>
          </div>
          <div className="inline-flex items-center rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-800"><MoonStar className="mr-2 h-4 w-4" /> Observation first</div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="grid gap-4">
              <label className="text-sm font-medium text-stone-700">Dream title<input value={draft.title} onChange={(e) => update('title', e.target.value)} placeholder="A private label for this dream" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400" /></label>
              <label className="text-sm font-medium text-stone-700">What happened?<textarea value={draft.account} onChange={(e) => update('account', e.target.value)} rows={6} placeholder="Record sequence, people, places, objects, dialogue, and what you actually remember." className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-stone-700">Emotions<textarea value={draft.emotions} onChange={(e) => update('emotions', e.target.value)} rows={3} placeholder="Fear, peace, grief, confusion, joy..." className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
                <label className="text-sm font-medium text-stone-700">Waking-life context<textarea value={draft.wakingContext} onChange={(e) => update('wakingContext', e.target.value)} rows={3} placeholder="Stress, decisions, relationships, recent events, memories..." className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-stone-700">Direct observations<textarea value={draft.observations} onChange={(e) => update('observations', e.target.value)} rows={4} placeholder="Facts from the dream only." className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
                <label className="text-sm font-medium text-stone-700">My assumptions / possible meanings<textarea value={draft.assumptions} onChange={(e) => update('assumptions', e.target.value)} rows={4} placeholder="Keep interpretations clearly separate from observations." className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              </div>
              <label className="text-sm font-medium text-stone-700">Recurring patterns<textarea value={draft.recurring} onChange={(e) => update('recurring', e.target.value)} rows={3} placeholder="Repeated places, people, emotions, themes, or situations." className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              <label className="text-sm font-medium text-stone-700">Scripture themes to study<textarea value={draft.scriptureThemes} onChange={(e) => update('scriptureThemes', e.target.value)} rows={3} placeholder="References or themes to examine in context—not a claim that the dream is a divine message." className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              <label className="text-sm font-medium text-stone-700">Grounded response<textarea value={draft.response} onChange={(e) => update('response', e.target.value)} rows={3} placeholder="Prayer, rest, journaling, reconciliation, Scripture study, trusted conversation..." className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              <label className="flex items-start gap-3 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700"><input type="checkbox" checked={draft.trustedPerson} onChange={(e) => update('trustedPerson', e.target.checked)} className="mt-1" /><span><strong className="block">I want to discuss this with a trusted human</strong><span className="mt-1 block text-xs leading-5 text-stone-500">Use this as a reminder only. It does not automatically send your notes to anyone.</span></span></label>
            </div>
            <div className="mt-5 flex flex-wrap gap-2"><button onClick={save} type="button" className="inline-flex min-h-11 items-center rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white"><Save className="mr-2 h-4 w-4" /> Save private draft</button><button onClick={reset} type="button" className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-600"><RotateCcw className="mr-2 h-4 w-4" /> Reset</button></div>
            <p className="mt-3 text-xs text-stone-500">{savedAt ? `Private browser draft saved ${new Date(savedAt).toLocaleString()}.` : 'Private browser draft not yet saved.'}</p>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage-300">Reflection questions</p>
              <div className="mt-5 space-y-3">{prompts.map((prompt, index) => <div key={prompt} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-400/20 text-xs font-bold text-sage-200">{index + 1}</span><p className="text-sm leading-6 text-stone-200">{prompt}</p></div></div>)}</div>
              <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100"><strong>Boundary:</strong> this tool does not verify prophecy, predict the future, or tell you that God has revealed a specific instruction through a dream.</div>
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-sage-600" /><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-600">Next step</p><h3 className="text-xl font-light text-stone-900">Discern the response, not a prediction.</h3></div></div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <Link href="/scripture" className="flex min-h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700"><BookOpenText className="mr-2 h-4 w-4 text-sage-600" /> Study Scripture</Link>
                <Link href="/prayer-room" className="flex min-h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700"><HeartHandshake className="mr-2 h-4 w-4 text-sage-600" /> Pray</Link>
                <Link href="/journal" className="flex min-h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700"><Brain className="mr-2 h-4 w-4 text-sage-600" /> Continue journaling</Link>
                <Link href="/care" className="flex min-h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700"><ShieldCheck className="mr-2 h-4 w-4 text-sage-600" /> Human pastoral care</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
