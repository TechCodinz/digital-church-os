'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  BookOpenText,
  Check,
  Copyright,
  Mic2,
  Music2,
  Presentation,
  Radio,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

type SongForm = 'hymn' | 'gospel' | 'contemporary' | 'psalm' | 'call-response';
type RightsPosture = 'original' | 'public-domain' | 'licensed' | 'provider-cleared';

const sections = ['Verse 1', 'Chorus / refrain', 'Verse 2', 'Bridge / response', 'Doxology / ending'];

export function WorshipCreationCommandDeck() {
  const [theme, setTheme] = useState('');
  const [scripture, setScripture] = useState('');
  const [form, setForm] = useState<SongForm>('hymn');
  const [keySignature, setKeySignature] = useState('G');
  const [tempo, setTempo] = useState('72');
  const [range, setRange] = useState('Congregational');
  const [choirMode, setChoirMode] = useState('SATB');
  const [rights, setRights] = useState<RightsPosture>('original');
  const [draft, setDraft] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const readiness = useMemo(() => {
    const essentials = [theme, scripture, draft].filter((value) => value.trim()).length;
    return Math.round(((essentials + completed.length) / (3 + sections.length)) * 100);
  }, [theme, scripture, draft, completed.length]);

  const toggle = (section: string) => setCompleted((current) => current.includes(section) ? current.filter((item) => item !== section) : [...current, section]);

  const saveLocal = () => {
    try {
      window.localStorage.setItem('digital-church-worship-composition-draft', JSON.stringify({ theme, scripture, form, keySignature, tempo, range, choirMode, rights, draft, completed }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch {
      setSaved(false);
    }
  };

  return (
    <section className="mb-10 overflow-hidden rounded-[2rem] border border-purple-100 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-purple-700">
                <Music2 className="mr-2 h-4 w-4" /> Worship composition studio
              </div>
              <h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Write original hymns and worship songs with Scripture, singability, choir structure, and rights posture visible from the start.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Use this as the composition desk around the existing recording and AI-lyrics tools. AI drafts should be reviewed for theology, originality, musical usefulness, and licensing before service or publication.</p>
            </div>
            <div className="min-w-[150px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Draft readiness</p>
              <p className="mt-1 text-3xl font-light">{readiness}%</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-purple-400" style={{ width: `${readiness}%` }} /></div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Theme / testimony</span><input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Grace, resurrection, surrender..." className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Scripture anchor</span><input value={scripture} onChange={(e) => setScripture(e.target.value)} placeholder="Reference only, e.g. Psalm 103" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Song form</span><select value={form} onChange={(e) => setForm(e.target.value as SongForm)} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"><option value="hymn">Hymn</option><option value="gospel">Gospel</option><option value="contemporary">Contemporary worship</option><option value="psalm">Psalm setting</option><option value="call-response">Call & response</option></select></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Key</span><select value={keySignature} onChange={(e) => setKeySignature(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3">{['C','D','E♭','E','F','G','A♭','A'].map((key) => <option key={key}>{key}</option>)}</select></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Tempo BPM</span><input type="number" min="40" max="180" value={tempo} onChange={(e) => setTempo(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Choir arrangement</span><select value={choirMode} onChange={(e) => setChoirMode(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"><option>SATB</option><option>Unison</option><option>SAB</option><option>Children</option><option>Youth ensemble</option><option>Solo + choir</option></select></label>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Song architecture</p>
              <div className="space-y-2">{sections.map((section) => { const done = completed.includes(section); return <button key={section} type="button" onClick={() => toggle(section)} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm ${done ? 'border-purple-200 bg-purple-50 text-purple-800' : 'border-stone-200 bg-white text-stone-700'}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full ${done ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-500'}`}>{done ? <Check className="h-3.5 w-3.5" /> : '•'}</span>{section}</button>; })}</div>
            </div>
            <label><span className="mb-3 block text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Original lyric / arrangement draft</span><textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-[260px] w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-5 leading-7 outline-none focus:ring-2 focus:ring-purple-200" placeholder="Write original lyrics, arrangement cues, harmonies, dynamics, congregation responses..." /><p className="mt-2 text-xs text-stone-400">Do not paste copyrighted song lyrics unless your church has the rights needed for this use.</p></label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={saveLocal} className="inline-flex items-center rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700">{saved ? <Check className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}{saved ? 'Draft saved locally' : 'Save composition draft'}</button>
            <Link href="/worship-media" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><Music2 className="mr-2 h-4 w-4" /> Worship media</Link>
            <Link href="/presentation" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><Presentation className="mr-2 h-4 w-4" /> Lyric projection</Link>
            <Link href="/live-service" className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700"><Radio className="mr-2 h-4 w-4" /> Service flow</Link>
          </div>
        </div>

        <aside className="bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
          <Copyright className="h-8 w-8 text-purple-300" />
          <h3 className="mt-5 text-2xl font-light">Rights, theology, and service-use gate.</h3>
          <p className="mt-3 text-sm leading-6 text-stone-300">Choose the rights posture before a song moves from private draft to rehearsal, broadcast, upload, or public distribution.</p>
          <div className="mt-6 space-y-2">{[
            ['original', 'Original work', 'Created by your team; still review originality and contributors.'],
            ['public-domain', 'Public domain', 'Verify status in the countries where you distribute or perform.'],
            ['licensed', 'Licensed', 'Keep the relevant church/music license and permitted use on record.'],
            ['provider-cleared', 'Provider-cleared', 'Use through a provider whose terms cover your intended use.'],
          ].map(([id, label, body]) => <button key={id} type="button" onClick={() => setRights(id as RightsPosture)} className={`w-full rounded-2xl border p-4 text-left transition ${rights === id ? 'border-purple-300/50 bg-purple-300/10' : 'border-white/10 bg-white/5'}`}><p className="font-semibold text-white">{label}</p><p className="mt-1 text-xs leading-5 text-stone-400">{body}</p></button>)}</div>
          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100"><ShieldCheck className="mb-2 h-4 w-4" /> AI-generated lyrics are drafts, not proof of originality or theological accuracy. Worship leaders should review before rehearsal or publication.</div>
          <Link href="/media-rights" className="mt-6 inline-flex text-sm font-semibold text-purple-300">Open media-rights workflow →</Link>
          <div className="mt-7 grid grid-cols-2 gap-3 text-center text-xs text-stone-400"><div className="rounded-2xl border border-white/10 p-4"><Mic2 className="mx-auto h-5 w-5 text-purple-300" /><p className="mt-2">Voice rehearsal</p></div><div className="rounded-2xl border border-white/10 p-4"><UsersRound className="mx-auto h-5 w-5 text-purple-300" /><p className="mt-2">Choir review</p></div></div>
          <Link href="/scripture" className="mt-6 inline-flex items-center text-sm font-semibold text-sage-300"><BookOpenText className="mr-2 h-4 w-4" /> Verify Scripture anchor</Link>
        </aside>
      </div>
    </section>
  );
}
