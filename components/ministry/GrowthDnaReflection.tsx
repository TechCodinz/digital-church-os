'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Leaf, RotateCcw, Save, Sparkles } from 'lucide-react';

type RhythmState = 'nourishing' | 'steady' | 'attention' | 'resting';
type RhythmKey = 'scripture' | 'prayer' | 'worship' | 'community' | 'service' | 'rest' | 'relationships' | 'reflection';

type GrowthDraft = {
  season: string;
  rhythms: Record<RhythmKey, RhythmState>;
  grace: string;
  resistance: string;
  fatigue: string;
  relationships: string;
  service: string;
  question: string;
  chosenFocus: RhythmKey;
  nextStep: string;
  updatedAt: string;
};

const rhythmLabels: Record<RhythmKey, string> = {
  scripture: 'Scripture', prayer: 'Prayer', worship: 'Worship', community: 'Community',
  service: 'Service', rest: 'Rest', relationships: 'Relationships', reflection: 'Reflection',
};

const emptyDraft: GrowthDraft = {
  season: '',
  rhythms: { scripture: 'steady', prayer: 'steady', worship: 'steady', community: 'steady', service: 'steady', rest: 'steady', relationships: 'steady', reflection: 'steady' },
  grace: '', resistance: '', fatigue: '', relationships: '', service: '', question: '', chosenFocus: 'scripture', nextStep: '', updatedAt: '',
};

const states: { value: RhythmState; label: string }[] = [
  { value: 'nourishing', label: 'Nourishing' },
  { value: 'steady', label: 'Steady' },
  { value: 'attention', label: 'Needs attention' },
  { value: 'resting', label: 'Resting this season' },
];

const LEGACY_STORAGE_KEY = 'digital-church-os:growth-dna';

function storageKey(userId: string) {
  return `digital-church-os:growth-dna:v2:${userId}`;
}

