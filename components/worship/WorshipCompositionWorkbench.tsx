'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  BookOpenText,
  Check,
  ClipboardMusic,
  Copyright,
  Headphones,
  Music2,
  Save,
  Sparkles,
  UsersRound,
} from 'lucide-react';

type SongMode = 'hymn' | 'praise' | 'worship' | 'anthem' | 'response' | 'children';

type PartKey = 'soprano' | 'alto' | 'tenor' | 'bass';

const songModes: Array<{ id: SongMode; label: string; description: string }> = [
  { id: 'hymn', label: 'Hymn', description: 'Stanza-based congregational writing with a strong theological center.' },
  { id: 'praise', label: 'Praise', description: 'Energetic, memorable language for celebration and corporate participation.' },
  { id: 'worship', label: 'Worship', description: 'Reflective, reverent language with room for repetition and prayer.' },
  { id: 'anthem', label: 'Choir anthem', description: 'Structured choral writing with planned sections and vocal dynamics.' },
  { id: 'response', label: 'Call & response', description: 'Leader/congregation phrases designed for easy participation.' },
  { id: 'children', label: 'Children song', description: 'Simple, age-appropriate biblical language and memorable repetition.' },
];

const arrangementSections = ['Intro', 'Verse 1', 'Verse 2', 'Chorus', 'Bridge', 'Prayer break', 'Final chorus', 'Outro'];

const rightsOptions = [
  { id: 'original', label: 'Original composition', note: 'You or your church own/control the composition rights.' },
  { id: 'public-domain', label: 'Public-domain source', note: 'Verify the specific text/tune and territory before public distribution.' },
  { id: 'licensed', label: 'Licensed / permission granted', note: 'Keep license or written permission on file.' },
  { id: 'review', label: 'Rights review required', note: 'Do not distribute publicly until rights are cleared.' },
];

