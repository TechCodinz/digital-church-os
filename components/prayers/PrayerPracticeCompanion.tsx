'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpenText,
  Check,
  HeartHandshake,
  Loader2,
  Mic,
  NotebookPen,
  Pause,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Square,
} from 'lucide-react';

type PrayerFocus = 'adoration' | 'confession' | 'gratitude' | 'intercession' | 'lament' | 'listening';

const focuses: Array<{ id: PrayerFocus; label: string; prompt: string }> = [
  { id: 'adoration', label: 'Adoration', prompt: 'Name what is true and beautiful about God from Scripture.' },
  { id: 'confession', label: 'Confession', prompt: 'Bring sin and failure honestly before God without self-condemnation.' },
  { id: 'gratitude', label: 'Gratitude', prompt: 'Remember specific gifts, people, provision, and grace.' },
  { id: 'intercession', label: 'Intercession', prompt: 'Pray for people, church, community, leaders, justice, and mission.' },
  { id: 'lament', label: 'Lament', prompt: 'Bring grief, disappointment, fear, and unanswered questions honestly.' },
  { id: 'listening', label: 'Quiet reflection', prompt: 'Sit quietly with Scripture; do not treat impressions as guaranteed revelation.' },
];

const LEGACY_PREFIX = 'digital-church-prayer-practice:';

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function key(userId: string) {
  return `digital-church-prayer-practice:v2:${userId}:${dayKey()}`;
}