export function GrowthDnaReflection() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id || '';
  const [draft, setDraft] = useState<GrowthDraft>(emptyDraft);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [storageNotice, setStorageNotice] = useState('');
  const [legacyDraftPresent, setLegacyDraftPresent] = useState(false);

  useEffect(() => {
    if (!userId) return;

    try {
      const scopedRaw = window.localStorage.getItem(storageKey(userId));
      const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      setLegacyDraftPresent(Boolean(legacyRaw));

      // Never auto-import the old unscoped draft. On a shared browser its owner is ambiguous.
      if (!scopedRaw) return;

      const saved = JSON.parse(scopedRaw) as Partial<GrowthDraft>;
      setDraft({ ...emptyDraft, ...saved, rhythms: { ...emptyDraft.rhythms, ...(saved.rhythms || {}) } });
      setSavedAt(saved.updatedAt || null);
    } catch {
      setStorageNotice('Private Growth DNA notes could not be restored from this browser.');
    }
  }, [userId]);

  const suggestedStep = useMemo(() => {
    const focus = rhythmLabels[draft.chosenFocus];
    const state = draft.rhythms[draft.chosenFocus];
    if (draft.nextStep.trim()) return draft.nextStep.trim();
    if (state === 'resting') return `Protect a healthy ${focus.toLowerCase()} rhythm that fits this life season without forcing intensity.`;
    if (state === 'attention') return `Choose one small ${focus.toLowerCase()} action you can repeat this week without pressure.`;
    if (state === 'nourishing') return `Keep receiving from ${focus.toLowerCase()} and consider how that grace can gently strengthen another area.`;
    return `Continue one simple ${focus.toLowerCase()} practice this week and notice what fruit or resistance emerges.`;
  }, [draft.chosenFocus, draft.nextStep, draft.rhythms]);

  function update<K extends keyof GrowthDraft>(key: K, value: GrowthDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateRhythm(key: RhythmKey, value: RhythmState) {
    setDraft((current) => ({ ...current, rhythms: { ...current.rhythms, [key]: value } }));
  }

  function save() {
    if (!userId) {
      setStorageNotice('Sign in is required before private Growth DNA notes can be saved.');
      return;
    }

    try {
      const updatedAt = new Date().toISOString();
      const next = { ...draft, updatedAt };
      window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
      setDraft(next);
      setSavedAt(updatedAt);
      setStorageNotice('Saved to this signed-in account’s browser-scoped draft.');
    } catch {
      setStorageNotice('Private Growth DNA notes could not be saved in this browser.');
    }
  }

  function reset() {
    setDraft(emptyDraft);
    setSavedAt(null);
    if (!userId) return;
    try {
      window.localStorage.removeItem(storageKey(userId));
      setStorageNotice('This account’s Growth DNA browser draft was reset.');
    } catch {
      setStorageNotice('This browser draft could not be reset.');
    }
  }

  function removeLegacyDraft() {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      setLegacyDraftPresent(false);
      setStorageNotice('Legacy unscoped Growth DNA draft removed.');
    } catch {
      setStorageNotice('Legacy Growth DNA draft could not be removed.');
    }
  }

  return (
    <section className="border-y border-cream-200 bg-white/75 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Weekly formation reflection</p>
            <h2 className="mt-2 text-3xl font-light text-stone-900 sm:text-4xl">Describe the season. Notice the rhythms. Choose one next step.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">This is intentionally descriptive, not a holiness score. Reduced activity can reflect grief, illness, caregiving, disability, travel, workload, or a legitimate season of rest.</p>
          </div>
          <div className="inline-flex items-center rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-800"><Leaf className="mr-2 h-4 w-4" /> No ranking</div>
        </div>

        {legacyDraftPresent && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            An older unscoped browser reflection exists. It was <strong>not imported</strong> because this browser may be shared and its original owner cannot be verified.
            <button type="button" onClick={removeLegacyDraft} className="ml-2 font-semibold underline">Remove legacy draft</button>
          </div>
        )}
        {storageNotice && <p className="mb-5 text-xs text-stone-500">{storageNotice}</p>}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <label className="text-sm font-medium text-stone-700">What season are you in?<textarea value={draft.season} onChange={(e) => update('season', e.target.value)} rows={3} placeholder="Workload, caregiving, grief, recovery, transition, renewed energy, uncertainty..." className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(Object.keys(rhythmLabels) as RhythmKey[]).map((key) => (
                <div key={key} className="rounded-2xl border border-stone-200 p-4">
                  <p className="text-sm font-semibold text-stone-800">{rhythmLabels[key]}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {states.map((state) => (
                      <button key={state.value} type="button" onClick={() => updateRhythm(key, state.value)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${draft.rhythms[key] === state.value ? 'border-sage-400 bg-sage-50 text-sage-800' : 'border-stone-200 text-stone-500 hover:border-sage-200'}`}>{state.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-stone-700">Where did you notice grace?<textarea value={draft.grace} onChange={(e) => update('grace', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              <label className="text-sm font-medium text-stone-700">Where did you notice resistance?<textarea value={draft.resistance} onChange={(e) => update('resistance', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              <label className="text-sm font-medium text-stone-700">Fatigue, limits, or rest needs<textarea value={draft.fatigue} onChange={(e) => update('fatigue', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              <label className="text-sm font-medium text-stone-700">Relationships worth attention<textarea value={draft.relationships} onChange={(e) => update('relationships', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              <label className="text-sm font-medium text-stone-700">Service opportunity<textarea value={draft.service} onChange={(e) => update('service', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              <label className="text-sm font-medium text-stone-700">Question to carry forward<textarea value={draft.question} onChange={(e) => update('question', e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2"><button onClick={save} type="button" className="inline-flex min-h-11 items-center rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white"><Save className="mr-2 h-4 w-4" /> Save private reflection</button><button onClick={reset} type="button" className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-600"><RotateCcw className="mr-2 h-4 w-4" /> Reset</button></div>
            <p className="mt-3 text-xs text-stone-500">{savedAt ? `Account-scoped browser reflection saved ${new Date(savedAt).toLocaleString()}.` : 'Private browser reflection not yet saved for this account.'}</p>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage-300">One faithful next step</p>
              <label className="mt-5 block text-sm font-medium text-stone-200">Choose a focus<select value={draft.chosenFocus} onChange={(e) => update('chosenFocus', e.target.value as RhythmKey)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-white outline-none">{(Object.keys(rhythmLabels) as RhythmKey[]).map((key) => <option key={key} value={key} className="text-stone-900">{rhythmLabels[key]}</option>)}</select></label>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4"><Sparkles className="h-5 w-5 text-sage-300" /><p className="mt-3 text-sm leading-6 text-stone-100">{suggestedStep}</p></div>
              <label className="mt-5 block text-sm font-medium text-stone-200">Write your own next step<textarea value={draft.nextStep} onChange={(e) => update('nextStep', e.target.value)} rows={4} placeholder="Keep it small, concrete, and appropriate to your season." className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-stone-500" /></label>
            </div>

            <div className="rounded-[2rem] border border-sage-200 bg-sage-50 p-6">
              <p className="text-sm font-semibold text-sage-900">Carry the next step into Church OS</p>
              <p className="mt-2 text-sm leading-6 text-sage-800">Use the reflection to inform your own choices. It should never be used to compare members, infer spiritual condition, or pressure participation.</p>
              <div className="mt-4 grid gap-2"><Link href="/daily-guide" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-sage-800">Open Daily Guide</Link><Link href="/formation" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-sage-800">Open Formation Pathway</Link><Link href="/journey" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-sage-800">Review Journey</Link></div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
