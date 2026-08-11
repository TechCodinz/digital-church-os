'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpenText, CheckCircle2, ClipboardList, RotateCcw, Save, School, ShieldCheck, UsersRound } from 'lucide-react';

type AgeBand = 'early-childhood' | 'children' | 'teens' | 'adults' | 'mixed';
type LessonLength = 30 | 45 | 60 | 90;

type LessonDraft = {
  passage: string;
  aim: string;
  ageBand: AgeBand;
  minutes: LessonLength;
  memoryFocus: string;
  opening: string;
  observation: string;
  explanation: string;
  discussion: string;
  activity: string;
  prayer: string;
  familyTakeaway: string;
  materials: string;
  accessibility: string;
  safeguarding: string;
  reviewed: string[];
  updatedAt: string;
};

const ageLabels: Record<AgeBand, string> = {
  'early-childhood': 'Early childhood',
  children: 'Children',
  teens: 'Teens',
  adults: 'Adults',
  mixed: 'Mixed ages',
};

const reviewItems = ['Passage context', 'Age suitability', 'Safeguarding', 'Accessibility', 'Teacher handoff'];

function agePrompt(ageBand: AgeBand, aim: string) {
  const focus = aim.trim() || 'the lesson truth';
  if (ageBand === 'early-childhood') return `Use one concrete idea about ${focus}, a short repeated phrase, visual cue, movement, and a trusted-adult connection.`;
  if (ageBand === 'children') return `Use simple observation questions, one memorable example, active participation, and one practical response connected to ${focus}.`;
  if (ageBand === 'teens') return `Connect ${focus} to identity, friendships, digital life, pressure, choices, and honest questions without oversimplifying.`;
  if (ageBand === 'adults') return `Trace ${focus} through context, theology, relationships, vocation, church life, and a realistic practice for the week.`;
  return `Keep one shared biblical center around ${focus}, then offer age-flexible questions, movement, quiet reflection, and deeper follow-up options.`;
}

