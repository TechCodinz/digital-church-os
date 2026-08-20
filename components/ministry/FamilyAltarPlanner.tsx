'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { BookOpenText, Check, Clock3, HeartHandshake, Home, Loader2, RotateCcw, Save, UsersRound } from 'lucide-react';

type FamilyAge = 'young-children' | 'older-children' | 'teens' | 'mixed' | 'adults';
type SessionLength = 10 | 20 | 30 | 45;

type SavedAltar = {
  scripture: string;
  theme: string;
  age: FamilyAge;
  minutes: SessionLength;
  gratitude: string;
  prayerFocus: string;
  serviceAction: string;
  completed: string[];
  updatedAt: string;
};

const steps = ['Gather', 'Read', 'Talk', 'Pray', 'Worship', 'Live it'];
const LEGACY_STORAGE_KEY = 'digital-church-os:family-altar-planner';

function storageKey(userId: string) {
  return `digital-church-os:family-altar-planner:v2:${userId}`;
}

const ageLabels: Record<FamilyAge, string> = {
  'young-children': 'Young children',
  'older-children': 'Older children',
  teens: 'Teens',
  mixed: 'Mixed ages',
  adults: 'Adults',
};

function discussionPrompt(age: FamilyAge, theme: string) {
  const focus = theme.trim() || 'today’s Scripture';
  if (age === 'young-children') return `What is one thing you notice about ${focus}? Can you draw or act out one part?`;
  if (age === 'older-children') return `What does ${focus} show us about God, people, and one choice we can make this week?`;
  if (age === 'teens') return `Where does ${focus} challenge real life at school, online, with friends, or at home? What would faithfulness look like?`;
  if (age === 'adults') return `What truth, tension, promise, command, or invitation in ${focus} deserves a response in our relationships and responsibilities?`;
  return `Let each person name one thing they notice about ${focus}, one question they have, and one way the family could respond together.`;
}

