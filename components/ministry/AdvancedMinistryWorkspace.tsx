'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Compass,
  LockKeyhole,
  Mic,
  MicOff,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type WorkspaceItem = {
  title: string;
  description: string;
};

type WorkspaceAction = {
  label: string;
  href: string;
  description: string;
};

type AdvancedMinistryWorkspaceProps = {
  eyebrow: string;
  title: string;
  description: string;
  emoji: string;
  focus: WorkspaceItem[];
  intelligence: WorkspaceItem[];
  safeguards: string[];
  actions: WorkspaceAction[];
  privacyNote?: string;
};

type SavedWorkspaceState = {
  selectedFocus: number;
  completedSteps: number[];
  notes: string;
  updatedAt: string;
};

function makeStorageKey(eyebrow: string) {
  return `digital-church-os:workspace:${eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export function AdvancedMinistryWorkspace({
  eyebrow,
  title,
  description,
  emoji,
  focus,
  intelligence,
  safeguards,
  actions,
  privacyNote = 'Sensitive notes and decisions should remain permission-aware, human-reviewable, and private by default.',
}: AdvancedMinistryWorkspaceProps) {
  const [selectedFocus, setSelectedFocus] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<any>(null);

  const storageKey = useMemo(() => makeStorageKey(eyebrow), [eyebrow]);
  const activeFocus = focus[selectedFocus] ?? focus[0];
  const completion = intelligence.length > 0 ? Math.round((completedSteps.length / intelligence.length) * 100) : 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as SavedWorkspaceState;
        if (Number.isInteger(saved.selectedFocus) && saved.selectedFocus >= 0 && saved.selectedFocus < focus.length) {
          setSelectedFocus(saved.selectedFocus);
        }
        if (Array.isArray(saved.completedSteps)) setCompletedSteps(saved.completedSteps.filter((index) => index >= 0 && index < intelligence.length));
        if (typeof saved.notes === 'string') setNotes(saved.notes);
        if (saved.updatedAt) setSavedAt(saved.updatedAt);
      }
    } catch {
      // Local workspace recovery is best-effort; a corrupt browser value should never block the page.
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceAvailable(Boolean(SpeechRecognition));

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = document.documentElement.lang || 'en-US';
      recognition.onresult = (event: any) => {
        let finalText = '';
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          if (event.results[index].isFinal) finalText += `${event.results[index][0].transcript} `;
        }
        if (finalText.trim()) {
          setNotes((current) => `${current}${current && !current.endsWith('\n') ? ' ' : ''}${finalText.trim()}`);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        // Ignore browser speech shutdown errors during navigation.
      }
    };
  }, [focus.length, intelligence.length, storageKey]);

  function saveWorkspace() {
    if (typeof window === 'undefined') return;
    const updatedAt = new Date().toISOString();
    const payload: SavedWorkspaceState = { selectedFocus, completedSteps, notes, updatedAt };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
    setSavedAt(updatedAt);
  }

  function toggleStep(index: number) {
    setCompletedSteps((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]));
  }

  function toggleVoice() {
    if (!voiceAvailable || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }

  async function copySummary() {
    const completedTitles = completedSteps.map((index) => intelligence[index]?.title).filter(Boolean);
    const summary = [
      `${eyebrow} — private workspace summary`,
      activeFocus ? `Focus: ${activeFocus.title}` : '',
      completedTitles.length ? `Completed: ${completedTitles.join(', ')}` : 'Completed: none yet',
      notes.trim() ? `Notes: ${notes.trim()}` : 'Notes: none',
      'Review status: Human review required before ministry, pastoral, safeguarding, financial, or doctrinal decisions.',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function resetWorkspace() {
    setSelectedFocus(0);
    setCompletedSteps([]);
    setNotes('');
    setSavedAt(null);
    if (typeof window !== 'undefined') window.localStorage.removeItem(storageKey);
  }

  return (
    <main className="min-h-screen bg-cream-50 pb-28 pt-20 sm:pt-24 lg:pb-16">
      <section className="relative overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(120,155,100,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(210,180,140,0.22),_transparent_36%)]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-sage-200 bg-white/85 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" /> {eyebrow}
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-900 md:text-6xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">{description}</p>
            <div className="mt-7 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white/80 px-3 py-1.5"><Compass className="mr-1.5 h-3.5 w-3.5 text-sage-600" /> Guided workflow</span>
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white/80 px-3 py-1.5"><LockKeyhole className="mr-1.5 h-3.5 w-3.5 text-sage-600" /> Local private draft</span>
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white/80 px-3 py-1.5"><ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-sage-600" /> Human accountable</span>
            </div>
          </div>

          <div className="sanctuary-card overflow-hidden p-0 shadow-2xl">
            <div className="border-b border-cream-200 bg-gradient-to-br from-white to-sage-50/80 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sage-600">Ministry intelligence</p>
                  <h2 className="mt-2 text-2xl font-medium text-stone-900">Live guided command surface</h2>
                </div>
                <div className="rounded-3xl border border-sage-100 bg-white p-4 text-4xl shadow-sm" aria-hidden="true">{emoji}</div>
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-medium text-stone-500">
                  <span>Guided review</span>
                  <span>{completion}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-sage-500 transition-all" style={{ width: `${completion}%` }} />
                </div>
              </div>
            </div>
            <div className="grid gap-3 p-5 sm:p-6">
              {intelligence.map((item, index) => {
                const complete = completedSteps.includes(index);
                return (
                  <button
                    type="button"
                    key={item.title}
                    onClick={() => toggleStep(index)}
                    className={`rounded-2xl border p-4 text-left transition ${complete ? 'border-sage-300 bg-sage-50' : 'border-cream-200 bg-white/85 hover:border-sage-200'}`}
                    aria-pressed={complete}
                  >
                    <div className="flex gap-3">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${complete ? 'bg-sage-600 text-white' : 'bg-sage-100 text-sage-700'}`}>
                        {complete ? <Check className="h-4 w-4" /> : index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-stone-900">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-sage-700">{complete ? 'Reviewed' : 'Tap when reviewed'}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-cream-200 bg-white/65 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Workspace capabilities</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-light text-stone-900 sm:text-4xl">Choose the ministry focus you are working on now.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {focus.map((item, index) => {
              const selected = selectedFocus === index;
              return (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => setSelectedFocus(index)}
                  className={`sanctuary-card p-6 text-left transition ${selected ? 'ring-2 ring-sage-400 ring-offset-2' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
                  aria-pressed={selected}
                >
                  <CheckCircle2 className={`h-6 w-6 ${selected ? 'text-sage-700' : 'text-sage-500'}`} aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-semibold text-stone-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.description}</p>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-sage-700">{selected ? 'Active focus' : 'Set as focus'}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Private ministry auto-jot</p>
                  <h2 className="mt-2 text-3xl font-light text-stone-900">Capture context while you pray, plan, teach, or serve.</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                    Active focus: <span className="font-semibold text-stone-800">{activeFocus?.title ?? eyebrow}</span>. Notes remain in this browser until you deliberately move them into another Church OS workflow.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={!voiceAvailable}
                  className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${isListening ? 'bg-rose-100 text-rose-700' : 'bg-sage-100 text-sage-700'} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                  {isListening ? 'Stop auto-jot' : voiceAvailable ? 'Voice auto-jot' : 'Voice unavailable'}
                </button>
              </div>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={`Write private ${eyebrow.toLowerCase()} notes, observations, questions, people or tasks to follow up, Scripture references, and the next faithful action…`}
                className="mt-6 min-h-52 w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-7 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-sage-400 focus:bg-white focus:ring-2 focus:ring-sage-100"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={saveWorkspace} className="inline-flex min-h-11 items-center rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white transition hover:bg-sage-700">
                  <Save className="mr-2 h-4 w-4" /> Save private draft
                </button>
                <button type="button" onClick={copySummary} className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:border-sage-300 hover:text-sage-700">
                  <Clipboard className="mr-2 h-4 w-4" /> {copied ? 'Copied' : 'Copy handoff summary'}
                </button>
                <button type="button" onClick={resetWorkspace} className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-500 transition hover:border-stone-300 hover:text-stone-700">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-stone-500">
                {savedAt ? `Saved locally ${new Date(savedAt).toLocaleString()}.` : 'Not saved yet.'} Browser storage is convenient, not a substitute for authorized pastoral records, safeguarding systems, or financial records.
              </p>
            </div>

            <aside className="rounded-[2rem] bg-stone-900 p-7 text-white shadow-xl sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-200">Trust posture</p>
              <p className="mt-4 text-lg leading-8 text-stone-100">{privacyNote}</p>
              <div className="mt-6 space-y-3">
                {safeguards.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-6 text-stone-100">{item}</div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-t border-cream-200 bg-white/70 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Connected next actions</p>
          <h2 className="mt-2 text-3xl font-light text-stone-900">Carry the work into the right Church OS surface.</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map((action) => (
              <Link key={`${action.href}-${action.label}`} href={action.href} className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sage-300 hover:shadow-md">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-stone-900">{action.label}</h3>
                  <ArrowRight className="h-4 w-4 text-sage-600 transition group-hover:translate-x-1" />
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {actions[0] && (
        <div className="fixed inset-x-0 bottom-[5.1rem] z-30 px-3 sm:hidden">
          <Link href={actions[0].href} className="mx-auto flex min-h-12 max-w-md items-center justify-center rounded-2xl bg-sage-600 px-5 text-sm font-semibold text-white shadow-2xl">
            {actions[0].label} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      )}
    </main>
  );
}