function legacyKey() {
  return `${LEGACY_PREFIX}${dayKey()}`;
}

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = String(seconds % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

export function PrayerPracticeCompanion() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id || '';
  const [focus, setFocus] = useState<PrayerFocus>('gratitude');
  const [scripture, setScripture] = useState('');
  const [prayer, setPrayer] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [answered, setAnswered] = useState<string[]>([]);
  const [answerDraft, setAnswerDraft] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [legacyDraftPresent, setLegacyDraftPresent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!userId) return;
    try {
      setLegacyDraftPresent(Boolean(window.localStorage.getItem(legacyKey())));
      const raw = window.localStorage.getItem(key(userId));
      if (!raw) return;
      const data = JSON.parse(raw);
      setFocus(data.focus || 'gratitude');
      setScripture(data.scripture || '');
      setPrayer(data.prayer || '');
      setNextStep(data.nextStep || '');
      setAnswered(Array.isArray(data.answered) ? data.answered : []);
      setSeconds(Number.isFinite(data.seconds) ? data.seconds : 0);
    } catch {
      setSaveStatus('This account’s private prayer draft could not be restored from the browser.');
    }
  }, [userId]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
  }, [audioUrl]);

  const activeFocus = useMemo(() => focuses.find((item) => item.id === focus) || focuses[0], [focus]);

  const persist = async () => {
    if (saving) return;
    if (!userId) {
      setSaveStatus('Sign in to save this prayer practice privately to your account and Journey.');
      return;
    }

    setSaving(true);
    setSaveStatus('');
    let localSaved = false;
    try {
      window.localStorage.setItem(key(userId), JSON.stringify({ focus, scripture, prayer, nextStep, answered, seconds }));
      localSaved = true;
    } catch {
      localSaved = false;
    }

    const content = [
      `Prayer focus: ${activeFocus.label}`,
      prayer.trim() ? `Reflection: ${prayer.trim()}` : '',
      answered.length ? `Gratitude / answered-prayer memory: ${answered.slice(0, 4).join(' · ')}` : '',
      seconds > 0 ? `Prayer time recorded: ${formatTime(seconds)}` : '',
    ].filter(Boolean).join('\n\n');

    try {
      const response = await fetch('/api/journey/continuity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Prayer',
          sourceKey: `prayer-practice:${dayKey()}`,
          title: `${activeFocus.label} prayer practice`,
          content,
          scriptureRefs: scripture.trim() ? [scripture.trim()] : [],
          nextStep: nextStep.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSaveStatus(`Prayer practice saved privately and ${data.operation === 'updated' ? 'updated in' : 'added to'} your Journey.`);
      } else {
        setSaveStatus(localSaved ? `Prayer practice saved to this account’s browser draft. ${data.error || 'Journey sync is temporarily unavailable.'}` : (data.error || 'Unable to save this prayer practice.'));
      }
    } catch {
      setSaveStatus(localSaved ? 'Prayer practice saved to this account’s browser draft. Journey sync is temporarily unavailable.' : 'Unable to save this prayer practice.');
    } finally {
      setSaving(false);
    }
  };

  const addAnswer = () => {
    const value = answerDraft.trim();
    if (!value) return;
    setAnswered((current) => [value, ...current].slice(0, 12));
    setAnswerDraft('');
    setSaveStatus('');
  };

  const removeLegacyDraft = () => {
    try {
      window.localStorage.removeItem(legacyKey());
      setLegacyDraftPresent(false);
      setSaveStatus('Legacy unscoped prayer draft removed without importing it into this account.');
    } catch {
      setSaveStatus('Legacy prayer draft could not be removed.');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setRecording(false);
      setSaveStatus('Microphone access is unavailable. You can continue with typed prayer notes.');
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <section className="mb-10 overflow-hidden rounded-[2rem] border border-sage-100 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          {legacyDraftPresent && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
              An older device-only prayer draft exists. It was <strong>not imported</strong> because this browser may be shared and its original owner cannot be verified.
              <button type="button" onClick={removeLegacyDraft} className="ml-2 font-semibold underline">Remove legacy draft</button>
            </div>
          )}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700">
                <Sparkles className="mr-2 h-4 w-4" /> Prayer practice companion
              </div>
              <h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Pray with structure when helpful, freedom when needed, and a private memory of what you carried.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Use a focus, Scripture reference, timer, typed or voice reflection, answered-prayer memory, and one next step. Saving keeps an account-scoped browser draft and, when signed in, one updateable private Journey moment for today rather than duplicate entries.</p>
            </div>
            <div className="min-w-[150px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Prayer time</p>
              <p className="mt-1 font-mono text-3xl font-light">{formatTime(seconds)}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setRunning((value) => !value)} className="inline-flex items-center rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white">
                  {running ? <Pause className="mr-1 h-3.5 w-3.5" /> : <Play className="mr-1 h-3.5 w-3.5" />}{running ? 'Pause' : 'Start'}
                </button>
                <button type="button" onClick={() => { setRunning(false); setSeconds(0); setSaveStatus(''); }} className="rounded-lg bg-white/5 p-2 text-stone-300" aria-label="Reset prayer timer"><RotateCcw className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {focuses.map((item) => (
              <button key={item.id} type="button" onClick={() => { setFocus(item.id); setSaveStatus(''); }} className={`rounded-2xl border p-4 text-left transition ${focus === item.id ? 'border-sage-300 bg-sage-50' : 'border-stone-200 bg-stone-50 hover:border-sage-200'}`}>
                <p className="font-semibold text-stone-900">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-stone-500">{item.prompt}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4">
              <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Scripture anchor</span><input value={scripture} onChange={(e) => { setScripture(e.target.value); setSaveStatus(''); }} maxLength={160} placeholder="Reference only, e.g. Psalm 27" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-sage-200" /></label>
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-400">Current focus</p><p className="mt-2 font-semibold text-stone-900">{activeFocus.label}</p><p className="mt-1 text-sm leading-6 text-stone-600">{activeFocus.prompt}</p></div>
              <Link href="/scripture" className="inline-flex items-center text-sm font-semibold text-sage-700"><BookOpenText className="mr-2 h-4 w-4" /> Open Scripture study</Link>
            </div>
            <div>
              <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Private prayer / auto-jot</span><textarea value={prayer} onChange={(e) => { setPrayer(e.target.value); setSaveStatus(''); }} maxLength={3500} className="min-h-[220px] w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm leading-7 outline-none focus:ring-2 focus:ring-sage-200" placeholder="Write your prayer, burdens, gratitude, names, questions, or what you want to remember..." /></label>
              <div className="mt-3 flex flex-wrap gap-3">
                {!recording ? <button type="button" onClick={startRecording} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700"><Mic className="mr-2 h-4 w-4" /> Record prayer reflection</button> : <button type="button" onClick={stopRecording} className="inline-flex items-center rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white"><Square className="mr-2 h-4 w-4" /> Stop recording</button>}
                <button type="button" onClick={persist} disabled={saving} className="inline-flex items-center rounded-xl bg-sage-600 px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saveStatus.includes('saved privately') || saveStatus.includes('saved to') ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{saving ? 'Saving privately…' : 'Save prayer practice'}</button>
              </div>
              {saveStatus && <p className="mt-3 text-xs leading-5 text-stone-500" role="status">{saveStatus}</p>}
              {audioUrl && <audio className="mt-4 w-full" controls src={audioUrl} />}
              <Link href="/journey" className="mt-3 inline-flex text-xs font-semibold text-sage-700">Open private Journey →</Link>
            </div>
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <NotebookPen className="h-7 w-7 text-sage-300" />
          <h3 className="mt-5 text-2xl font-light">Remember answers, remain grounded, and know when to involve people.</h3>

          <label className="mt-6 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Answered prayer / gratitude memory</span><div className="flex gap-2"><input value={answerDraft} onChange={(e) => setAnswerDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAnswer(); } }} maxLength={600} placeholder="What changed or what are you thankful for?" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-sage-400" /><button type="button" onClick={addAnswer} className="rounded-xl bg-sage-500 px-4 text-sm font-semibold text-white">Add</button></div></label>

          <div className="mt-4 max-h-44 space-y-2 overflow-y-auto">
            {answered.length === 0 ? <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-stone-400">No answer memories yet. This area is for gratitude and remembrance, not proof that every prayer will be answered in a specific way.</p> : answered.map((item, index) => <div key={`${item}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-stone-300">{item}</div>)}
          </div>

          <label className="mt-6 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">One faithful next step</span><textarea value={nextStep} onChange={(e) => { setNextStep(e.target.value); setSaveStatus(''); }} maxLength={800} placeholder="Apologize, call someone, rest, seek counsel, serve, keep praying..." className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-sage-400" /></label>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link href="/fasting-prayer" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-amber-300">Continue in fasting & prayer</Link>
            <Link href="/journal" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-sage-300">Move reflection to journal</Link>
            <Link href="/care" className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-stone-900"><HeartHandshake className="mr-2 h-4 w-4" /> Request human care</Link>
          </div>

          <p className="mt-6 text-xs leading-5 text-stone-400">Quiet impressions, AI suggestions, and emotional experiences should not be treated as guaranteed divine instructions. Test important decisions through Scripture, wisdom, accountable community, and appropriate professional help where relevant.</p>
        </aside>
      </div>
    </section>
  );
}
