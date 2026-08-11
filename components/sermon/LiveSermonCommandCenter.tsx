'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  Check,
  ClipboardPen,
  MessageCircleHeart,
  MonitorPlay,
  Radio,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type SermonMode = 'prepare' | 'live' | 'followup';

const modes: { id: SermonMode; label: string; description: string }[] = [
  { id: 'prepare', label: 'Prepare', description: 'Shape the biblical text, thesis, movements, response, and review posture.' },
  { id: 'live', label: 'Preach live', description: 'Keep concise cues, references, timing, and response moments visible while serving.' },
  { id: 'followup', label: 'Follow up', description: 'Capture what resonated and turn the message into discipleship and care actions.' },
];

const outlineSteps = [
  'Biblical text & context',
  'Main truth / thesis',
  'Opening & human connection',
  'Teaching movements',
  'Illustration / application',
  'Prayer & response moment',
  'Next-step discipleship',
];

function storageKey() {
  return `digital-church-sermon-console:${new Date().toISOString().slice(0, 10)}`;
}

export function LiveSermonCommandCenter() {
  const [mode, setMode] = useState<SermonMode>('prepare');
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [reference, setReference] = useState('');
  const [thesis, setThesis] = useState('');
  const [notes, setNotes] = useState('');
  const [responseNotes, setResponseNotes] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey());
      if (!raw) return;
      const state = JSON.parse(raw);
      setTitle(state.title || '');
      setTheme(state.theme || '');
      setReference(state.reference || '');
      setThesis(state.thesis || '');
      setNotes(state.notes || '');
      setResponseNotes(state.responseNotes || '');
      setCompleted(Array.isArray(state.completed) ? state.completed : []);
    } catch {
      // Local sermon drafts are optional.
    }
  }, []);

  const readiness = useMemo(() => {
    const fields = [title, theme, reference, thesis].filter((item) => item.trim()).length;
    return Math.round(((fields + completed.length) / (4 + outlineSteps.length)) * 100);
  }, [title, theme, reference, thesis, completed.length]);

  const save = () => {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify({ title, theme, reference, thesis, notes, responseNotes, completed }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch {
      setSaved(false);
    }
  };

  const toggle = (step: string) => {
    setCompleted((current) => current.includes(step) ? current.filter((item) => item !== step) : [...current, step]);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700">
                <Radio className="mr-2 h-4 w-4" /> Live sermon command center
              </div>
              <h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Prepare the Word, preach with clarity, and make the response actionable.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">This workspace keeps the biblical reference, teaching thesis, live cues, notes, and follow-up in one flow. AI can assist drafts, but public teaching remains pastor-reviewed.</p>
            </div>
            <div className="min-w-[150px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-xs uppercase tracking-wider text-stone-400">Preparation pulse</p>
              <p className="mt-1 text-3xl font-light">{readiness}%</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-sage-400" style={{ width: `${readiness}%` }} /></div>
            </div>
          </div>

          <div className="mt-7 grid gap-2 sm:grid-cols-3">
            {modes.map((item) => (
              <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`rounded-2xl border p-4 text-left transition ${mode === item.id ? 'border-sage-300 bg-sage-50' : 'border-stone-200 bg-stone-50 hover:border-sage-200'}`}>
                <p className="font-semibold text-stone-900">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-stone-500">{item.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Sermon title</span><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-sage-200" placeholder="A clear working title" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Theme</span><input value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-sage-200" placeholder="Faith, mercy, discipleship..." /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Primary Scripture reference</span><input value={reference} onChange={(e) => setReference(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-sage-200" placeholder="e.g. Romans 8:1-17" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Main truth / thesis</span><input value={thesis} onChange={(e) => setThesis(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-sage-200" placeholder="One sentence people should remember" /></label>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Teaching flow</p>
              <div className="space-y-2">
                {outlineSteps.map((step) => {
                  const done = completed.includes(step);
                  return <button key={step} type="button" onClick={() => toggle(step)} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${done ? 'border-sage-200 bg-sage-50 text-sage-800' : 'border-stone-200 bg-white text-stone-700'}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full ${done ? 'bg-sage-600 text-white' : 'bg-stone-100 text-stone-500'}`}>{done ? <Check className="h-3.5 w-3.5" /> : completed.length + 1}</span>{step}</button>;
                })}
              </div>
            </div>
            <div>
              <label className="block"><span className="mb-3 block text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{mode === 'live' ? 'Live cue notes' : mode === 'followup' ? 'Message reflection notes' : 'Preparation notes'}</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[210px] w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-4 leading-6 outline-none focus:ring-2 focus:ring-sage-200" placeholder="Key transitions, references, applications, questions, timing cues..." /></label>
              {mode === 'followup' && <label className="mt-4 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">What needs follow-up?</span><textarea value={responseNotes} onChange={(e) => setResponseNotes(e.target.value)} className="min-h-[120px] w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm outline-none focus:ring-2 focus:ring-sage-200" placeholder="Prayer themes, questions people asked, next-step groups, pastoral follow-up..." /></label>}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={save} className="inline-flex items-center rounded-xl bg-sage-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sage-700">{saved ? <Check className="mr-2 h-4 w-4" /> : <ClipboardPen className="mr-2 h-4 w-4" />}{saved ? 'Saved privately' : 'Save sermon desk'}</button>
            <Link href="/presentation" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><MonitorPlay className="mr-2 h-4 w-4" /> Presentation</Link>
            <Link href="/live-service" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><Radio className="mr-2 h-4 w-4" /> Live service</Link>
            <Link href="/service-response" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><MessageCircleHeart className="mr-2 h-4 w-4" /> Response flow</Link>
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <Sparkles className="h-7 w-7 text-sage-300" />
          <h3 className="mt-5 text-2xl font-light">Preaching intelligence that stays accountable.</h3>
          <div className="mt-6 space-y-3 text-sm leading-6 text-stone-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">Text first.</strong> Check context and translation licensing before building applications.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">Human review.</strong> AI sermon drafts require theological and pastoral review before public use.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">Live clarity.</strong> Keep cue notes concise enough to support preaching rather than becoming another screen to manage.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">Response matters.</strong> Connect the message to prayer, care, discipleship, service, and church belonging.</div>
          </div>
          <Link href="/scripture" className="mt-7 inline-flex items-center text-sm font-semibold text-sage-300"><BookOpenText className="mr-2 h-4 w-4" /> Open Scripture study</Link>
          <div className="mt-7 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Never present generated wording, interpretations, or impressions as guaranteed divine revelation.</div>
        </aside>
      </div>
    </section>
  );
}
