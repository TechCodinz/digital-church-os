'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpenText, Check, Clock3, Loader2, Mic2, NotebookPen, Play, Presentation, Radio, RotateCcw, Save, Square } from 'lucide-react';

type SermonDraft = {
  title: string;
  audience: string;
  duration: number;
  scripture: string;
  opening: string;
  mainPoints: string;
  closing: string;
  response: string;
};

const initialDraft: SermonDraft = {
  title: '',
  audience: 'Whole church',
  duration: 30,
  scripture: '',
  opening: '',
  mainPoints: '',
  closing: '',
  response: '',
};

function formatSeconds(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function SermonDeliveryWorkbench() {
  const [draft, setDraft] = useState<SermonDraft>(initialDraft);
  const [saved, setSaved] = useState(false);
  const [journalStatus, setJournalStatus] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);
  const [rehearsing, setRehearsing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('digital-church-sermon-delivery-workbench');
      if (stored) setDraft({ ...initialDraft, ...JSON.parse(stored) });
    } catch {
      // Local persistence is optional.
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const wordCount = useMemo(() => [draft.opening, draft.mainPoints, draft.closing, draft.response].join(' ').trim().split(/\s+/).filter(Boolean).length, [draft]);
  const estimatedMinutes = Math.max(1, Math.round(wordCount / 130));
  const paceStatus = estimatedMinutes <= draft.duration ? 'Within target' : `${estimatedMinutes - draft.duration} min over target`;

  const update = <K extends keyof SermonDraft>(key: K, value: SermonDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const savePrivate = () => {
    try {
      window.localStorage.setItem('digital-church-sermon-delivery-workbench', JSON.stringify(draft));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setSaved(false);
    }
  };

  const saveToJournal = async () => {
    const body = [
      draft.scripture ? `Scripture: ${draft.scripture}` : '',
      draft.opening ? `Opening:\n${draft.opening}` : '',
      draft.mainPoints ? `Main points:\n${draft.mainPoints}` : '',
      draft.closing ? `Closing:\n${draft.closing}` : '',
      draft.response ? `Response / follow-up:\n${draft.response}` : '',
    ].filter(Boolean).join('\n\n');
    if (!body) return;
    setSavingJournal(true);
    setJournalStatus('');
    try {
      const res = await fetch('/api/user/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draft.title ? `Sermon preparation — ${draft.title}` : 'Sermon preparation notes', content: body, mood: 'Seeking' }),
      });
      if (res.status === 401) setJournalStatus('Sign in to save this preparation note to your private journal.');
      else if (!res.ok) setJournalStatus('Journal save is temporarily unavailable.');
      else setJournalStatus('Saved to your private journal.');
    } catch {
      setJournalStatus('Journal save is temporarily unavailable.');
    } finally {
      setSavingJournal(false);
    }
  };

  const toggleRehearsal = () => {
    if (rehearsing) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setRehearsing(false);
      return;
    }
    setRehearsing(true);
    timerRef.current = setInterval(() => setElapsed((value) => value + 1), 1000);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setElapsed(0);
    setRehearsing(false);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-700"><Mic2 className="mr-2 h-4 w-4" /> Delivery & rehearsal workbench</div>
          <h2 className="mt-5 text-3xl font-light leading-tight text-stone-900 md:text-4xl">Move from generated material to a message you can actually preach, teach, project, and follow up.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Shape the sermon in your own voice. Keep Scripture references visible, rehearse timing, define the congregational response, and preserve your preparation notes without treating AI output as final authority.</p>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <label className="md:col-span-2"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Message title / theme</span><input value={draft.title} onChange={(e) => update('title', e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200" placeholder="Faith that works through love" /></label>
            <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Target minutes</span><input type="number" min={5} max={120} value={draft.duration} onChange={(e) => update('duration', Math.min(120, Math.max(5, Number(e.target.value) || 30)))} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3" /></label>
            <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Audience</span><select value={draft.audience} onChange={(e) => update('audience', e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"><option>Whole church</option><option>Youth</option><option>Children & family</option><option>Leaders</option><option>New believers</option><option>Outreach / visitors</option><option>Small group</option></select></label>
            <label className="md:col-span-2"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Primary Scripture references</span><input value={draft.scripture} onChange={(e) => update('scripture', e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3" placeholder="Galatians 5:6; James 2:14-18" /></label>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Opening / tension</span><textarea rows={5} value={draft.opening} onChange={(e) => update('opening', e.target.value)} className="w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6" placeholder="Why does this message matter to the people listening today?" /></label>
            <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Main points & transitions</span><textarea rows={5} value={draft.mainPoints} onChange={(e) => update('mainPoints', e.target.value)} className="w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6" placeholder="Point 1… transition… Point 2… illustration…" /></label>
            <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Closing / summary</span><textarea rows={4} value={draft.closing} onChange={(e) => update('closing', e.target.value)} className="w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6" placeholder="Restate the truth clearly without manufacturing emotion." /></label>
            <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">Response & follow-up</span><textarea rows={4} value={draft.response} onChange={(e) => update('response', e.target.value)} className="w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6" placeholder="Prayer, discussion question, service action, care follow-up, salvation response, next study…" /></label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={savePrivate} className="inline-flex items-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{saved ? 'Saved privately' : 'Save preparation'}</button>
            <button type="button" onClick={saveToJournal} disabled={savingJournal} className="inline-flex items-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-800 disabled:opacity-50">{savingJournal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <NotebookPen className="mr-2 h-4 w-4" />}Journal copy</button>
            <Link href="/scripture" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><BookOpenText className="mr-2 h-4 w-4" /> Verify Scripture</Link>
            <Link href="/presentation" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><Presentation className="mr-2 h-4 w-4" /> Presentation</Link>
            <Link href="/live-service" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><Radio className="mr-2 h-4 w-4" /> Live service</Link>
          </div>
          {journalStatus && <p className="mt-3 text-xs text-stone-500">{journalStatus}</p>}
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Rehearsal intelligence</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] uppercase tracking-wider text-stone-500">Draft words</p><p className="mt-1 text-3xl font-light">{wordCount}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] uppercase tracking-wider text-stone-500">Est. spoken</p><p className="mt-1 text-3xl font-light">{estimatedMinutes}m</p></div>
          </div>
          <div className={`mt-3 rounded-2xl border p-4 text-sm ${estimatedMinutes <= draft.duration ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'border-amber-300/20 bg-amber-300/10 text-amber-100'}`}>{paceStatus}. Estimate uses roughly 130 spoken words/minute; rehearsal timing is more reliable.</div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-6 text-center">
            <Clock3 className="mx-auto h-7 w-7 text-blue-300" />
            <p className="mt-3 text-5xl font-light tabular-nums">{formatSeconds(elapsed)}</p>
            <p className="mt-1 text-xs text-stone-500">Target {draft.duration}:00</p>
            <div className="mt-5 flex justify-center gap-2"><button type="button" onClick={toggleRehearsal} className={`inline-flex items-center rounded-xl px-5 py-3 text-sm font-semibold text-white ${rehearsing ? 'bg-rose-600' : 'bg-blue-600'}`}>{rehearsing ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}{rehearsing ? 'Pause rehearsal' : 'Start rehearsal'}</button><button type="button" onClick={resetTimer} className="rounded-xl border border-white/10 bg-white/5 p-3 text-stone-300" aria-label="Reset rehearsal timer"><RotateCcw className="h-4 w-4" /></button></div>
          </div>

          <div className="mt-6 space-y-3 text-xs leading-5 text-stone-400">
            <p>• Verify quoted Bible text against an enabled licensed or public-domain source.</p>
            <p>• Review AI-generated theology, historical claims, illustrations, and applications before preaching.</p>
            <p>• Do not manufacture prophecy, guaranteed outcomes, or emotional pressure to force a response.</p>
            <p>• Build clear pathways for prayer, pastoral care, questions, and follow-up after the message.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
