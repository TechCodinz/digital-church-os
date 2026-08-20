'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BookOpenText,
  Check,
  Languages,
  Loader2,
  Mic,
  Square,
  NotebookPen,
  Search,
  Sparkles,
  ShieldCheck,
  Presentation,
  Church,
} from 'lucide-react';

type BibleVersion = {
  code: string;
  name: string;
  language: string;
  public_domain: boolean;
  offline_allowed: boolean;
  license_notes?: string | null;
};

type Passage = {
  id: string;
  version_code: string;
  reference: string;
  text: string;
};

const fallbackVersions: BibleVersion[] = [
  { code: 'KJV', name: 'King James Version', language: 'English', public_domain: true, offline_allowed: true },
  { code: 'WEB', name: 'World English Bible', language: 'English', public_domain: true, offline_allowed: true },
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
  const [query, setQuery] = useState('');
  const [versions, setVersions] = useState<BibleVersion[]>(fallbackVersions);
  const [selectedVersions, setSelectedVersions] = useState<string[]>(['KJV', 'WEB']);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [savedLocal, setSavedLocal] = useState(false);
  const [savingJournal, setSavingJournal] = useState(false);
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

  useEffect(() => {
    let cancelled = false;
    const loadVersions = async () => {
      try {
        const res = await fetch('/api/scripture/search', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data.versions) || !data.versions.length) return;
        setVersions(data.versions);
        const available = data.versions.map((item: BibleVersion) => item.code);
        const preferred = ['KJV', 'WEB'].filter((code) => available.includes(code));
        setSelectedVersions(preferred.length ? preferred : available.slice(0, 2));
      } catch {
        // Public-domain fallbacks keep the UI useful until provider metadata is reachable.
      } finally {
        if (!cancelled) setLoadingVersions(false);
      }
    };
    loadVersions();
    return () => { cancelled = true; };
  }, []);

  const grouped = useMemo(() => {
    return passages.reduce<Record<string, Passage[]>>((acc, passage) => {
      (acc[passage.reference] ||= []).push(passage);
      return acc;
    }, {});
  }, [passages]);

  const toggleVersion = (code: string) => {
    setSelectedVersions((current) => {
      if (current.includes(code)) return current.length === 1 ? current : current.filter((item) => item !== code);
      return current.length >= 4 ? [...current.slice(1), code] : [...current, code];
    });
  };

  const searchPassage = async () => {
    if ((!reference.trim() && !query.trim()) || !selectedVersions.length) return;
    setSearching(true);
    setStatus('');
    try {
      const res = await fetch('/api/scripture/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference.trim() || undefined,
          query: query.trim() || undefined,
          versionCodes: selectedVersions,
        }),
      });
      if (res.status === 401) {
        setPassages([]);
        setStatus('Sign in to search and compare the Bible translations enabled for your church workspace.');
        return;
      }
      const data = await res.json();
      const next = Array.isArray(data.passages) ? data.passages : [];
      setPassages(next);
      setStatus(next.length ? (data.licensingNote || '') : 'No matching licensed or public-domain passage is currently available for this search.');
    } catch {
      setStatus('Scripture search is temporarily unavailable. Your private notes still work on this device.');
    } finally {
      setSearching(false);
    }
  };

  const saveLocalNote = () => {
    try {
      window.localStorage.setItem(storageKey, note);
      setSavedLocal(true);
      window.setTimeout(() => setSavedLocal(false), 1800);
    } catch {
      setSavedLocal(false);
    }
  };

  const saveToJournal = async () => {
    if (!note.trim() && passages.length === 0) return;
    setSavingJournal(true);
    setStatus('');
    const scriptureSnapshot = passages
      .slice(0, 8)
      .map((passage) => `${passage.reference} (${passage.version_code}) — ${passage.text}`)
      .join('\n\n');
    const content = [scriptureSnapshot, note.trim() ? `My reflection:\n${note.trim()}` : ''].filter(Boolean).join('\n\n');
    try {
      const res = await fetch('/api/user/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Scripture study — ${reference || 'reflection'}`, content, mood: 'Seeking' }),
      });
      if (res.status === 401) {
        setStatus('Sign in to move this study into your private Spiritual Journal.');
      } else if (!res.ok) {
        setStatus('The journal could not save this study right now. Your local note has not been removed.');
      } else {
        saveLocalNote();
        setStatus('Saved to your private Spiritual Journal for future reference.');
      }
    } catch {
      setStatus('The journal could not save this study right now. Your local note has not been removed.');
    } finally {
      setSavingJournal(false);
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
      setStatus('Microphone access is unavailable. You can continue with written notes.');
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
            <h2 className="mt-5 text-3xl font-light leading-tight text-stone-900 md:text-4xl">Compare real enabled translations, jot what matters, and carry one truth into the day.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              Named Bible versions come only from public-domain content or configured licensed providers. AI may explain context elsewhere in the platform, but it never fabricates published translation wording here.
            </p>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Passage / reference</span>
                <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="John 3:16" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none focus:ring-2 focus:ring-sage-200" />
              </label>
              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Optional word / phrase</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="grace, peace, faith..." className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none focus:ring-2 focus:ring-sage-200" />
              </label>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Enabled translations · select up to 4</span>
                {loadingVersions && <Loader2 className="h-4 w-4 animate-spin text-sage-600" />}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {versions.map((item) => {
                  const active = selectedVersions.includes(item.code);
                  return (
                    <button key={item.code} type="button" onClick={() => toggleVersion(item.code)} title={item.license_notes || item.name} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${active ? 'border-sage-600 bg-sage-600 text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-sage-300'}`}>
                      {active && <Check className="mr-1 inline h-3 w-3" />}{item.code}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="button" onClick={searchPassage} disabled={searching || !selectedVersions.length} className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-stone-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50">
              {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}{searching ? 'Searching...' : 'Search & compare'}
            </button>
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

      <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-700">Translation comparison</p><h3 className="mt-2 text-2xl font-light text-stone-900">Available passage text</h3></div>
          <Languages className="h-6 w-6 text-sage-600" />
        </div>
        {Object.keys(grouped).length ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([passageReference, items]) => (
              <div key={passageReference}>
                <h4 className="mb-3 font-semibold text-stone-800">{passageReference}</h4>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {items.map((passage) => (
                    <article key={passage.id} className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-sage-700">{passage.version_code}</p>
                      <p className="text-sm leading-7 text-stone-700">{passage.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : <div className="py-10 text-center text-sm text-stone-400">Search a passage to load text from enabled Bible sources.</div>}
        {status && <p className="mt-4 rounded-xl bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600">{status}</p>}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-700">Auto-jot workspace</p><h3 className="mt-2 text-2xl font-light text-stone-900">What are you seeing in {reference}?</h3></div>
            <NotebookPen className="h-6 w-6 text-sage-600" />
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Context, observations, prayer, questions, application..." className="mt-5 min-h-[220px] w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-5 leading-7 text-stone-700 outline-none focus:ring-2 focus:ring-sage-200" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={saveLocalNote} className="inline-flex items-center rounded-xl bg-sage-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-700">{savedLocal ? <Check className="mr-2 h-4 w-4" /> : <NotebookPen className="mr-2 h-4 w-4" />}{savedLocal ? 'Saved privately' : 'Save on this device'}</button>
            <button onClick={saveToJournal} disabled={savingJournal} className="inline-flex items-center rounded-xl border border-sage-200 bg-sage-50 px-5 py-3 text-sm font-semibold text-sage-800 transition hover:bg-sage-100 disabled:opacity-50">{savingJournal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpenText className="mr-2 h-4 w-4" />}Save to journal</button>
            {!recording ? <button onClick={startRecording} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-sage-300"><Mic className="mr-2 h-4 w-4" /> Record voice reflection</button> : <button onClick={stopRecording} className="inline-flex items-center rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white"><Square className="mr-2 h-4 w-4" /> Stop recording</button>}
          </div>
          {voiceUrl && <audio className="mt-5 w-full" controls src={voiceUrl} />}
          <p className="mt-3 text-xs text-stone-400">Local text notes stay on this device. Journal saving is explicit. Voice reflections stay in this browser session unless you deliberately export or upload them later.</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-sage-100 bg-sage-50 p-6"><Sparkles className="h-5 w-5 text-sage-700" /><h3 className="mt-4 text-xl font-semibold text-stone-900">Daily alignment</h3><p className="mt-2 text-sm leading-6 text-stone-600">Read → observe → pray → choose one faithful action → revisit tonight. Keep the rhythm simple enough to repeat.</p><Link href="/journey" className="mt-5 inline-flex text-sm font-semibold text-sage-700">Continue spiritual journey →</Link></div>
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6"><Presentation className="h-5 w-5 text-blue-700" /><h3 className="mt-4 text-xl font-semibold text-stone-900">Teaching & projection</h3><p className="mt-2 text-sm leading-6 text-stone-600">Move references into sermon preparation or the presentation system without copying unlicensed translation text.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/sermons" className="text-sm font-semibold text-blue-700">Sermon studio →</Link><Link href="/presentation" className="text-sm font-semibold text-blue-700">Presentation →</Link></div></div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6"><ShieldCheck className="h-5 w-5 text-stone-700" /><h3 className="mt-4 text-xl font-semibold text-stone-900">Church alignment</h3><p className="mt-2 text-sm leading-6 text-stone-600">For doctrinal questions or interpretation that affects teaching, use accountable church leadership rather than treating AI output as authority.</p><Link href="/church-network" className="mt-5 inline-flex items-center text-sm font-semibold text-stone-700"><Church className="mr-2 h-4 w-4" /> Find church connection</Link></div>
        </div>
      </section>
    </div>
  );
}
