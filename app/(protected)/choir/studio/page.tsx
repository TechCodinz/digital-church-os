'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Guitar,
    Layers,
    Loader2,
    Music,
    Play,
    ShieldCheck,
    Sparkles,
    Square,
    Users,
    Volume2,
} from 'lucide-react';
import Link from 'next/link';
import { ScriptureReference } from '@/components/scripture/ScriptureReference';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

type SongDraft = {
    title: string;
    key: string;
    tempo: string;
    generatedBy?: 'openai' | 'offline-template';
    draftStatus?: string;
    boundaryNote?: string;
    structure: { verse1?: string; chorus?: string; bridge?: string };
    choirArrangement?: { soprano?: string; alto?: string; tenor?: string; bass?: string };
    scriptureAnchors?: string[];
};

const KEY_ROOT: Record<string, number> = {
    'C Major': 60,
    'G Major': 67,
    'D Major': 62,
    'E Major': 64,
    'F# Major': 66,
};

const CHORD_LABELS = ['I', 'V', 'vi', 'IV'];

function midiToFreq(midi: number) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

function buildProgression(rootMidi: number): number[][] {
    const triad = (base: number, thirdSemitones: number) => [base, base + thirdSemitones, base + 7];
    return [triad(rootMidi, 4), triad(rootMidi + 7, 4), triad(rootMidi + 9, 3), triad(rootMidi + 5, 4)];
}

function bpmFromTempo(value: string) {
    const match = value.match(/(\d+)/);
    return match ? Number(match[1]) : 72;
}

