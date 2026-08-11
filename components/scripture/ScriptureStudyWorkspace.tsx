'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BookOpenText,
  Check,
  Languages,
  Mic,
  Square,
  NotebookPen,
  Sparkles,
  ShieldCheck,
  Presentation,
  Church,
} from 'lucide-react';

const translations = [
  { id: 'KJV', label: 'King James Version', posture: 'Public-domain friendly where applicable' },
  { id: 'WEB', label: 'World English Bible', posture: 'Public-domain friendly' },
  { id: 'ASV', label: 'American Standard Version', posture: 'Public-domain friendly' },
  { id: 'NIV', label: 'New International Version', posture: 'Licensed provider required' },
  { id: 'NLT', label: 'New Living Translation', posture: 'Licensed provider required' },
  { id: 'ESV', label: 'English Standard Version', posture: 'Licensed provider required' },
];

const studyPrompts = [
  'What does the passage say in its immediate context?',
  'What does this reveal about God, people, faith, or obedience?',
  'What should I pray about because of this passage?',
  'What is one concrete action I can carry into today?',
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function ScriptureStudyWorkspace() {
  const [reference, setReference] = useState('John 15:1-8');
  const [primaryVersion, setPrimaryVersion] = useState('KJV');
  const [compareVersion, setCompareVersion] = useState('WEB');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const storageKey = useMemo(() => `digital-church-scripture-note:${todayKey()}:${reference}`, [reference]);

  useEffect(() => {
    try {
      setNote(window.localStorage.getItem(storageKey) || '');
    } catch {
      setNote('');
    }
  }, [storageKey]);

  const saveNote = () => {
    try {
      window.localStorage.setItem(storageKey, note);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch {
      setSaved(false);
    }
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

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700">
              <BookOpenText className="mr-2 h-4 w-4" /> Scripture study desk
            </div>
            <h2 className="mt-5 text-3xl font-light leading-tight text-stone-900 md:text-4xl">Compare responsibly, jot what matters, and carry one truth into the day.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              Choose a reference and translation posture, then use your own Bible provider or licensed text source. Digital Church OS keeps notes and voice reflections separate from copyrighted Bible text.
            </p>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <label className="md:col-span-1">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Passage</span>
                <input value={reference} onChange={(e) => setReference(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none focus:ring-2 focus:ring-sage-200" />
              </label>
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Primary version</span>
                <select value={primaryVersion} onChange={(e) => setPrimaryVersion(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-800">
                  {translations.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Compare with</span>
                <select value={compareVersion} onChange={(e) => setCompareVersion(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-800">
                  {translations.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[primaryVersion, compareVersion].map((version) => {
                const item = translations.find((entry) => entry.id === version)!;
                return (
                  <div key={version} className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-stone-900">{item.id}</span>
                      <Languages className="h-4 w-4 text-sage-600" />
                    </div>
                    <p className="mt-1 text-xs text-stone-500">{item.label}</p>
                    <p className="mt-3 text-xs font-medium text-sage-700">{item.posture}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-300">Study intelligence</p>
            <h3 className="mt-3 text-2xl font-light">Four questions before AI adds anything.</h3>
            <div className="mt-6 space-y-3">
              {studyPrompts.map((prompt, index) => (
                <div key={prompt} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-400/15 text-xs font-bold text-sage-300">{index + 1}</span>
                  <span>{prompt}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100">
              AI study insights should be checked against the biblical text, context, trusted scholarship, and accountable church teaching before public use.
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-700">Auto-jot workspace</p>
              <h3 className="mt-2 text-2xl font-light text-stone-900">What are you seeing in {reference}?</h3>
            </div>
            <NotebookPen className="h-6 w-6 text-sage-600" />
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Context, observations, prayer, questions, application..." className="mt-5 min-h-[220px] w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-5 leading-7 text-stone-700 outline-none focus:ring-2 focus:ring-sage-200" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={saveNote} className="inline-flex items-center rounded-xl bg-sage-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-700">
              {saved ? <Check className="mr-2 h-4 w-4" /> : <NotebookPen className="mr-2 h-4 w-4" />} {saved ? 'Saved privately' : 'Save today’s note'}
            </button>
            {!recording ? (
              <button onClick={startRecording} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-sage-300">
                <Mic className="mr-2 h-4 w-4" /> Record voice reflection
              </button>
            ) : (
              <button onClick={stopRecording} className="inline-flex items-center rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white">
                <Square className="mr-2 h-4 w-4" /> Stop recording
              </button>
            )}
          </div>
          {voiceUrl && <audio className="mt-5 w-full" controls src={voiceUrl} />}
          <p className="mt-3 text-xs text-stone-400">Text notes persist on this device for this passage/day. Voice reflections stay in this browser session unless you explicitly export or upload them later.</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-sage-100 bg-sage-50 p-6">
            <Sparkles className="h-5 w-5 text-sage-700" />
            <h3 className="mt-4 text-xl font-semibold text-stone-900">Daily alignment</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">Read → observe → pray → choose one faithful action → revisit tonight. Keep the rhythm simple enough to repeat.</p>
            <Link href="/journey" className="mt-5 inline-flex text-sm font-semibold text-sage-700">Continue spiritual journey →</Link>
          </div>
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <Presentation className="h-5 w-5 text-blue-700" />
            <h3 className="mt-4 text-xl font-semibold text-stone-900">Teaching & projection</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">Move references into sermon preparation or the presentation system without copying unlicensed translation text.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/sermons" className="text-sm font-semibold text-blue-700">Sermon studio →</Link>
              <Link href="/presentation" className="text-sm font-semibold text-blue-700">Presentation →</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <ShieldCheck className="h-5 w-5 text-stone-700" />
            <h3 className="mt-4 text-xl font-semibold text-stone-900">Church alignment</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">For doctrinal questions or interpretation that affects teaching, use accountable church leadership rather than treating AI output as authority.</p>
            <Link href="/church-network" className="mt-5 inline-flex items-center text-sm font-semibold text-stone-700"><Church className="mr-2 h-4 w-4" /> Find church connection</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