export function SundaySchoolLessonBuilder() {
  const [passage, setPassage] = useState('');
  const [aim, setAim] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>('children');
  const [minutes, setMinutes] = useState<LessonLength>(45);
  const [memoryFocus, setMemoryFocus] = useState('');
  const [opening, setOpening] = useState('');
  const [observation, setObservation] = useState('');
  const [explanation, setExplanation] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [activity, setActivity] = useState('');
  const [prayer, setPrayer] = useState('');
  const [familyTakeaway, setFamilyTakeaway] = useState('');
  const [materials, setMaterials] = useState('');
  const [accessibility, setAccessibility] = useState('');
  const [safeguarding, setSafeguarding] = useState('');
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('digital-church-os:sunday-school-builder');
      if (!raw) return;
      const saved = JSON.parse(raw) as LessonDraft;
      setPassage(saved.passage || '');
      setAim(saved.aim || '');
      setAgeBand(saved.ageBand || 'children');
      setMinutes(saved.minutes || 45);
      setMemoryFocus(saved.memoryFocus || '');
      setOpening(saved.opening || '');
      setObservation(saved.observation || '');
      setExplanation(saved.explanation || '');
      setDiscussion(saved.discussion || '');
      setActivity(saved.activity || '');
      setPrayer(saved.prayer || '');
      setFamilyTakeaway(saved.familyTakeaway || '');
      setMaterials(saved.materials || '');
      setAccessibility(saved.accessibility || '');
      setSafeguarding(saved.safeguarding || '');
      setReviewed(Array.isArray(saved.reviewed) ? saved.reviewed : []);
      setSavedAt(saved.updatedAt || null);
    } catch {
      // Private browser recovery is best-effort.
    }
  }, []);

  const timing = useMemo(() => {
    const ratios = [0.12, 0.2, 0.2, 0.18, 0.18, 0.12];
    const labels = ['Opening', 'Observe', 'Explain', 'Discuss', 'Activity', 'Prayer'];
    const values = labels.map((label, index) => [label, Math.max(3, Math.round(minutes * ratios[index]))]);
    return Object.fromEntries(values) as Record<string, number>;
  }, [minutes]);

  function save() {
    const updatedAt = new Date().toISOString();
    const draft: LessonDraft = {
      passage, aim, ageBand, minutes, memoryFocus, opening, observation, explanation, discussion, activity, prayer,
      familyTakeaway, materials, accessibility, safeguarding, reviewed, updatedAt,
    };
    window.localStorage.setItem('digital-church-os:sunday-school-builder', JSON.stringify(draft));
    setSavedAt(updatedAt);
  }

  function reset() {
    setPassage(''); setAim(''); setAgeBand('children'); setMinutes(45); setMemoryFocus(''); setOpening(''); setObservation('');
    setExplanation(''); setDiscussion(''); setActivity(''); setPrayer(''); setFamilyTakeaway(''); setMaterials(''); setAccessibility('');
    setSafeguarding(''); setReviewed([]); setSavedAt(null);
    window.localStorage.removeItem('digital-church-os:sunday-school-builder');
  }

  function toggleReview(item: string) {
    setReviewed((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]);
  }

  return (
    <section className="border-y border-cream-200 bg-white/75 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Sunday school lesson builder</p>
            <h2 className="mt-2 text-3xl font-light text-stone-900 sm:text-4xl">Prepare a teachable, reviewable lesson from one biblical center.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Build the lesson in an observation-first order, adapt it by age and time, record materials and accessibility needs, and finish with a teacher review gate before using it with a class.</p>
          </div>
          <div className="inline-flex items-center rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-800"><School className="mr-2 h-4 w-4" /> {reviewed.length}/{reviewItems.length} review checks</div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <label className="text-sm font-medium text-stone-700">Bible passage
                  <input value={passage} onChange={(event) => setPassage(event.target.value)} placeholder="e.g. Mark 4:35-41" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100" />
                </label>
                <label className="text-sm font-medium text-stone-700">Teaching aim
                  <input value={aim} onChange={(event) => setAim(event.target.value)} placeholder="What should learners understand or practice?" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100" />
                </label>
                <label className="text-sm font-medium text-stone-700">Age band
                  <select value={ageBand} onChange={(event) => setAgeBand(event.target.value as AgeBand)} className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400">
                    {Object.entries(ageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-stone-700">Lesson length
                  <select value={minutes} onChange={(event) => setMinutes(Number(event.target.value) as LessonLength)} className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400">
                    {[30, 45, 60, 90].map((value) => <option key={value} value={value}>{value} minutes</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-stone-700">Memory focus
                  <input value={memoryFocus} onChange={(event) => setMemoryFocus(event.target.value)} placeholder="Reference or short teacher-created phrase" className="mt-2 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 outline-none focus:border-sage-400" />
                </label>
              </div>
              <div className="mt-5 rounded-2xl bg-sage-50 p-4 text-sm leading-6 text-sage-900"><strong>Age adaptation:</strong> {agePrompt(ageBand, aim)}</div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={save} className="inline-flex min-h-11 items-center rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white"><Save className="mr-2 h-4 w-4" /> Save lesson</button>
                <button type="button" onClick={reset} className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-600"><RotateCcw className="mr-2 h-4 w-4" /> Reset</button>
              </div>
              <p className="mt-3 text-xs text-stone-500">{savedAt ? `Private browser draft saved ${new Date(savedAt).toLocaleString()}.` : 'Private browser draft not yet saved.'}</p>
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage-600">Teacher readiness</p>
              <div className="mt-4 space-y-2">
                {reviewItems.map((item) => {
                  const done = reviewed.includes(item);
                  return <button key={item} type="button" onClick={() => toggleReview(item)} className={`flex min-h-11 w-full items-center rounded-xl border px-3 text-left text-sm font-medium transition ${done ? 'border-sage-300 bg-sage-50 text-sage-800' : 'border-stone-200 text-stone-600 hover:border-sage-200'}`}><CheckCircle2 className={`mr-2 h-4 w-4 ${done ? 'text-sage-600' : 'text-stone-300'}`} />{item}</button>;
                })}
              </div>
              <p className="mt-4 text-xs leading-5 text-stone-500">The review gate is intentionally human. It does not certify doctrine, safeguarding, or age suitability automatically.</p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-sage-300">Lesson flow</p><h3 className="mt-2 text-2xl font-light">{aim.trim() || 'Untitled lesson'}</h3><p className="mt-2 text-sm text-stone-300">{ageLabels[ageBand]} · {minutes} minutes · {passage.trim() || 'Choose a passage'}</p></div>
              {passage.trim() && <Link href={`/scripture?ref=${encodeURIComponent(passage.trim())}`} className="inline-flex min-h-10 items-center rounded-xl border border-white/15 px-3 text-xs font-semibold text-sage-200"><BookOpenText className="mr-2 h-4 w-4" /> Open passage</Link>}
            </div>

            <div className="mt-6 grid gap-4">
              {[
                ['Opening', opening, setOpening, 'Settle the room, connect to prior learning, and introduce the question or tension.'],
                ['Observe', observation, setObservation, 'What does the passage actually say? Note people, actions, repetition, structure, setting, and key words.'],
                ['Explain', explanation, setExplanation, 'Clarify context and meaning before jumping to application. Note what requires teacher verification.'],
                ['Discuss', discussion, setDiscussion, 'Write age-appropriate questions that allow observation, interpretation, honest response, and application.'],
                ['Activity', activity, setActivity, 'Choose an activity that serves the biblical aim rather than becoming unrelated entertainment.'],
                ['Prayer', prayer, setPrayer, 'Close with a short prayer response tied to the passage, gratitude, need, or faithful next step.'],
              ].map(([label, value, setter, placeholder]) => (
                <label key={label as string} className="block rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="flex items-center justify-between gap-3"><span className="font-semibold">{label as string}</span><span className="text-xs text-stone-400">{timing[label as string]} min</span></span>
                  <textarea value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} rows={3} placeholder={placeholder as string} className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white outline-none placeholder:text-stone-500 focus:border-sage-400" />
                </label>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium">Family takeaway<textarea value={familyTakeaway} onChange={(event) => setFamilyTakeaway(event.target.value)} rows={3} placeholder="Conversation, prayer, memory focus, or service idea for home." className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-normal text-white outline-none placeholder:text-stone-500" /></label>
              <label className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium">Materials<textarea value={materials} onChange={(event) => setMaterials(event.target.value)} rows={3} placeholder="Bible, printouts, craft materials, media, seating, etc." className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-normal text-white outline-none placeholder:text-stone-500" /></label>
              <label className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium">Accessibility<textarea value={accessibility} onChange={(event) => setAccessibility(event.target.value)} rows={3} placeholder="Visual, hearing, mobility, sensory, reading, language, attention, or participation adjustments." className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-normal text-white outline-none placeholder:text-stone-500" /></label>
              <label className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium">Safeguarding notes<textarea value={safeguarding} onChange={(event) => setSafeguarding(event.target.value)} rows={3} placeholder="Trusted-adult coverage, pickup/handoff, activity supervision, photo/media posture, room risks." className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-normal text-white outline-none placeholder:text-stone-500" /></label>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Link href="/children" className="flex min-h-11 items-center justify-center rounded-xl bg-white/10 px-3 text-sm font-semibold"><UsersRound className="mr-2 h-4 w-4" /> Children</Link>
              <Link href="/groups" className="flex min-h-11 items-center justify-center rounded-xl bg-white/10 px-3 text-sm font-semibold"><ClipboardList className="mr-2 h-4 w-4" /> Groups</Link>
              <Link href="/care" className="flex min-h-11 items-center justify-center rounded-xl bg-white/10 px-3 text-sm font-semibold"><ShieldCheck className="mr-2 h-4 w-4" /> Care handoff</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