export default function WorshipChoirStudioPage() {
    const { theme: sanctuaryTheme } = useSanctuaryTheme();
    const [theme, setTheme] = useState('Grace that forms a faithful people');
    const [key, setKey] = useState('C Major');
    const [tempo, setTempo] = useState('72 BPM (Standard)');
    const [style, setStyle] = useState('Congregational Contemporary Worship');
    const [song, setSong] = useState<SongDraft | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPlayingSynth, setIsPlayingSynth] = useState(false);
    const [activeChord, setActiveChord] = useState(-1);
    const audioContextRef = useRef<AudioContext | null>(null);
    const schedulerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isLight = sanctuaryTheme === 'light';

    const stopSynth = () => {
        if (schedulerRef.current) clearTimeout(schedulerRef.current);
        schedulerRef.current = null;
        if (audioContextRef.current) audioContextRef.current.close();
        audioContextRef.current = null;
        setIsPlayingSynth(false);
        setActiveChord(-1);
    };

    const toggleSynthPreview = () => {
        if (isPlayingSynth) {
            stopSynth();
            return;
        }

        const context = new AudioContext();
        audioContextRef.current = context;
        const progression = buildProgression(KEY_ROOT[key] ?? 60);
        const chordDurationMs = (60 / bpmFromTempo(tempo)) * 2 * 1000;
        let step = 0;

        const playChord = () => {
            if (!audioContextRef.current) return;
            const now = context.currentTime;
            const duration = chordDurationMs / 1000;
            const chord = progression[step % progression.length];

            [...chord, chord[0] + 12].forEach((midi) => {
                const oscillator = context.createOscillator();
                const gain = context.createGain();
                oscillator.type = 'triangle';
                oscillator.frequency.value = midiToFreq(midi);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.045, now + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.94);
                oscillator.connect(gain);
                gain.connect(context.destination);
                oscillator.start(now);
                oscillator.stop(now + duration);
            });

            setActiveChord(step % progression.length);
            step += 1;
            schedulerRef.current = setTimeout(playChord, chordDurationMs);
        };

        playChord();
        setIsPlayingSynth(true);
    };

    useEffect(() => {
        if (isPlayingSynth) stopSynth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, tempo]);

    useEffect(() => () => stopSynth(), []);

    const compose = async () => {
        if (!theme.trim()) return;
        setLoading(true);
        setError('');
        setSong(null);
        try {
            const response = await fetch('/api/ai/choir/compose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: theme.trim(), key, tempo, style }),
            });
            const data = await response.json();
            if (!response.ok || !data.title) throw new Error(data.error || 'Composition unavailable');
            setSong(data);
        } catch (composeError: any) {
            setError(composeError?.message || 'Unable to create a worship draft right now.');
        } finally {
            setLoading(false);
        }
    };

    const arrangements = song?.choirArrangement ? [
        ['Soprano', song.choirArrangement.soprano],
        ['Alto', song.choirArrangement.alto],
        ['Tenor', song.choirArrangement.tenor],
        ['Bass', song.choirArrangement.bass],
    ] : [];

    return (
        <div className={`sanctuary-page-shell min-h-screen pt-24 pb-24 ${isLight ? 'bg-[#f8f3eb]/92 text-stone-900' : 'bg-[#020807]/92 text-white'}`}>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] px-6 py-10 sm:px-10 sm:py-12 text-white shadow-2xl shadow-black/25">
                    <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                    <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/18 bg-violet-300/7 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-violet-200">
                                <Music className="h-3.5 w-3.5" /> Worship & choir studio
                            </div>
                            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.03]">A creative room for worship teams — not an “anointed AI” songwriter.</h1>
                            <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-400">Shape an original worship draft, hear a real chord-progression preview, explore four-part arrangement ideas, and keep Scripture references visible for human theological review.</p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <button onClick={compose} disabled={loading || !theme.trim()} className="sacred-primary-button disabled:opacity-45">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Create worship draft</button>
                                <Link href="/live-service" className="sacred-secondary-button"><Music className="h-4 w-4" /> Worship experience</Link>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                            <ShieldCheck className="h-5 w-5 text-emerald-300" />
                            <h2 className="mt-4 text-lg font-semibold">Generated draft, human ministry decision</h2>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">Every lyric, chord, and arrangement suggestion is a creative draft. It is not Scripture, revelation, prophecy, divine authorship, or approval for congregational use. Worship leaders remain responsible for theology, originality, singability, licensing, and church fit.</p>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid xl:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
                    <aside className={`rounded-[2rem] border p-5 sm:p-6 xl:sticky xl:top-24 ${isLight ? 'border-stone-200 bg-white/85' : 'border-white/8 bg-white/[0.03]'}`}>
                        <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-violet-300'}`}>Composition brief</p>
                        <div className="mt-5 space-y-4">
                            <label className="block">
                                <span className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>Theme / sermon direction</span>
                                <textarea value={theme} onChange={(event) => setTheme(event.target.value)} rows={4} className={`mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-violet-300/15 ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-black/18'}`} />
                            </label>
                            <label className="block">
                                <span className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>Musical key</span>
                                <select value={key} onChange={(event) => setKey(event.target.value)} className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-[#07110f]'}`}>
                                    {Object.keys(KEY_ROOT).map((item) => <option key={item}>{item}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>Tempo</span>
                                <select value={tempo} onChange={(event) => setTempo(event.target.value)} className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-[#07110f]'}`}>
                                    <option>68 BPM (Slow Worship)</option>
                                    <option>72 BPM (Standard)</option>
                                    <option>96 BPM (Mid-Tempo Praise)</option>
                                    <option>120 BPM (High Praise)</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>Style</span>
                                <select value={style} onChange={(event) => setStyle(event.target.value)} className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-[#07110f]'}`}>
                                    <option>Congregational Contemporary Worship</option>
                                    <option>Gospel Choir</option>
                                    <option>Hymn-Inspired</option>
                                    <option>Acoustic Prayer</option>
                                    <option>High Praise</option>
                                </select>
                            </label>
                        </div>

                        <div className={`mt-6 rounded-2xl border p-4 ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-black/16'}`}>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className={`text-xs font-semibold ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>Chord-room preview</p>
                                    <p className={`mt-1 text-[10px] ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>Real browser-generated I–V–vi–IV audio.</p>
                                </div>
                                <Volume2 className={`h-4 w-4 ${isLight ? 'text-sage-700' : 'text-violet-300'}`} />
                            </div>
                            <button onClick={toggleSynthPreview} className={`sacred-focus-ring mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl text-xs font-bold ${isPlayingSynth ? 'bg-violet-600 text-white' : isLight ? 'bg-stone-900 text-white' : 'bg-white/[0.06] text-slate-200'}`}>
                                {isPlayingSynth ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4" />} {isPlayingSynth ? 'Stop preview' : 'Play progression'}
                            </button>
                            <div className="mt-3 grid grid-cols-4 gap-2">
                                {CHORD_LABELS.map((label, index) => <span key={label} className={`rounded-xl border px-2 py-2 text-center text-[10px] font-mono ${activeChord === index ? isLight ? 'border-violet-300 bg-violet-50 text-violet-800' : 'border-violet-300/30 bg-violet-300/12 text-violet-200' : isLight ? 'border-stone-200 text-stone-400' : 'border-white/7 text-slate-700'}`}>{label}</span>)}
                            </div>
                        </div>

                        {error && <p className={`mt-5 rounded-2xl border p-3 text-xs leading-relaxed ${isLight ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-rose-300/15 bg-rose-300/[0.04] text-rose-300'}`}>{error}</p>}
                    </aside>

                    <main className="min-w-0">
                        {!song && !loading ? (
                            <div className={`rounded-[2rem] border border-dashed p-10 sm:p-14 text-center ${isLight ? 'border-stone-200 bg-white/60' : 'border-white/10 bg-white/[0.02]'}`}>
                                <Music className={`mx-auto h-8 w-8 ${isLight ? 'text-stone-300' : 'text-slate-700'}`} />
                                <h2 className={`mt-5 text-2xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>The music desk is ready for a brief.</h2>
                                <p className={`mt-3 max-w-xl mx-auto text-sm leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Nothing is pre-filled as though an AI-generated worship song already exists. Create a draft when you are ready, then review it with your real worship team.</p>
                            </div>
                        ) : loading ? (
                            <div className={`rounded-[2rem] border p-14 text-center ${isLight ? 'border-stone-200 bg-white/70' : 'border-white/8 bg-white/[0.025]'}`}>
                                <Loader2 className={`mx-auto h-7 w-7 animate-spin ${isLight ? 'text-sage-700' : 'text-violet-300'}`} />
                                <p className={`mt-4 text-xs ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>Preparing an original creative draft…</p>
                            </div>
                        ) : song ? (
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] p-6 sm:p-8 text-white">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(196,181,253,.13),transparent_32%)]" aria-hidden="true" />
                                    <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                                        <div>
                                            <p className="sanctuary-section-label text-violet-300">Creative draft</p>
                                            <h2 className="mt-3 text-3xl sm:text-4xl font-light">{song.title}</h2>
                                            <p className="mt-3 text-xs text-slate-500">{song.key} • {song.tempo} • source: {song.generatedBy === 'openai' ? 'configured model' : 'offline template'}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">{song.scriptureAnchors?.slice(0, 5).map((reference) => <ScriptureReference key={reference} reference={reference} />)}</div>
                                    </div>
                                    <div className="relative mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/12 bg-amber-300/[0.035] p-4 text-[10px] leading-relaxed text-slate-500">
                                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" /> {song.boundaryNote || 'Generated creative draft. Human ministry review required.'}
                                    </div>
                                </section>

                                <section className="grid lg:grid-cols-[1.12fr_0.88fr] gap-5">
                                    <div className={`rounded-[2rem] border p-6 sm:p-7 ${isLight ? 'border-stone-200 bg-white/85' : 'border-white/8 bg-white/[0.03]'}`}>
                                        <div className="flex items-center gap-3"><Guitar className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-amber-300'}`} /><h3 className={`text-lg font-semibold ${isLight ? 'text-stone-900' : 'text-white'}`}>Lyrics & chord chart</h3></div>
                                        <div className="mt-6 space-y-6">
                                            {[['Verse 1', song.structure?.verse1], ['Chorus', song.structure?.chorus], ['Bridge', song.structure?.bridge]].map(([label, content]) => content ? (
                                                <div key={String(label)}>
                                                    <p className={`text-[9px] font-bold uppercase tracking-[0.18em] ${isLight ? 'text-sage-700' : 'text-violet-300'}`}>{label}</p>
                                                    <pre className={`mt-2 whitespace-pre-wrap font-sans text-sm leading-7 ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>{content}</pre>
                                                </div>
                                            ) : null)}
                                        </div>
                                    </div>

                                    <div className={`rounded-[2rem] border p-6 sm:p-7 ${isLight ? 'border-stone-200 bg-white/85' : 'border-white/8 bg-white/[0.03]'}`}>
                                        <div className="flex items-center gap-3"><Layers className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-violet-300'}`} /><h3 className={`text-lg font-semibold ${isLight ? 'text-stone-900' : 'text-white'}`}>Choir arrangement notes</h3></div>
                                        <div className="mt-5 space-y-3">
                                            {arrangements.map(([voice, note]) => note ? (
                                                <div key={String(voice)} className={`rounded-2xl border p-4 ${isLight ? 'border-stone-100 bg-[#fbf8f3]' : 'border-white/7 bg-black/15'}`}>
                                                    <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>{voice}</p>
                                                    <p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{note}</p>
                                                </div>
                                            ) : null)}
                                        </div>
                                    </div>
                                </section>

                                <section className={`rounded-[2rem] border p-6 sm:p-7 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.03]'}`}>
                                    <div className="grid md:grid-cols-[1fr_auto] gap-5 items-center">
                                        <div>
                                            <div className="flex items-center gap-2"><Users className={`h-4 w-4 ${isLight ? 'text-sage-700' : 'text-emerald-300'}`} /><p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Human review handoff</p></div>
                                            <h3 className={`mt-3 text-xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Take the draft into Scripture and rehearsal.</h3>
                                            <p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Check theology, lyrical clarity, vocal range, congregational singability, originality, licensing, and cultural fit before ministry use.</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <Link href="/scripture/immersion" className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-bold ${isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950'}`}><BookOpen className="h-4 w-4" /> Open Scripture</Link>
                                            <Link href="/live-service" className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-bold ${isLight ? 'border-stone-200 text-stone-700' : 'border-white/10 text-slate-300'}`}>Worship <ArrowRight className="h-4 w-4" /></Link>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        ) : null}
                    </main>
                </section>
            </div>
        </div>
    );
}
