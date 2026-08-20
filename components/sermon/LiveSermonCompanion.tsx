'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpenText,
  Check,
  Clock3,
  Download,
  Lightbulb,
  Mic,
  NotebookPen,
  Plus,
  ShieldCheck,
  Square,
  Target,
} from 'lucide-react';

type Jot = {
  id: string;
  time: string;
  text: string;
  type: 'insight' | 'verse' | 'action' | 'question';
};

const jotTypes: Array<{ key: Jot['type']; label: string }> = [
  { key: 'insight', label: 'Insight' },
  { key: 'verse', label: 'Verse' },
  { key: 'action', label: 'Action' },
  { key: 'question', label: 'Question' },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatElapsed(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = String(seconds % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

export function LiveSermonCompanion() {
  const [sermonTitle, setSermonTitle] = useState('');
  const [mainReference, setMainReference] = useState('');
  const [jotText, setJotText] = useState('');
  const [jotType, setJotType] = useState<Jot['type']>('insight');
  const [jots, setJots] = useState<Jot[]>([]);
  const [takeaway, setTakeaway] = useState('');
  const [prayer, setPrayer] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const storageKey = useMemo(() => `digital-church-sermon-companion:${todayKey()}`, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSermonTitle(parsed.sermonTitle || '');
        setMainReference(parsed.mainReference || '');
        setJots(Array.isArray(parsed.jots) ? parsed.jots : []);
        setTakeaway(parsed.takeaway || '');
        setPrayer(parsed.prayer || '');
      }
    } catch {
      // Local persistence is optional.
    }
  }, [storageKey]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const persist = () => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ sermonTitle, mainReference, jots, takeaway, prayer }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1500);
    } catch {
      setSaved(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (sermonTitle || mainReference || jots.length || takeaway || prayer) persist();
    }, 700);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sermonTitle, mainReference, jots, takeaway, prayer]);

  const addJot = () => {
    const text = jotText.trim();
    if (!text) return;
    setJots((current) => [
      ...current,
      { id: `${Date.now()}`, time: formatElapsed(elapsed), text, type: jotType },
    ]);
    setJotText('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setVoiceUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setRecording(false);
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const exportNotes = () => {
    const lines = [
      sermonTitle || 'Sermon notes',
      mainReference ? `Main Scripture: ${mainReference}` : '',
      '',
      ...jots.map((jot) => `[${jot.time}] ${jot.type.toUpperCase()}: ${jot.text}`),
      '',
      takeaway ? `Daily takeaway: ${takeaway}` : '',
      prayer ? `Prayer response: ${prayer}` : '',
      '',
      'Prepared in Digital Church OS — review Scripture references and teaching context before sharing.',
    ].filter(Boolean);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sermon-notes-${todayKey()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.12fr_0.88fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700">
                <NotebookPen className="mr-2 h-4 w-4" /> Live sermon companion
              </div>
              <h2 className="mt-4 text-3xl font-light text-stone-900">Listen deeply. Jot the moment. Carry one truth into the week.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
                A private sermon notebook for timestamps, verse references, questions, prayer responses, and practical next steps. Notes auto-save on this device.
              </p>
            </div>
            <div className="rounded-2xl bg-stone-950 px-5 py-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Service timer</p>
              <p className="mt-1 font-mono text-2xl">{formatElapsed(elapsed)}</p>
              <button onClick={() => setRunning((value) => !value)} className="mt-2 text-xs font-semibold text-sage-300">
                {running ? 'Pause timer' : 'Start timer'}
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Sermon title</span>
              <input value={sermonTitle} onChange={(e) => setSermonTitle(e.target.value)} placeholder="Today’s message" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-sage-200" />
            </label>
            <label>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Main Scripture</span>
              <input value={mainReference} onChange={(e) => setMainReference(e.target.value)} placeholder="e.g. Romans 12:1–2" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-sage-200" />
            </label>
          </div>

          <div className="mt-6 rounded-3xl border border-stone-100 bg-stone-50 p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {jotTypes.map((item) => (
                <button key={item.key} type="button" onClick={() => setJotType(item.key)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${jotType === item.key ? 'bg-sage-600 text-white' : 'bg-white text-stone-600'}`}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea value={jotText} onChange={(e) => setJotText(e.target.value)} placeholder="Jot what stood out at this moment…" className="min-h-[92px] flex-1 resize-y rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-sage-200" />
              <button onClick={addJot} disabled={!jotText.trim()} className="inline-flex items-center justify-center rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40 sm:self-end">
                <Plus className="mr-2 h-4 w-4" /> Add jot
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {jots.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 p-6 text-center text-sm text-stone-400">Your live sermon jots will appear here.</div>
            ) : jots.map((jot) => (
              <div key={jot.id} className="flex gap-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
                <span className="mt-0.5 rounded-lg bg-sage-50 px-2 py-1 font-mono text-[10px] font-bold text-sage-700"><Clock3 className="mr-1 inline h-3 w-3" />{jot.time}</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{jot.type}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-700">{jot.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="border-t border-stone-100 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-300">After-sermon alignment</p>
          <h3 className="mt-3 text-2xl font-light">Turn inspiration into remembrance, prayer, and action.</h3>

          <label className="mt-7 block">
            <span className="mb-2 flex items-center text-xs font-bold uppercase tracking-wider text-stone-400"><Target className="mr-2 h-4 w-4" /> One faithful action</span>
            <textarea value={takeaway} onChange={(e) => setTakeaway(e.target.value)} placeholder="What will I do differently because of this message?" className="min-h-[110px] w-full resize-y rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-sage-400" />
          </label>

          <label className="mt-5 block">
            <span className="mb-2 flex items-center text-xs font-bold uppercase tracking-wider text-stone-400"><Lightbulb className="mr-2 h-4 w-4" /> Prayer response</span>
            <textarea value={prayer} onChange={(e) => setPrayer(e.target.value)} placeholder="Write a short prayer from what you heard…" className="min-h-[110px] w-full resize-y rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-sage-400" />
          </label>

          <div className="mt-5 flex flex-wrap gap-2">
            {!recording ? (
              <button onClick={startRecording} className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10"><Mic className="mr-2 h-4 w-4" /> Voice reflection</button>
            ) : (
              <button onClick={stopRecording} className="inline-flex items-center rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white"><Square className="mr-2 h-4 w-4" /> Stop recording</button>
            )}
            <button onClick={exportNotes} className="inline-flex items-center rounded-xl bg-sage-500 px-4 py-2.5 text-xs font-semibold text-white"><Download className="mr-2 h-4 w-4" /> Export notes</button>
          </div>
          {voiceUrl && <audio className="mt-4 w-full" controls src={voiceUrl} />}

          <div className="mt-6 rounded-2xl border border-sage-300/20 bg-sage-300/10 p-4 text-xs leading-5 text-stone-300">
            <ShieldCheck className="mb-2 h-4 w-4 text-sage-300" />
            Sermon notes are personal study aids. Check quotations and Scripture references before sharing, and keep public teaching under accountable pastoral review.
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-sage-300">
            <Link href="/scripture">Open Scripture study →</Link>
            <Link href="/journey">Add to my journey →</Link>
          </div>
          {saved && <p className="mt-4 inline-flex items-center text-xs text-sage-300"><Check className="mr-1 h-4 w-4" /> Auto-saved privately</p>}
        </aside>
      </div>
    </section>
  );
}
