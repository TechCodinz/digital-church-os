'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Sparkles, Volume2, Play, Square, RefreshCw, BookOpen, Layers, Guitar } from 'lucide-react';
import { ScriptureReference } from '@/components/scripture/ScriptureReference';

export default function WorshipChoirStudioPage() {
    const [theme, setTheme] = useState('Unshakeable Grace & Peace');
    const [key, setKey] = useState('C Major');
    const [tempo, setTempo] = useState('72 BPM');
    const [loading, setLoading] = useState(false);
    const [isPlayingSynth, setIsPlayingSynth] = useState(false);
    const [activeChord, setActiveChord] = useState(-1);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const schedulerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [song, setSong] = useState<any>({
        title: 'Anchor of My Soul (Unshakeable Grace)',
        key: 'C Major',
        tempo: '72 BPM',
        structure: {
            verse1: '[C] In the stillness of the morning, [G] I lift my eyes to You\n[Am] Your unshakeable promise [F] makes all things new.',
            chorus: '[C] You are my fortress, [G] You are my strength\n[Am] Your love endures [F] through every age.',
            bridge: '[F] High above the storm, [G] Your name exalted\n[Am] Jesus the Savior, [Em] Faithful and True.'
        },
        choirArrangement: {
            soprano: 'Melody lead ascending to High G on the final chorus bridge.',
            alto: 'Warm inner harmony supporting 3rd intervals in the chorus.',
            tenor: 'Counter-melody call and response on "Faithful and True".',
            bass: 'Root note grounding foundation with rhythmic syncopation.'
        },
        scriptureAnchors: ['Hebrews 6:19', 'Psalm 46:1', 'Isaiah 40:31']
    });

    const handleCompose = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/choir/compose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme, key, tempo })
            });
            const data = await res.json();
            if (data.title) setSong(data);
        } catch (err) {
            console.error('Compose error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Root-note semitone offset from C for each supported key.
    const KEY_ROOT: Record<string, number> = {
        'C Major': 60, 'G Major': 67, 'D Major': 62, 'E Major': 64, 'F# Major': 66,
    };
    const CHORD_LABELS = ['I', 'V', 'vi', 'IV'];

    const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

    // I – V – vi – IV progression built from the selected key's root.
    const buildProgression = (rootMidi: number): number[][] => {
        const triad = (base: number, thirdSemis: number) => [base, base + thirdSemis, base + 7];
        return [
            triad(rootMidi, 4),        // I  (major)
            triad(rootMidi + 7, 4),    // V  (major)
            triad(rootMidi + 9, 3),    // vi (minor)
            triad(rootMidi + 5, 4),    // IV (major)
        ];
    };

    const bpmFromTempo = (t: string) => {
        const m = t.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 72;
    };

    const stopSynth = () => {
        if (schedulerRef.current) { clearTimeout(schedulerRef.current); schedulerRef.current = null; }
        if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
        setIsPlayingSynth(false);
        setActiveChord(-1);
    };

    const toggleSynthPreview = () => {
        if (isPlayingSynth) {
            stopSynth();
            return;
        }
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        const rootMidi = KEY_ROOT[key] ?? 60;
        const progression = buildProgression(rootMidi);
        const bpm = bpmFromTempo(tempo);
        const chordDurMs = (60 / bpm) * 2 * 1000; // two beats per chord

        let step = 0;
        const playChord = () => {
            if (!audioCtxRef.current) return;
            const now = ctx.currentTime;
            const durSec = chordDurMs / 1000;
            const chord = progression[step % progression.length];
            // Add a soft octave-up voice on the root for shimmer.
            [...chord, chord[0] + 12].forEach((midi) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = midiToFreq(midi);
                // Gentle attack/release envelope
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.05, now + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec * 0.95);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + durSec);
            });
            setActiveChord(step % progression.length);
            step += 1;
            schedulerRef.current = setTimeout(playChord, chordDurMs);
        };

        playChord();
        setIsPlayingSynth(true);
    };

    // Restart the progression if key/tempo changes mid-playback.
    useEffect(() => {
        if (isPlayingSynth) {
            stopSynth();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, tempo]);

    useEffect(() => {
        return () => stopSynth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400 shadow-xl">
                        <Music className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">AI Worship & Choir Studio</h1>
                    <p className="text-slate-400 text-sm">Compose worship lyrics, guitar/piano chord progressions, and 4-part choir arrangements</p>
                </div>

                {/* Generator Controls */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl mb-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Song Theme / Sermon Passage</label>
                            <input
                                type="text"
                                value={theme}
                                onChange={e => setTheme(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Musical Key</label>
                            <select
                                value={key}
                                onChange={e => setKey(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                            >
                                <option>C Major</option>
                                <option>G Major</option>
                                <option>D Major</option>
                                <option>E Major</option>
                                <option>F# Major</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tempo</label>
                            <select
                                value={tempo}
                                onChange={e => setTempo(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                            >
                                <option>68 BPM (Slow Worship)</option>
                                <option>72 BPM (Standard)</option>
                                <option>96 BPM (Mid-Tempo Praise)</option>
                                <option>120 BPM (High Praise)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                        <button
                            onClick={toggleSynthPreview}
                            className={`px-5 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                                isPlayingSynth ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                        >
                            {isPlayingSynth ? <Square className="w-4 h-4 text-purple-400 fill-current" /> : <Play className="w-4 h-4 text-purple-400" />}
                            <span>{isPlayingSynth ? 'Stop Progression' : 'Play Chord Progression'}</span>
                            {isPlayingSynth && (
                                <span className="flex items-center gap-1 ml-1">
                                    {CHORD_LABELS.map((lbl, i) => (
                                        <span
                                            key={lbl}
                                            className={`text-[10px] font-mono px-1 rounded transition-all ${
                                                activeChord === i ? 'bg-purple-400 text-slate-950 scale-110' : 'text-purple-400/50'
                                            }`}
                                        >
                                            {lbl}
                                        </span>
                                    ))}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={handleCompose}
                            disabled={loading}
                            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            <span>Compose Worship Song</span>
                        </button>
                    </div>
                </div>

                {/* Song Result Sheet */}
                {song && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Title Bar */}
                        <div className="p-6 bg-slate-900 border border-purple-500/30 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{song.title}</h2>
                                <p className="text-xs text-purple-400 font-mono">Key: {song.key} • Tempo: {song.tempo}</p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {song.scriptureAnchors?.map((anc: string) => (
                                    <ScriptureReference key={anc} reference={anc} />
                                ))}
                            </div>
                        </div>

                        {/* Lyrics & Chords Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                    <Guitar className="w-4 h-4" /> Lyrics & Chord Chart
                                </h3>

                                <div className="space-y-4 font-mono text-xs text-slate-200">
                                    <div>
                                        <span className="text-[10px] text-purple-400 font-bold uppercase block mb-1">Verse 1</span>
                                        <pre className="whitespace-pre-wrap leading-relaxed font-sans">{song.structure.verse1}</pre>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">Chorus</span>
                                        <pre className="whitespace-pre-wrap leading-relaxed font-sans text-amber-200">{song.structure.chorus}</pre>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">Bridge</span>
                                        <pre className="whitespace-pre-wrap leading-relaxed font-sans text-emerald-200">{song.structure.bridge}</pre>
                                    </div>
                                </div>
                            </div>

                            {/* 4-Part Choir Vocal Arrangement */}
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                    <Layers className="w-4 h-4" /> 4-Part Choir Arrangements
                                </h3>

                                <div className="space-y-3 text-xs">
                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                                        <span className="font-bold text-rose-400">Soprano:</span>
                                        <p className="text-slate-300">{song.choirArrangement?.soprano}</p>
                                    </div>
                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                                        <span className="font-bold text-amber-400">Alto:</span>
                                        <p className="text-slate-300">{song.choirArrangement?.alto}</p>
                                    </div>
                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                                        <span className="font-bold text-indigo-400">Tenor:</span>
                                        <p className="text-slate-300">{song.choirArrangement?.tenor}</p>
                                    </div>
                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                                        <span className="font-bold text-emerald-400">Bass:</span>
                                        <p className="text-slate-300">{song.choirArrangement?.bass}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
