'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BookOpenText,
  Check,
  Clock3,
  HeartHandshake,
  Mic,
  NotebookPen,
  Plus,
  Save,
  Sparkles,
  Square,
  X,
} from 'lucide-react';

type MarkedPoint = { id: string; text: string; at: string };

function storageKey() {
  return `digital-church-live-sermon:${new Date().toISOString().slice(0, 10)}`;
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function LiveSermonCompanion() {
  const startedAt = useRef(Date.now());
  const [open, setOpen] = useState(true);
  const [notes, setNotes] = useState('');
  const [pointText, setPointText] = useState('');
  const [points, setPoints] = useState<MarkedPoint[]>([]);
  const [scriptures, setScriptures] = useState('');
  const [takeaway, setTakeaway] = useState('');
  const [saved, setSaved] = useState(false);
  const [journeyStatus, setJourneyStatus] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const summary = useMemo(() => {
    const parts = [
      notes.trim() ? `Notes:\n${notes.trim()}` : '',
      points.length ? `Key points:\n${points.map((point) => `• [${point.at}] ${point.text}`).join('\n')}` : '',
    ].filter(Boolean);
    return parts.join('\n\n');
  }, [notes, points]);

  const addPoint = () => {
    const text = pointText.trim();
    if (!text) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAt.current) / 1000));
    setPoints((current) => [...current, { id: `${Date.now()}`, text, at: formatElapsed(elapsed) }]);
    setPointText('');
  };

  const savePrivate = () => {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify({ notes, points, scriptures, takeaway }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch {
      setSaved(false);
    }
  };

  const saveToJourney = async () => {
    if (!summary && !scriptures.trim() && !takeaway.trim()) return;
    savePrivate();
    setJourneyStatus('Saving…');
    try {
      const dateKey = new Date().toISOString().slice(0, 10);
      const res = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Live Sermon',
          sourceKey: `live-sermon:${dateKey}`,
          title: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          content: summary || 'Live sermon reflection',
          scriptureRefs: scriptures.trim() || undefined,
          nextStep: takeaway.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setJourneyStatus(data.operation === 'updated' ? 'Updated in private Journey' : 'Saved to private Journey');
        window.dispatchEvent(new CustomEvent('digital-church:journey-updated'));
      } else if (res.status === 401) setJourneyStatus('Sign in to save to Journey');
      else setJourneyStatus(data.error || 'Journey save unavailable');
    } catch {
      setJourneyStatus('Journey save unavailable; your browser draft remains available');
    }
  };

  const startVoiceJot = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setJourneyStatus('Live speech-to-text is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) finalText += `${event.results[i][0].transcript} `;
      }
      if (finalText) setNotes((current) => `${current}${current ? ' ' : ''}${finalText.trim()}`);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopVoiceJot = () => {
    recognitionRef.current?.stop?.();
    setListening(false);
  };

  if (!open) {
    return (
      <div className="bg-stone-950 px-4 py-5 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-300">Live sermon companion</p>
            <p className="mt-1 text-sm text-stone-300">Capture key points, Scripture, and one next action while you listen.</p>
          </div>
          <button onClick={() => setOpen(true)} className="rounded-xl bg-sage-500 px-4 py-2 text-sm font-semibold text-white">Open notes</button>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-stone-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-stone-900 shadow-2xl">
        <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center rounded-full bg-sage-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-300">
                  <NotebookPen className="mr-2 h-4 w-4" /> Live sermon companion
                </div>
                <h2 className="mt-4 text-3xl font-light">Listen actively without losing what matters.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-400">Jot notes, mark moments, record references, and choose one faithful next action. This companion does not interpret the sermon for you or replace accountable teaching.</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Collapse sermon companion" className="rounded-xl border border-white/10 p-2 text-stone-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.7fr]">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Live notes</label>
                  {!listening ? (
                    <button onClick={startVoiceJot} className="inline-flex items-center text-xs font-semibold text-sage-300"><Mic className="mr-1.5 h-3.5 w-3.5" /> Voice auto-jot</button>
                  ) : (
                    <button onClick={stopVoiceJot} className="inline-flex items-center text-xs font-semibold text-rose-300"><Square className="mr-1.5 h-3.5 w-3.5" /> Stop listening</button>
                  )}
                </div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[260px] w-full resize-y rounded-2xl border border-white/10 bg-black/20 p-5 leading-7 text-stone-100 outline-none focus:ring-2 focus:ring-sage-500/40" placeholder="What stood out? What was explained? What question do you want to revisit?" />
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Mark a key moment</label>
                  <div className="mt-3 flex gap-2">
                    <input value={pointText} onChange={(e) => setPointText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addPoint(); }} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none" placeholder="Key point…" />
                    <button onClick={addPoint} aria-label="Add key point" className="rounded-xl bg-sage-500 p-2.5 text-white"><Plus className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
                    {points.map((point) => (
                      <div key={point.id} className="flex gap-2 rounded-xl bg-white/5 p-3 text-xs leading-5 text-stone-300"><span className="inline-flex shrink-0 items-center text-sage-300"><Clock3 className="mr-1 h-3 w-3" />{point.at}</span><span>{point.text}</span></div>
                    ))}
                    {!points.length && <p className="text-xs text-stone-500">No marked moments yet.</p>}
                  </div>
                </div>

                <label className="block rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Scripture references</span>
                  <textarea value={scriptures} onChange={(e) => setScriptures(e.target.value)} className="mt-3 min-h-[90px] w-full resize-y rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none" placeholder="Romans 8:1-4, Psalm 23…" />
                </label>
              </div>
            </div>
          </div>

          <aside className="border-t border-white/10 bg-black/20 p-6 sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
            <Sparkles className="h-7 w-7 text-amber-300" />
            <h3 className="mt-4 text-2xl font-light">Turn hearing into a faithful response.</h3>
            <p className="mt-3 text-sm leading-6 text-stone-400">A sermon can inform, encourage, challenge, or comfort. Capture one concrete response instead of turning the service into a public score.</p>

            <label className="mt-6 block">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">My next faithful action</span>
              <textarea value={takeaway} onChange={(e) => setTakeaway(e.target.value)} className="mt-3 min-h-[150px] w-full resize-y rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-amber-400/30" placeholder="Pray about…, apologize to…, study…, serve…, ask a leader…, change one habit…" />
            </label>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <button onClick={savePrivate} className="inline-flex items-center justify-center rounded-xl bg-sage-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sage-500">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{saved ? 'Saved privately' : 'Save private notes'}</button>
              <button onClick={saveToJourney} disabled={!summary && !scriptures.trim() && !takeaway.trim()} className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-stone-100 disabled:opacity-40"><BookOpenText className="mr-2 h-4 w-4" /> Save to Journey</button>
            </div>
            {journeyStatus && <p className="mt-3 text-xs text-stone-400">{journeyStatus}</p>}

            <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
              <Link href="/scripture" className="flex items-center text-sm font-semibold text-sage-300"><BookOpenText className="mr-2 h-4 w-4" /> Study the referenced passage</Link>
              <Link href="/journey" className="flex items-center text-sm font-semibold text-amber-300"><NotebookPen className="mr-2 h-4 w-4" /> Open private Journey</Link>
              <Link href="/care" className="flex items-center text-sm font-semibold text-rose-300"><HeartHandshake className="mr-2 h-4 w-4" /> Ask for human pastoral care</Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}