export function FamilyAltarPlanner() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id || '';
  const [scripture, setScripture] = useState('');
  const [theme, setTheme] = useState('');
  const [age, setAge] = useState<FamilyAge>('mixed');
  const [minutes, setMinutes] = useState<SessionLength>(20);
  const [gratitude, setGratitude] = useState('');
  const [prayerFocus, setPrayerFocus] = useState('');
  const [serviceAction, setServiceAction] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [legacyDraftPresent, setLegacyDraftPresent] = useState(false);

  useEffect(() => {
    if (!userId) return;

    try {
      const raw = window.localStorage.getItem(storageKey(userId));
      const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      setLegacyDraftPresent(Boolean(legacyRaw));
      if (!raw) return;

      const saved = JSON.parse(raw) as SavedAltar;
      setScripture(saved.scripture || '');
      setTheme(saved.theme || '');
      setAge(saved.age || 'mixed');
      setMinutes(saved.minutes || 20);
      setGratitude(saved.gratitude || '');
      setPrayerFocus(saved.prayerFocus || '');
      setServiceAction(saved.serviceAction || '');
      setCompleted(Array.isArray(saved.completed) ? saved.completed : []);
      setSavedAt(saved.updatedAt || null);
    } catch {
      setSaveStatus('Private family plan could not be restored from this browser.');
    }
  }, [userId]);

  const allocation = useMemo(() => {
    const values = minutes <= 10 ? [1, 2, 2, 2, 1, 2] : minutes <= 20 ? [2, 4, 4, 4, 3, 3] : minutes <= 30 ? [3, 6, 6, 5, 4, 6] : [5, 8, 9, 8, 6, 9];
    return Object.fromEntries(steps.map((step, index) => [step, values[index]]));
  }, [minutes]);

  function persistLocal() {
    if (!userId) throw new Error('Signed-in account required for private browser storage.');
    const updatedAt = new Date().toISOString();
    const payload: SavedAltar = { scripture, theme, age, minutes, gratitude, prayerFocus, serviceAction, completed, updatedAt };
    window.localStorage.setItem(storageKey(userId), JSON.stringify(payload));
    setSavedAt(updatedAt);
  }

  async function save() {
    if (saving) return;
    if (!userId) {
      setSaveStatus('Your signed-in session is still loading. Try saving again in a moment.');
      return;
    }

    setSaving(true);
    setSaveStatus('');

    let localSaved = false;
    try {
      persistLocal();
      localSaved = true;
    } catch {
      localSaved = false;
    }

    const content = [
      theme.trim() ? `Theme: ${theme.trim()}` : '',
      gratitude.trim() ? `Gratitude: ${gratitude.trim()}` : '',
      prayerFocus.trim() ? `Prayer focus: ${prayerFocus.trim()}` : '',
    ].filter(Boolean).join('\n\n');
    const nextStep = [
      serviceAction.trim() ? `Family act of love/service: ${serviceAction.trim()}` : '',
      completed.length ? `Flow completed: ${completed.join(', ')}` : '',
      `${ageLabels[age]} · ${minutes} minutes`,
    ].filter(Boolean).join('. ');

    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Family Altar',
          title: theme.trim() || 'Household worship',
          content,
          scriptureRefs: scripture.trim() ? [scripture.trim()] : [],
          nextStep,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSaveStatus('Family plan saved to this account’s browser draft and a private household formation moment added to your Journey.');
      } else {
        setSaveStatus(localSaved ? `Family plan saved to this account’s browser draft. ${data.error || 'Journey sync is temporarily unavailable.'}` : (data.error || 'Unable to save the family plan.'));
      }
    } catch {
      setSaveStatus(localSaved ? 'Family plan saved to this account’s browser draft. Journey sync is temporarily unavailable.' : 'Unable to save the family plan.');
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setScripture('');
    setTheme('');
    setAge('mixed');
    setMinutes(20);
    setGratitude('');
    setPrayerFocus('');
    setServiceAction('');
    setCompleted([]);
    setSavedAt(null);
    setSaveStatus('');
    if (!userId) return;
    try {
      window.localStorage.removeItem(storageKey(userId));
      setSaveStatus('This account’s family plan was reset.');
    } catch {
      setSaveStatus('This family plan could not be reset.');
    }
  }

  function removeLegacyDraft() {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      setLegacyDraftPresent(false);
      setSaveStatus('Legacy unscoped family plan removed.');
    } catch {
      setSaveStatus('Legacy family plan could not be removed.');
    }
  }

  function toggle(step: string) {
    setSaveStatus('');
    setCompleted((current) => (current.includes(step) ? current.filter((item) => item !== step) : [...current, step]));
  }

  return (
    <section className="border-y border-cream-200 bg-white/75 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Family altar planner</p>
            <h2 className="mt-2 text-3xl font-light text-stone-900 sm:text-4xl">Build tonight’s household worship flow.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Choose the passage, family age mix, available time, prayer focus, gratitude, and one practical act of love. The planner structures the gathering locally without pretending to know God’s private message for your family.</p>
          </div>
          <div className="inline-flex items-center rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-800"><Home className="mr-2 h-4 w-4" /> {completed.length}/{steps.length} moments complete</div>
        </div>

        {legacyDraftPresent && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            An older unscoped family plan exists. It was <strong>not imported</strong> because this browser may be shared and its original owner cannot be verified.
            <button type="button" onClick={removeLegacyDraft} className="ml-2 font-semibold underline">Remove legacy plan</button>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <label className="text-sm font-medium text-stone-700">Scripture reference
                <input value={scripture} onChange={(event) => { setScripture(event.target.value); setSaveStatus(''); }} maxLength={160} placeholder="e.g. Luke 10:25-37" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100" />
              </label>
              <label className="text-sm font-medium text-stone-700">Family theme
                <input value={theme} onChange={(event) => { setTheme(event.target.value); setSaveStatus(''); }} maxLength={160} placeholder="e.g. Loving our neighbor" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100" />
              </label>
              <label className="text-sm font-medium text-stone-700">Family age mix
                <select value={age} onChange={(event) => { setAge(event.target.value as FamilyAge); setSaveStatus(''); }} className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400">
                  {Object.entries(ageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-stone-700">Available time
                <select value={minutes} onChange={(event) => { setMinutes(Number(event.target.value) as SessionLength); setSaveStatus(''); }} className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400">
                  {[10, 20, 30, 45].map((value) => <option key={value} value={value}>{value} minutes</option>)}
                </select>
              </label>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-stone-700">Gratitude to share<textarea value={gratitude} onChange={(event) => { setGratitude(event.target.value); setSaveStatus(''); }} maxLength={1200} rows={2} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              <label className="block text-sm font-medium text-stone-700">Prayer focus<textarea value={prayerFocus} onChange={(event) => { setPrayerFocus(event.target.value); setSaveStatus(''); }} maxLength={1200} rows={2} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
              <label className="block text-sm font-medium text-stone-700">One act of love/service<textarea value={serviceAction} onChange={(event) => { setServiceAction(event.target.value); setSaveStatus(''); }} maxLength={800} rows={2} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-sage-400" /></label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={save} disabled={saving} type="button" className="inline-flex min-h-11 items-center rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{saving ? 'Saving privately…' : 'Save family plan'}</button>
              <button onClick={reset} type="button" className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-600"><RotateCcw className="mr-2 h-4 w-4" /> Reset</button>
            </div>
            <p className="mt-3 text-xs leading-5 text-stone-500">{saveStatus || (savedAt ? `Account-scoped browser draft saved ${new Date(savedAt).toLocaleString()}.` : 'Private browser draft not yet saved for this account.')}</p>
            <Link href="/journey" className="mt-2 inline-flex text-xs font-semibold text-sage-700">Open private Journey →</Link>
          </div>

          <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-sage-300">Tonight’s flow</p><h3 className="mt-2 text-2xl font-light">{theme.trim() || 'A simple Scripture-centered family gathering'}</h3><p className="mt-2 text-sm text-stone-300">{ageLabels[age]} · {minutes} minutes · {scripture.trim() || 'Choose a Scripture reference'}</p></div>
              {scripture.trim() && <Link href={`/scripture?ref=${encodeURIComponent(scripture.trim())}`} className="inline-flex min-h-10 items-center rounded-xl border border-white/15 px-3 text-xs font-semibold text-sage-200"><BookOpenText className="mr-2 h-4 w-4" /> Open passage</Link>}
            </div>

            <div className="mt-6 grid gap-3">
              {steps.map((step) => {
                const done = completed.includes(step);
                const descriptions: Record<string, string> = {
                  Gather: 'Welcome everyone, settle devices, and name the theme in one sentence.',
                  Read: scripture.trim() ? `Read ${scripture.trim()} slowly. Let more than one person participate if appropriate.` : 'Choose and read the Scripture passage slowly before interpretation or application.',
                  Talk: discussionPrompt(age, theme),
                  Pray: prayerFocus.trim() ? `Pray specifically about: ${prayerFocus.trim()}` : 'Let each person offer a short prayer, request, lament, thanksgiving, or silence.',
                  Worship: gratitude.trim() ? `Turn this gratitude into worship: ${gratitude.trim()}` : 'Sing, listen, read a Psalm, or name reasons for gratitude together.',
                  'Live it': serviceAction.trim() ? `Family next step: ${serviceAction.trim()}` : 'Choose one realistic act of love, reconciliation, generosity, or service for the next day or week.',
                };
                return (
                  <button key={step} type="button" onClick={() => toggle(step)} className={`flex gap-4 rounded-2xl border p-4 text-left transition ${done ? 'border-sage-400/40 bg-sage-400/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${done ? 'bg-sage-400 text-stone-950' : 'bg-white/10 text-sage-200'}`}>{done ? <Check className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}</span>
                    <span><span className="flex items-center gap-2 font-semibold"><span>{step}</span><span className="text-xs font-normal text-stone-400">{allocation[step]} min</span></span><span className="mt-1 block text-sm leading-6 text-stone-300">{descriptions[step]}</span></span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href="/prayer-room" className="flex min-h-11 items-center justify-center rounded-xl bg-white/10 px-4 text-sm font-semibold text-white"><HeartHandshake className="mr-2 h-4 w-4" /> Family prayer</Link>
              <Link href="/children" className="flex min-h-11 items-center justify-center rounded-xl bg-white/10 px-4 text-sm font-semibold text-white"><UsersRound className="mr-2 h-4 w-4" /> Children’s Sanctuary</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