export function WorshipCompositionWorkbench() {
  const [mode, setMode] = useState<SongMode>('hymn');
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [scripture, setScripture] = useState('');
  const [keySignature, setKeySignature] = useState('G');
  const [tempo, setTempo] = useState(78);
  const [meter, setMeter] = useState('4/4');
  const [lyrics, setLyrics] = useState('');
  const [rights, setRights] = useState('original');
  const [sections, setSections] = useState<string[]>(['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Outro']);
  const [parts, setParts] = useState<Record<PartKey, boolean>>({ soprano: true, alto: true, tenor: true, bass: true });
  const [saved, setSaved] = useState(false);

  const readiness = useMemo(() => {
    const essentials = [title, theme, scripture, lyrics].filter((value) => value.trim()).length;
    const rightsReady = rights !== 'review' ? 1 : 0;
    return Math.round(((essentials + rightsReady) / 5) * 100);
  }, [title, theme, scripture, lyrics, rights]);

  const toggleSection = (section: string) => {
    setSections((current) => current.includes(section) ? current.filter((item) => item !== section) : [...current, section]);
  };

  const saveLocal = () => {
    try {
      window.localStorage.setItem('digital-church-worship-composition-draft', JSON.stringify({ mode, title, theme, scripture, keySignature, tempo, meter, lyrics, rights, sections, parts }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch {
      setSaved(false);
    }
  };

  return (
    <section className="mt-10 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-purple-700">
                <ClipboardMusic className="mr-2 h-4 w-4" /> Worship composition workbench
              </div>
              <h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Write hymns, praise songs, choir anthems, and rehearsal-ready worship plans with structure and accountability.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Use Scripture and a clear ministry theme first, then shape lyrics, arrangement, vocal parts, key, tempo, and rights posture. This workspace does not claim to auto-correct pitch or create mastered audio unless a real audio-processing provider is connected.</p>
            </div>
            <div className="min-w-[160px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-xs uppercase tracking-wider text-stone-400">Song readiness</p>
              <p className="mt-1 text-3xl font-light">{readiness}%</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-purple-400 transition-all" style={{ width: `${readiness}%` }} /></div>
            </div>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {songModes.map((item) => (
              <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`rounded-2xl border p-4 text-left transition ${mode === item.id ? 'border-purple-300 bg-purple-50' : 'border-stone-200 bg-stone-50 hover:border-purple-200'}`}>
                <p className="font-semibold text-stone-900">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-stone-500">{item.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Working title</span><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" placeholder="e.g. Great Is Your Mercy" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Theme</span><input value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" placeholder="Grace, resurrection, surrender..." /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Scripture foundation</span><input value={scripture} onChange={(e) => setScripture(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" placeholder="e.g. Psalm 103:1-5" /></label>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Key</span><select value={keySignature} onChange={(e) => setKeySignature(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3">{['C','D','E♭','E','F','F♯','G','A♭','A','B♭','B'].map((key) => <option key={key}>{key}</option>)}</select></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Tempo</span><div className="rounded-xl border border-stone-200 bg-white px-4 py-3"><input type="range" min={50} max={160} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className="w-full accent-purple-600" /><p className="mt-1 text-center text-xs text-stone-500">{tempo} BPM</p></div></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Meter</span><select value={meter} onChange={(e) => setMeter(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3"><option>4/4</option><option>3/4</option><option>6/8</option><option>12/8</option></select></label>
          </div>

          <label className="mt-6 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Lyrics / hymn text</span><textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} className="min-h-[240px] w-full rounded-3xl border border-stone-200 bg-stone-50 p-5 leading-7 text-stone-700 outline-none focus:ring-2 focus:ring-purple-200" placeholder="Verse 1...\n\nChorus...\n\nBridge..." /></label>

          <div className="mt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">Arrangement sections</p>
            <div className="flex flex-wrap gap-2">{arrangementSections.map((section) => { const active = sections.includes(section); return <button key={section} type="button" onClick={() => toggleSection(section)} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${active ? 'bg-purple-700 text-white' : 'border border-stone-200 bg-white text-stone-600'}`}>{active && <Check className="mr-1 inline h-3.5 w-3.5" />}{section}</button>; })}</div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-stone-200 p-5">
              <div className="flex items-center gap-2"><UsersRound className="h-5 w-5 text-purple-700" /><h3 className="font-semibold text-stone-900">SATB rehearsal parts</h3></div>
              <div className="mt-4 grid grid-cols-2 gap-2">{(['soprano','alto','tenor','bass'] as PartKey[]).map((part) => <button key={part} type="button" onClick={() => setParts((current) => ({ ...current, [part]: !current[part] }))} className={`rounded-xl border px-3 py-2 text-sm font-medium capitalize ${parts[part] ? 'border-purple-200 bg-purple-50 text-purple-800' : 'border-stone-200 text-stone-500'}`}>{parts[part] && <Check className="mr-1 inline h-3.5 w-3.5" />}{part}</button>)}</div>
            </div>

            <div className="rounded-3xl border border-stone-200 p-5">
              <div className="flex items-center gap-2"><Copyright className="h-5 w-5 text-purple-700" /><h3 className="font-semibold text-stone-900">Rights posture</h3></div>
              <select value={rights} onChange={(e) => setRights(e.target.value)} className="mt-4 w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm">{rightsOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
              <p className="mt-3 text-xs leading-5 text-stone-500">{rightsOptions.find((item) => item.id === rights)?.note}</p>
              <Link href="/media-rights" className="mt-3 inline-flex text-xs font-semibold text-purple-700">Open media rights workflow →</Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={saveLocal} className="inline-flex items-center rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-800"><Save className="mr-2 h-4 w-4" />{saved ? 'Saved privately' : 'Save composition draft'}</button>
            <Link href="/scripture" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><BookOpenText className="mr-2 h-4 w-4" /> Scripture study</Link>
            <Link href="/worship-media" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><Headphones className="mr-2 h-4 w-4" /> Worship library</Link>
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <Music2 className="h-8 w-8 text-purple-300" />
          <h3 className="mt-5 text-3xl font-light">From biblical idea to rehearsal plan.</h3>
          <div className="mt-6 space-y-3 text-sm leading-6 text-stone-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">1. Scripture.</strong> Establish the biblical theme and doctrinal center before chasing rhyme or melody.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">2. Congregation.</strong> Match vocabulary, range, repetition, and tempo to the people who will sing it.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">3. Choir.</strong> Plan sections and SATB participation, then rehearse the actual voices rather than assuming AI has corrected them.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="text-white">4. Rights.</strong> Original, public-domain, and licensed material follow different distribution rules.</div>
          </div>
          <div className="mt-7 rounded-2xl border border-purple-300/20 bg-purple-300/10 p-4 text-xs leading-5 text-purple-100"><Sparkles className="mb-2 h-4 w-4" /> AI can suggest lyric directions or arrangement ideas, but theological review, musical judgment, performer consent, and copyright clearance remain human responsibilities.</div>
        </aside>
      </div>
    </section>
  );
}
