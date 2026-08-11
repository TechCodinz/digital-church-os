'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { Accessibility, BookOpenText, Check, ClipboardCheck, Copy, Printer, ShieldCheck, UsersRound } from 'lucide-react';

type ReadinessId = 'teacher' | 'lesson' | 'materials' | 'accessibility' | 'safeguarding' | 'family';

type Draft = {
  classLabel: string;
  serviceDate: string;
  ageBand: string;
  expectedCount: number;
  teacherHandoff: string;
  materialsNote: string;
  accessibilityNote: string;
  safeguardingNote: string;
  familyTakeaway: string;
  followUp: string;
  ready: ReadinessId[];
  updatedAt: string;
};

const readiness: Array<{ id: ReadinessId; title: string; description: string }> = [
  { id: 'teacher', title: 'Teacher handoff', description: 'Lead and support teachers know the passage, aim, timing, roles and escalation path.' },
  { id: 'lesson', title: 'Lesson reviewed', description: 'Biblical context, age suitability, questions and application have received human review.' },
  { id: 'materials', title: 'Materials ready', description: 'Room, visuals, printouts, activity supplies and presentation needs are prepared.' },
  { id: 'accessibility', title: 'Accessibility checked', description: 'Participation options account for different communication, sensory, mobility and learning needs.' },
  { id: 'safeguarding', title: 'Safeguarding ready', description: 'Approved workers, check-in/out practice and local safeguarding procedures are understood.' },
  { id: 'family', title: 'Family continuation', description: 'A simple take-home Scripture conversation, prayer or service idea is ready for caregivers.' },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function storageKey(userId: string) {
  return `digital-church-os:sunday-school-command:v1:${userId}`;
}

export function SundaySchoolClassCommandBoard() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id || '';
  const [classLabel, setClassLabel] = useState('Sunday School');
  const [serviceDate, setServiceDate] = useState(today());
  const [ageBand, setAgeBand] = useState('Children');
  const [expectedCount, setExpectedCount] = useState(0);
  const [teacherHandoff, setTeacherHandoff] = useState('');
  const [materialsNote, setMaterialsNote] = useState('');
  const [accessibilityNote, setAccessibilityNote] = useState('');
  const [safeguardingNote, setSafeguardingNote] = useState('');
  const [familyTakeaway, setFamilyTakeaway] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [ready, setReady] = useState<ReadinessId[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!userId) return;
    try {
      const raw = window.localStorage.getItem(storageKey(userId));
      if (!raw) return;
      const draft = JSON.parse(raw) as Draft;
      setClassLabel(draft.classLabel || 'Sunday School');
      setServiceDate(draft.serviceDate || today());
      setAgeBand(draft.ageBand || 'Children');
      setExpectedCount(Number.isFinite(draft.expectedCount) ? Math.max(0, draft.expectedCount) : 0);
      setTeacherHandoff(draft.teacherHandoff || '');
      setMaterialsNote(draft.materialsNote || '');
      setAccessibilityNote(draft.accessibilityNote || '');
      setSafeguardingNote(draft.safeguardingNote || '');
      setFamilyTakeaway(draft.familyTakeaway || '');
      setFollowUp(draft.followUp || '');
      setReady(Array.isArray(draft.ready) ? draft.ready : []);
    } catch {
      setStatus('This account’s class-readiness draft could not be restored from the browser.');
    }
  }, [userId]);

  const completion = useMemo(() => Math.round((ready.length / readiness.length) * 100), [ready.length]);

  const toggle = (id: ReadinessId) => {
    setStatus('');
    setReady((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const save = () => {
    if (!userId) {
      setStatus('Sign in to keep this teacher-preparation draft private to your account on this browser.');
      return;
    }
    try {
      const draft: Draft = {
        classLabel,
        serviceDate,
        ageBand,
        expectedCount: Math.max(0, expectedCount),
        teacherHandoff,
        materialsNote,
        accessibilityNote,
        safeguardingNote,
        familyTakeaway,
        followUp,
        ready,
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(storageKey(userId), JSON.stringify(draft));
      setStatus('Teacher-preparation draft saved privately to this signed-in account on this browser.');
    } catch {
      setStatus('This preparation draft could not be saved in the browser.');
    }
  };

  const summary = [
    `${classLabel} · ${serviceDate} · ${ageBand}`,
    `Expected attendance (aggregate only): ${expectedCount}`,
    `Readiness: ${ready.length}/${readiness.length}`,
    teacherHandoff.trim() ? `Teacher handoff: ${teacherHandoff.trim()}` : '',
    materialsNote.trim() ? `Materials: ${materialsNote.trim()}` : '',
    accessibilityNote.trim() ? `Accessibility: ${accessibilityNote.trim()}` : '',
    safeguardingNote.trim() ? `Safeguarding readiness: ${safeguardingNote.trim()}` : '',
    familyTakeaway.trim() ? `Family continuation: ${familyTakeaway.trim()}` : '',
    followUp.trim() ? `Follow-up: ${followUp.trim()}` : '',
  ].filter(Boolean).join('\n');

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setStatus('Class-readiness summary copied. Review it before sharing with your approved ministry team.');
    } catch {
      setStatus('Copy is unavailable in this browser.');
    }
  };

  return (
    <section className="border-y border-cream-200 bg-stone-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-300"><ClipboardCheck className="mr-2 h-4 w-4" /> Class command board</div>
            <h2 className="mt-5 text-3xl font-light leading-tight sm:text-4xl">Move from a good lesson to a prepared, safe, inclusive class.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">This teacher-preparation surface tracks operational readiness only. Keep children’s names, diagnoses, counseling details, safeguarding incidents and private family situations in approved restricted workflows—not in this board.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-stone-300">Class / group<input value={classLabel} onChange={(e) => { setClassLabel(e.target.value); setStatus(''); }} maxLength={100} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-sage-400" /></label>
              <label className="text-xs font-semibold text-stone-300">Date<input type="date" value={serviceDate} onChange={(e) => { setServiceDate(e.target.value); setStatus(''); }} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-sage-400" /></label>
              <label className="text-xs font-semibold text-stone-300">Age lane<select value={ageBand} onChange={(e) => { setAgeBand(e.target.value); setStatus(''); }} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-stone-900 px-3 text-sm text-white outline-none focus:border-sage-400"><option>Early childhood</option><option>Children</option><option>Teens</option><option>Adults</option><option>Mixed ages</option></select></label>
              <label className="text-xs font-semibold text-stone-300">Expected attendance · aggregate only<input type="number" min={0} max={10000} value={expectedCount} onChange={(e) => { setExpectedCount(Math.max(0, Number(e.target.value) || 0)); setStatus(''); }} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-sage-400" /></label>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-300"><span>Class readiness</span><span>{ready.length}/{readiness.length}</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-sage-400 transition-all" style={{ width: `${completion}%` }} /></div>
              <p className="mt-3 text-xs leading-5 text-stone-400">{completion === 100 ? 'All preparation areas are marked reviewed. A human leader should still make the final go/no-go decision.' : 'Use the checklist to see what still needs human preparation before class.'}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={save} className="rounded-xl bg-sage-500 px-4 py-3 text-sm font-semibold text-white hover:bg-sage-400">Save private prep draft</button>
              <button type="button" onClick={copySummary} className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"><Copy className="mr-2 h-4 w-4" /> Copy handoff</button>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"><Printer className="mr-2 h-4 w-4" /> Print</button>
            </div>
            {status && <p role="status" className="mt-3 text-xs leading-5 text-sage-200">{status}</p>}
          </div>

          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {readiness.map((item) => {
                const active = ready.includes(item.id);
                return <button key={item.id} type="button" onClick={() => toggle(item.id)} className={`min-h-[132px] rounded-2xl border p-4 text-left transition ${active ? 'border-sage-400 bg-sage-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-white">{item.title}</span><span className={`flex h-6 w-6 items-center justify-center rounded-full ${active ? 'bg-sage-400 text-stone-950' : 'border border-white/20 text-transparent'}`}><Check className="h-3.5 w-3.5" /></span></div><p className="mt-2 text-xs leading-5 text-stone-400">{item.description}</p></button>;
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-stone-300">Teacher handoff<textarea value={teacherHandoff} onChange={(e) => { setTeacherHandoff(e.target.value); setStatus(''); }} maxLength={1800} rows={3} placeholder="Roles, timing, difficult questions, prayer lead…" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white outline-none focus:border-sage-400" /></label>
              <label className="text-xs font-semibold text-stone-300">Materials & room<textarea value={materialsNote} onChange={(e) => { setMaterialsNote(e.target.value); setStatus(''); }} maxLength={1200} rows={3} placeholder="Printouts, visuals, activity supplies, room layout…" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white outline-none focus:border-sage-400" /></label>
              <label className="text-xs font-semibold text-stone-300"><Accessibility className="mr-1 inline h-3.5 w-3.5" />Accessibility preparation<textarea value={accessibilityNote} onChange={(e) => { setAccessibilityNote(e.target.value); setStatus(''); }} maxLength={1200} rows={3} placeholder="Alternative participation, visual/verbal options, sensory considerations…" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white outline-none focus:border-sage-400" /></label>
              <label className="text-xs font-semibold text-stone-300"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Safeguarding readiness<textarea value={safeguardingNote} onChange={(e) => { setSafeguardingNote(e.target.value); setStatus(''); }} maxLength={1200} rows={3} placeholder="Approved-worker coverage, check-in/out process, escalation contact—no case narratives." className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white outline-none focus:border-sage-400" /></label>
              <label className="text-xs font-semibold text-stone-300">Family continuation<textarea value={familyTakeaway} onChange={(e) => { setFamilyTakeaway(e.target.value); setStatus(''); }} maxLength={1400} rows={3} placeholder="One home conversation, prayer, memory focus, or service idea…" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white outline-none focus:border-sage-400" /></label>
              <label className="text-xs font-semibold text-stone-300">Follow-up / teacher review<textarea value={followUp} onChange={(e) => { setFollowUp(e.target.value); setStatus(''); }} maxLength={1400} rows={3} placeholder="What should the teaching team revisit after class? Keep sensitive child/family cases out." className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white outline-none focus:border-sage-400" /></label>
            </div>

            <div className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Link href="/scripture" className="inline-flex items-center text-xs font-semibold text-sage-300"><BookOpenText className="mr-2 h-4 w-4" /> Scripture study</Link>
              <Link href="/children" className="inline-flex items-center text-xs font-semibold text-sage-300"><UsersRound className="mr-2 h-4 w-4" /> Children’s Sanctuary</Link>
              <Link href="/family-altar" className="inline-flex items-center text-xs font-semibold text-sage-300">Family Altar →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
