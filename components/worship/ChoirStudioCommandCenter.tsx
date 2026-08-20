'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpenText,
  Check,
  CircleStop,
  Copyright,
  Download,
  Gauge,
  Headphones,
  Loader2,
  Mic2,
  Music2,
  Pause,
  Play,
  Save,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Volume2,
} from 'lucide-react';

type SongType = 'hymn' | 'gospel' | 'praise' | 'worship' | 'psalm' | 'anthem' | 'children';
type VoicePart = 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Lead' | 'Unison';
type RightsPosture = 'original' | 'public-domain' | 'licensed' | 'review';

type Take = {
  id: string;
  name: string;
  part: VoicePart;
  url: string;
  duration: number;
};

const songTypes: Array<{ id: SongType; label: string; note: string }> = [
  { id: 'hymn', label: 'Hymn', note: 'Stanza-led, congregational, theology-forward.' },
  { id: 'gospel', label: 'Gospel', note: 'Strong lead, choir response, testimony, movement.' },
  { id: 'praise', label: 'Praise', note: 'Energetic, memorable, highly participatory.' },
  { id: 'worship', label: 'Worship', note: 'Reflective, prayerful, spacious arrangement.' },
  { id: 'psalm', label: 'Psalm setting', note: 'Build from a biblical psalm or paraphrase posture.' },
  { id: 'anthem', label: 'Choir anthem', note: 'Planned sections, dynamics, harmony, and climax.' },
  { id: 'children', label: 'Children', note: 'Simple range, memorable biblical language, clear repetition.' },
];

