'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  Check,
  ClipboardCopy,
  Download,
  FileMusic,
  Music2,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

type RightsPosture = 'original' | 'public-domain' | 'licensed';

const sections = ['Verse 1', 'Chorus', 'Verse 2', 'Bridge', 'Final Chorus'];
const voiceParts = ['Soprano', 'Alto', 'Tenor', 'Bass'];

function storageKey() {
  return `digital-church-original-hymn:${new Date().toISOString().slice(0, 10)}`;
}

export function OriginalHymnStudio() {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('Praise and thanksgiving');
  const [scripture, setScripture] = useState('');
  const [keySignature, setKeySignature] = useState('C');
  const [tempo, setTempo] = useState('72');
  const [meter, setMeter] = useState('4/4');
  const [rights, setRights] = useState<RightsPosture>('original');
  const [lyrics, setLyrics] = useState<Record<string, string>>(() => Object.fromEntries(sections.map((section) => [section, ''])));
  const [rehearsalNotes, setRehearsalNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const completedSections = useMemo(() => sections.filter((section) => lyrics[section]?.trim()).length, [lyrics]);
  const readiness = Math.round(((completedSections + (title ? 1 : 0) + (scripture ? 1 : 0) + (rehearsalNotes ? 1 : 0)) / (sections.length + 3)) * 100);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey());
      if (!raw) return;
      const state = JSON.parse(raw);
      setTitle(state.title || '');
      setTheme(state.theme || 'Praise and thanksgiving');
      setScripture(state.scripture || '');
      setKeySignature(state.keySignature || 'C');
      setTempo(state.tempo || '72');
      setMeter(state.meter || '4/4');
      setRights(state.rights || 'original');
      setLyrics({ ...Object.fromEntries(sections.map((section) => [section, ''])), ...(state.lyrics || {}) });
      setRehearsalNotes(state.rehearsalNotes || '');
    } catch {
      // Local draft persistence is optional.
    }
  }, []);

  const persist = () => {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify({ title, theme, scripture, keySignature, tempo, meter, rights, lyrics, rehearsalNotes }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1400);
    } catch {
      setSaved(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (title || scripture || Object.values(lyrics).some(Boolean) || rehearsalNotes) persist();
    }, 800);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, theme, scripture, keySignature, tempo, meter, rights, lyrics, rehearsalNotes]);

  const lyricSheet = () => [
    title || 'Untitled worship song',
    scripture ? `Scripture foundation: ${scripture}` : '',
    `Theme: ${theme}`,
    `Key: ${keySignature} | Tempo: ${tempo} BPM | Meter: ${meter}`,
    `Rights posture: ${rights}`,
    '',
    ...sections.flatMap((section) => [section.toUpperCase(), lyrics[section] || '[draft not written]', '']),
    'REHEARSAL NOTES',
    rehearsalNotes || '[none]',
    '',
    'Created in Digital Church OS. Theology, originality, licensing and public-use permissions require human review.',
  ].filter(Boolean).join('\n');

  const copySheet = async () => {
    try { await navigator.clipboard.writeText(lyricSheet()); } catch { /* clipboard is optional */ }
  };

  const exportSheet = () => {
    const blob = new Blob([lyricSheet()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${(title || 'original-hymn').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-purple-100 bg-white shadow-sm">
      <div className="grid xl:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-purple-700">
                <FileMusic className="mr-2 h-4 w-4" /> Original hymn & worship studio
              </div>
              <h2 className="mt-4 max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">Write original songs, shape choir parts, and prepare worship for real people—not just generate lyrics.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">Build from Scripture and theme, organize lyrical sections, choose musical direction, prepare SATB rehearsal notes, and keep rights posture visible from the first draft.</p>
            </div>
            <div className="min-w-[150px] rounded-2xl bg-stone-950 p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Draft readiness</p>
              <p className="mt-1 text-3xl font-light">{readiness}%</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-purple-400" style={{ width: `${readiness}%` }} /></div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="xl:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Song / hymn title</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Working title" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Key</span><select value={keySignature} onChange={(e) => setKeySignature(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3">{['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'].map((key) => <option key={key}>{key}</option>)}</select></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Tempo</span><input value={tempo} onChange={(e) => setTempo(e.target.value)} inputMode="numeric" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3" /></label>
            <label className="xl:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Scripture foundation</span><input value={scripture} onChange={(e) => setScripture(e.target.value)} placeholder="e.g. Psalm 103:1–5" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Meter</span><select value={meter} onChange={(e) => setMeter(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3">{['4/4','3/4','6/8','12/8'].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Rights posture</span><select value={rights} onChange={(e) => setRights(e.target.value as RightsPosture)} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"><option value="original">Original composition</option><option value="public-domain">Public-domain source</option><option value="licensed">Licensed adaptation</option></select></label>
          </div>

          <label className="mt-4 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Worship theme</span><input value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3" /></label>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <label key={section} className={section === 'Final Chorus' ? 'md:col-span-2' : ''}>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">{section}</span>
                <textarea value={lyrics[section]} onChange={(e) => setLyrics((current) => ({ ...current, [section]: e.target.value }))} placeholder={`Write ${section.toLowerCase()} lyrics…`} className="min-h-[130px] w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-purple-200" />
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={copySheet} className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700"><ClipboardCopy className="mr-2 h-4 w-4" /> Copy lyric sheet</button>
            <button onClick={exportSheet} className="inline-flex items-center rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white"><Download className="mr-2 h-4 w-4" /> Export rehearsal sheet</button>
            {saved && <span className="inline-flex items-center px-2 text-xs font-semibold text-sage-700"><Check className="mr-1 h-4 w-4" /> Saved locally</span>}
          </div>
        </div>

        <aside className="border-t border-purple-100 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          <Sparkles className="h-7 w-7 text-purple-300" />
          <h3 className="mt-5 text-2xl font-light">From draft to congregational worship.</h3>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><BookOpenText className="h-4 w-4 text-purple-300" /><p className="mt-2 text-sm font-semibold">Scripture & theology review</p><p className="mt-1 text-xs leading-5 text-stone-400">Check biblical context and congregational suitability before public use.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><UsersRound className="h-4 w-4 text-purple-300" /><p className="mt-2 text-sm font-semibold">SATB rehearsal planning</p><div className="mt-3 flex flex-wrap gap-2">{voiceParts.map((part) => <span key={part} className="rounded-full bg-white/10 px-3 py-1 text-xs text-stone-300">{part}</span>)}</div></div>
            <label className="block rounded-2xl border border-white/10 bg-white/5 p-4"><span className="flex items-center text-sm font-semibold"><Music2 className="mr-2 h-4 w-4 text-purple-300" /> Rehearsal & arrangement notes</span><textarea value={rehearsalNotes} onChange={(e) => setRehearsalNotes(e.target.value)} placeholder="Entrances, harmony, dynamics, solos, band cues, key changes…" className="mt-3 min-h-[150px] w-full resize-y rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white outline-none focus:ring-2 focus:ring-purple-400" /></label>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100">
            <ShieldCheck className="mb-2 h-4 w-4" />
            Do not publish or distribute copyrighted lyrics, recordings, arrangements, or backing tracks unless the church has the required permission/license. AI-generated lyrics should also be reviewed for originality and theology.
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-purple-300">
            <Link href="/scripture">Scripture desk →</Link>
            <Link href="/worship-media">Worship media →</Link>
            <Link href="/media-rights">Media rights →</Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
