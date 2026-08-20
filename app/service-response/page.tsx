'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  BookOpenText,
  Check,
  HeartHandshake,
  Loader2,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

const responseLanes = [
  { id: 'prayer', label: 'Prayer', description: 'Respond in prayer, gratitude, confession, lament, or intercession.', href: '/prayer-room' },
  { id: 'care', label: 'Pastoral care', description: 'Ask for appropriate human pastoral support or follow-up.', href: '/care' },
  { id: 'discipleship', label: 'Discipleship', description: 'Carry the message into Scripture, reflection, and a sustainable formation rhythm.', href: '/journey' },
  { id: 'serve', label: 'Serve', description: 'Turn conviction outward through practical service, generosity, or ministry participation.', href: '/activities' },
  { id: 'community', label: 'Church connection', description: 'Take a healthy next step toward community, group life, or church connection.', href: '/community-wall' },
] as const;

type LaneId = typeof responseLanes[number]['id'];

export default function ServiceResponsePage() {
  const [takeaway, setTakeaway] = useState('');
  const [scripture, setScripture] = useState('');
  const [selected, setSelected] = useState<LaneId[]>([]);
  const [nextStep, setNextStep] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const toggleLane = (id: LaneId) => {
    setStatus('');
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const saveResponse = async () => {
    if (saving) return;
    const content = takeaway.trim();
    const chosenLabels = responseLanes.filter((lane) => selected.includes(lane.id)).map((lane) => lane.label);
    const finalNextStep = [
      nextStep.trim(),
      chosenLabels.length ? `Response lanes: ${chosenLabels.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    if (!content && !finalNextStep) {
      setStatus('Add a takeaway, response lane, or next step before saving.');
      return;
    }

    setSaving(true);
    setStatus('');
    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Service Response',
          title: 'Service response',
          content,
          scriptureRefs: scripture.trim() ? [scripture.trim()] : [],
          nextStep: finalNextStep,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save your response.');
      setStatus('Saved privately to your Journey. Your response is not a public testimony or pastoral case record.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save your response.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-24 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-7 sm:p-9 lg:p-11">
              <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700">
                <Sparkles className="mr-2 h-4 w-4" /> Service response
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-light leading-tight text-stone-900 md:text-5xl">Carry the message into one faithful, practical response.</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">Capture what stood out, check the Scripture reference, choose the kind of response you need, and name one realistic next step. This workspace organizes your response; it does not claim to determine God’s will for you.</p>

              <label className="mt-7 block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Message takeaway</span>
                <textarea value={takeaway} onChange={(event) => { setTakeaway(event.target.value); setStatus(''); }} maxLength={2200} rows={6} placeholder="What truth, question, conviction, comfort, or invitation do you want to remember?" className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 leading-7 text-stone-800 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
              </label>

              <label className="mt-5 block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Scripture reference</span>
                <div className="flex gap-2">
                  <input value={scripture} onChange={(event) => { setScripture(event.target.value); setStatus(''); }} maxLength={160} placeholder="e.g. Romans 12:1-2" className="min-h-11 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 outline-none focus:border-sage-300" />
                  {scripture.trim() && <Link href={`/scripture?ref=${encodeURIComponent(scripture.trim())}`} className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-sage-700"><BookOpenText className="mr-2 h-4 w-4" /> Study</Link>}
                </div>
              </label>

              <div className="mt-7">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Response lanes</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {responseLanes.map((lane) => {
                    const active = selected.includes(lane.id);
                    return (
                      <button key={lane.id} type="button" onClick={() => toggleLane(lane.id)} className={`rounded-2xl border p-4 text-left transition ${active ? 'border-sage-300 bg-sage-50' : 'border-stone-200 bg-white hover:border-sage-200'}`}>
                        <div className="flex items-center justify-between gap-3"><span className="font-semibold text-stone-900">{lane.label}</span>{active && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-600 text-white"><Check className="h-3.5 w-3.5" /></span>}</div>
                        <p className="mt-2 text-xs leading-5 text-stone-500">{lane.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="mt-6 block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">One next step</span>
                <textarea value={nextStep} onChange={(event) => { setNextStep(event.target.value); setStatus(''); }} maxLength={800} rows={3} placeholder="Keep it specific and realistic: pray with someone, repair a conversation, study the passage, join a group, serve, ask for care…" className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 leading-6 outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100" />
              </label>

              <button type="button" onClick={saveResponse} disabled={saving} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <NotebookPen className="mr-2 h-4 w-4" />}{saving ? 'Saving privately…' : 'Save response to private Journey'}
              </button>
              {status && <p className="mt-3 text-xs leading-5 text-stone-500" role="status">{status}</p>}
            </div>

            <aside className="bg-stone-950 p-7 text-white sm:p-9 lg:p-11">
              <ShieldCheck className="h-8 w-8 text-sage-300" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-sage-300">Healthy handoff</p>
              <h2 className="mt-3 text-3xl font-light">Move to the right kind of support.</h2>
              <p className="mt-3 text-sm leading-6 text-stone-300">Private reflection belongs to your Journey. Sensitive care belongs with trusted human support. Public testimony or church operations should use their own explicit workflows.</p>

              <div className="mt-7 space-y-3">
                {responseLanes.map((lane) => (
                  <Link key={lane.id} href={lane.href} className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                    <span><span className="block text-sm font-semibold text-white">{lane.label}</span><span className="mt-1 block text-xs leading-5 text-stone-400">{lane.description}</span></span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-sage-300 transition group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100">
                Crisis, abuse, safeguarding, medical, or emergency needs should not be stored as ordinary spiritual reflections. Use appropriate trusted human and local emergency support.
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link href="/journey" className="flex min-h-11 items-center justify-center rounded-xl bg-white/10 px-3 text-sm font-semibold text-white"><UsersRound className="mr-2 h-4 w-4" /> Journey</Link>
                <Link href="/care" className="flex min-h-11 items-center justify-center rounded-xl bg-white/10 px-3 text-sm font-semibold text-white"><HeartHandshake className="mr-2 h-4 w-4" /> Human care</Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