const voiceParts: VoicePart[] = ['Soprano', 'Alto', 'Tenor', 'Bass', 'Lead', 'Unison'];
const sections = ['Intro', 'Verse 1', 'Verse 2', 'Pre-chorus', 'Chorus', 'Bridge', 'Call & response', 'Prayer break', 'Final chorus', 'Doxology', 'Outro'];
const languages = ['English', 'Igbo', 'Yoruba', 'Hausa', 'French', 'Spanish', 'Swahili', 'Portuguese', 'Other'];
const keyFrequencies: Record<string, number> = {
  C: 261.63,
  'C♯': 277.18,
  D: 293.66,
  'E♭': 311.13,
  E: 329.63,
  F: 349.23,
  'F♯': 369.99,
  G: 392,
  'A♭': 415.3,
  A: 440,
  'B♭': 466.16,
  B: 493.88,
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

export function ChoirStudioCommandCenter() {
  const [songType, setSongType] = useState<SongType>('hymn');
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [scripture, setScripture] = useState('');
  const [language, setLanguage] = useState('English');
  const [keySignature, setKeySignature] = useState('G');
  const [tempo, setTempo] = useState(78);
  const [meter, setMeter] = useState('4/4');
  const [arrangement, setArrangement] = useState<string[]>(['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Outro']);
  const [parts, setParts] = useState<VoicePart[]>(['Soprano', 'Alto', 'Tenor', 'Bass']);
  const [activePart, setActivePart] = useState<VoicePart>('Soprano');
  const [rights, setRights] = useState<RightsPosture>('original');
  const [lyrics, setLyrics] = useState('');
  const [rehearsalNotes, setRehearsalNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [saved, setSaved] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [takes, setTakes] = useState<Take[]>([]);
  const [takeName, setTakeName] = useState('Rehearsal take');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [metronomeOn, setMetronomeOn] = useState(false);
  const metronomeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const readiness = useMemo(() => {
    const essentials = [title, theme, scripture, lyrics].filter((item) => item.trim()).length;
    const rightsReady = rights === 'review' ? 0 : 1;
    const arrangementReady = arrangement.length >= 3 ? 1 : 0;
    const partReady = parts.length ? 1 : 0;
    return Math.round(((essentials + rightsReady + arrangementReady + partReady) / 7) * 100);
  }, [title, theme, scripture, lyrics, rights, arrangement.length, parts.length]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('digital-church-choir-studio-project');
      if (!raw) return;
      const data = JSON.parse(raw);
      setSongType(data.songType || 'hymn');
      setTitle(data.title || '');
      setTheme(data.theme || '');
      setScripture(data.scripture || '');
      setLanguage(data.language || 'English');
      setKeySignature(data.keySignature || 'G');
      setTempo(Number(data.tempo) || 78);
      setMeter(data.meter || '4/4');
      setArrangement(Array.isArray(data.arrangement) ? data.arrangement : ['Intro', 'Verse 1', 'Chorus', 'Outro']);
      setParts(Array.isArray(data.parts) ? data.parts : ['Soprano', 'Alto', 'Tenor', 'Bass']);
      setRights(data.rights || 'original');
      setLyrics(data.lyrics || '');
      setRehearsalNotes(data.rehearsalNotes || '');
    } catch {
      // Optional local project recovery.
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (metronomeRef.current) clearInterval(metronomeRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close().catch(() => undefined);
    };
  }, []);

  const toggleSection = (section: string) => {
    setArrangement((current) => current.includes(section) ? current.filter((item) => item !== section) : [...current, section]);
  };

  const togglePart = (part: VoicePart) => {
    setParts((current) => current.includes(part) ? current.filter((item) => item !== part) : [...current, part]);
  };

  const saveProject = () => {
    try {
      window.localStorage.setItem('digital-church-choir-studio-project', JSON.stringify({ songType, title, theme, scripture, language, keySignature, tempo, meter, arrangement, parts, rights, lyrics, rehearsalNotes, updatedAt: new Date().toISOString() }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch {
      setSaved(false);
    }
  };

  const generateLyrics = async () => {
    if (!theme.trim() || !scripture.trim()) {
      setStatus('Add a worship theme and Scripture foundation before generating a lyric draft.');
      return;
    }
    setGenerating(true);
    setStatus('');
    try {
      const res = await fetch('/api/ai/christian/worship/choir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          style: songType,
          scriptureRefs: scripture.split(',').map((item) => item.trim()).filter(Boolean),
          language,
          key: keySignature,
          tempo,
          meter,
          structure: arrangement,
          choirParts: parts,
          type: 'lyrics',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data?.error || 'Lyric drafting is unavailable right now.');
        return;
      }
      const candidate = data?.lyrics ?? data?.content ?? data?.text ?? data?.song?.lyrics ?? data?.data?.lyrics;
      if (typeof candidate === 'string') setLyrics(candidate);
      else if (candidate) setLyrics(JSON.stringify(candidate, null, 2));
      else setStatus('The worship service responded, but no lyric text was returned.');
    } catch {
      setStatus('Lyric drafting is unavailable right now. You can continue writing manually.');
    } finally {
      setGenerating(false);
    }
  };

  const startRecording = async () => {
    setStatus('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setTakes((current) => [...current, {
          id: `${Date.now()}`,
          name: takeName.trim() || 'Rehearsal take',
          part: activePart,
          url,
          duration: recordingSeconds,
        }]);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      recorder.start(200);
      recorderRef.current = recorder;
      setRecordingSeconds(0);
      setIsRecording(true);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((value) => value + 1), 1000);
    } catch (error: any) {
      setStatus(error?.name === 'NotAllowedError' ? 'Microphone access was denied. Allow microphone permission to record choir takes.' : 'Microphone recording is unavailable in this browser.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;
    setIsRecording(false);
  };

  const playClick = () => {
    try {
      const context = audioContextRef.current || new AudioContext();
      audioContextRef.current = context;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 1200;
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.05);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.06);
    } catch {
      setStatus('Audio tools are unavailable in this browser.');
    }
  };

  const startMetronome = () => {
    playClick();
    if (metronomeRef.current) clearInterval(metronomeRef.current);
    metronomeRef.current = setInterval(playClick, Math.round(60000 / Math.max(40, tempo)));
    setMetronomeOn(true);
  };

  const stopMetronome = () => {
    if (metronomeRef.current) clearInterval(metronomeRef.current);
    metronomeRef.current = null;
    setMetronomeOn(false);
  };

  const playReferenceTone = () => {
    try {
      const context = audioContextRef.current || new AudioContext();
      audioContextRef.current = context;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = keyFrequencies[keySignature] || 392;
      gain.gain.setValueAtTime(0.12, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.3);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 1.35);
    } catch {
      setStatus('Reference tone is unavailable in this browser.');
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.12fr_0.88fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-purple-700"><Music2 className="mr-2 h-4 w-4" /> Advanced choir studio</div>
              <h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Write, arrange, rehearse, record parts, and shape original hymns and worship music from one studio.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Build from Scripture and ministry purpose, then plan structure, key, tempo, meter, vocal parts, rights posture, lyric drafts, rehearsal notes, metronome timing, reference pitch, and real browser-recorded rehearsal takes.</p>
            </div>
            <div className="min-w-[170px] rounded-2xl bg-stone-950 p-4 text-white"><p className="text-xs uppercase tracking-wider text-stone-400">Project readiness</p><p className="mt-1 text-3xl font-light">{readiness}%</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-purple-400" style={{ width: `${readiness}%` }} /></div></div>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {songTypes.map((item) => <button key={item.id} type="button" onClick={() => setSongType(item.id)} className={`rounded-2xl border p-4 text-left transition ${songType === item.id ? 'border-purple-300 bg-purple-50' : 'border-stone-200 bg-stone-50 hover:border-purple-200'}`}><p className="font-semibold text-stone-900">{item.label}</p><p className="mt-1 text-xs leading-5 text-stone-500">{item.note}</p></button>)}
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Song title</span><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" placeholder="Working title" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Theme</span><input value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" placeholder="Grace, holiness, hope, mission..." /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Scripture foundation</span><input value={scripture} onChange={(e) => setScripture(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" placeholder="e.g. Psalm 103:1-5, Romans 8:31-39" /></label>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Language</span><select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm">{languages.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Key</span><select value={keySignature} onChange={(e) => setKeySignature(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm">{Object.keys(keyFrequencies).map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Tempo</span><div className="rounded-xl border border-stone-200 bg-white px-4 py-2"><input type="range" min={45} max={180} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className="w-full accent-purple-600" /><p className="text-center text-xs text-stone-500">{tempo} BPM</p></div></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Meter</span><select value={meter} onChange={(e) => setMeter(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm"><option>4/4</option><option>3/4</option><option>6/8</option><option>12/8</option><option>2/4</option></select></label>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Arrangement sections</p>
              <div className="flex flex-wrap gap-2">{sections.map((section) => { const active = arrangement.includes(section); return <button key={section} type="button" onClick={() => toggleSection(section)} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${active ? 'bg-purple-700 text-white' : 'border border-stone-200 bg-white text-stone-600'}`}>{active && <Check className="mr-1 inline h-3 w-3" />}{section}</button>; })}</div>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Vocal parts</p>
              <div className="flex flex-wrap gap-2">{voiceParts.map((part) => { const active = parts.includes(part); return <button key={part} type="button" onClick={() => togglePart(part)} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${active ? 'bg-sage-700 text-white' : 'border border-stone-200 bg-white text-stone-600'}`}>{active && <Check className="mr-1 inline h-3 w-3" />}{part}</button>; })}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Lyrics / hymn text</span><textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} className="min-h-[260px] w-full rounded-3xl border border-stone-200 bg-stone-50 p-5 font-mono text-sm leading-7 outline-none focus:ring-2 focus:ring-purple-200" placeholder="Verse 1...\n\nChorus...\n\nVerse 2...\n\nBridge..." /></label>
            <div className="grid gap-3 lg:w-[220px]">
              <button type="button" onClick={generateLyrics} disabled={generating} className="inline-flex items-center justify-center rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50">{generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}{generating ? 'Drafting…' : 'AI lyric draft'}</button>
              <button type="button" onClick={saveProject} className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700">{saved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{saved ? 'Saved' : 'Save project'}</button>
            </div>
          </div>
          {status && <p className="mt-3 rounded-xl bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600">{status}</p>}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Rights posture</span><select value={rights} onChange={(e) => setRights(e.target.value as RightsPosture)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm"><option value="original">Original composition</option><option value="public-domain">Public-domain source · verify territory/text/tune</option><option value="licensed">Licensed / permission on file</option><option value="review">Rights review required before distribution</option></select></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Rehearsal notes</span><textarea value={rehearsalNotes} onChange={(e) => setRehearsalNotes(e.target.value)} className="min-h-[90px] w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm outline-none focus:ring-2 focus:ring-purple-200" placeholder="Dynamics, entrances, pronunciation, lead cues, prayerful intent..." /></label>
          </div>
        </div>

        <aside className="border-t border-stone-200 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">Rehearsal lab</p><h3 className="mt-2 text-2xl font-light">Record real choir takes and rehearse timing.</h3></div>
            <Mic2 className="h-8 w-8 text-purple-300" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Reference pitch</p>
              <p className="mt-2 text-xl font-semibold">{keySignature}</p>
              <button type="button" onClick={playReferenceTone} className="mt-3 inline-flex items-center text-xs font-semibold text-sage-300"><Volume2 className="mr-1.5 h-4 w-4" /> Play tone</button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Metronome</p>
              <p className="mt-2 text-xl font-semibold">{tempo} BPM · {meter}</p>
              {!metronomeOn ? <button type="button" onClick={startMetronome} className="mt-3 inline-flex items-center text-xs font-semibold text-amber-300"><Play className="mr-1.5 h-4 w-4" /> Start click</button> : <button type="button" onClick={stopMetronome} className="mt-3 inline-flex items-center text-xs font-semibold text-rose-300"><Pause className="mr-1.5 h-4 w-4" /> Stop click</button>}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Take name</span><input value={takeName} onChange={(e) => setTakeName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none" /></label>
              <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Voice part</span><select value={activePart} onChange={(e) => setActivePart(e.target.value as VoicePart)} className="w-full rounded-xl border border-white/10 bg-stone-900 px-3 py-2.5 text-sm">{voiceParts.map((part) => <option key={part}>{part}</option>)}</select></label>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
              <div><p className="text-xs uppercase tracking-wider text-stone-500">Recording</p><p className="mt-1 font-mono text-2xl">{formatTime(recordingSeconds)}</p></div>
              {!isRecording ? <button type="button" onClick={startRecording} className="inline-flex items-center rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white"><Mic2 className="mr-2 h-4 w-4" /> Record take</button> : <button type="button" onClick={stopRecording} className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-900"><CircleStop className="mr-2 h-4 w-4" /> Stop</button>}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-stone-400">Session takes</p><span className="text-xs text-stone-500">{takes.length}</span></div>
            <div className="mt-3 max-h-[300px] space-y-3 overflow-y-auto">
              {takes.map((take) => <div key={take.id} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-white">{take.name}</p><p className="mt-1 text-xs text-stone-400">{take.part} · {formatTime(take.duration)}</p></div><a href={take.url} download={`${take.name.replace(/\s+/g, '-').toLowerCase()}.webm`} className="rounded-lg border border-white/10 p-2 text-stone-300" aria-label={`Download ${take.name}`}><Download className="h-4 w-4" /></a></div><audio controls src={take.url} className="mt-3 w-full" /></div>)}
              {!takes.length && <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs leading-5 text-stone-500">Record Soprano, Alto, Tenor, Bass, Lead, or Unison rehearsal takes. Audio remains in this browser session unless you intentionally download it.</div>}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-purple-300/20 bg-purple-300/10 p-4 text-xs leading-5 text-purple-100"><Gauge className="mb-2 h-5 w-5" /> Metronome and reference tone are real browser audio tools. This studio does not claim pitch correction, time alignment, stem separation, mastering, or notation engraving until dedicated audio providers are connected.</div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100"><Copyright className="mb-2 h-5 w-5" /> AI lyric drafts must be reviewed for theology, originality, rights, congregational singability, and cultural/language quality before release.</div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link href="/scripture" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-sage-200"><BookOpenText className="mr-2 h-4 w-4" /> Verify Scripture foundation</Link>
            <Link href="/worship-media" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-purple-200"><Headphones className="mr-2 h-4 w-4" /> Worship media & rights</Link>
            <Link href="/presentation" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-stone-200"><UsersRound className="mr-2 h-4 w-4" /> Prepare service lyrics/slides</Link>
          </div>

          <div className="mt-6 flex gap-3 rounded-2xl border border-sage-300/20 bg-sage-300/10 p-4 text-xs leading-5 text-sage-100"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Keep worship creation Scripture-aware, pastor/leader-reviewed, rights-cleared, and honest about what the technology actually processes.</div>
        </aside>
      </div>
    </section>
  );
}
