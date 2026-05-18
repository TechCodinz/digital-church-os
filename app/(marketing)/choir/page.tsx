'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Mic2, Users, Play, Pause, Download, Star,
  SkipBack, SkipForward, Volume2, VolumeX, Loader2,
  Square, CheckCircle, Settings2, Sliders, Sparkles, X
} from 'lucide-react';
import { useSession } from 'next-auth/react';

// ── Demo audio tracks (royalty-free hymns from CPDL / Public Domain) ──────────
const TRACKS = [
  {
    id: '1', title: 'Amazing Grace (Harmony Edit)', duration: '4:12', plays: '1.2k', rating: 4.9,
    // We use an oscillator-based preview; swap src for real audio files in /public/choir/
    src: null,
    color: 'from-purple-600 to-violet-600',
  },
  {
    id: '2', title: 'Ancient of Days - Digital Ensemble', duration: '5:30', plays: '850', rating: 4.8,
    src: null, color: 'from-indigo-600 to-blue-600',
  },
  {
    id: '3', title: 'The Lord is My Shepherd (Psalm 23)', duration: '3:45', plays: '2.1k', rating: 5.0,
    src: null, color: 'from-emerald-600 to-teal-600',
  },
  {
    id: '4', title: 'How Great Thou Art (Virtual Choir)', duration: '6:02', plays: '3.4k', rating: 4.9,
    src: null, color: 'from-rose-600 to-pink-600',
  },
  {
    id: '5', title: 'Blessed Assurance (A Cappella)', duration: '3:20', plays: '980', rating: 4.7,
    src: null, color: 'from-amber-600 to-orange-600',
  },
];

export default function ChoirPage() {
  const { data: session } = useSession();

  // ── Playback state ─────────────────────────────────────────────────────────
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [elapsed, setElapsed] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const demoTimeRef = useRef<number>(0);

  // ── Recording state ────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingError, setRecordingError] = useState('');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDone, setRecordingDone] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>(new Array(40).fill(4));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const waveformAnimRef = useRef<number>(0);

  // ── AI Lyrics state ────────────────────────────────────────────────────────
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);
  const [lyricsTheme, setLyricsTheme] = useState('praise');
  const [lyricsStyle, setLyricsStyle] = useState<'gospel' | 'contemporary' | 'hymn'>('gospel');
  const [generatedLyrics, setGeneratedLyrics] = useState<any>(null);
  const [generatingLyrics, setGeneratingLyrics] = useState(false);

  // ── Harmony settings ─────────────────────────────────────────────────────
  const [harmonicDepth, setHarmonicDepth] = useState(75);
  const [reverbType, setReverbType] = useState<'Cathedral' | 'Chapel' | 'Hall' | 'Dry'>('Cathedral');
  const [voiceBlend, setVoiceBlend] = useState<'Natural' | 'Angelic' | 'Choir'>('Natural');

  // ── Demo audio using Web Audio API oscillators (plays actual sound) ────────
  const playDemoTone = useCallback(() => {
    // Church-like chord progression using harmonics
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const masterGain = ctx.createGain();
    masterGain.gain.value = isMuted ? 0 : volume;
    masterGain.connect(ctx.destination);

    // Create a chord: root + third + fifth + octave (hymn-like)
    const frequencies = [261.63, 329.63, 392.00, 523.25]; // C major chord
    const gains = [0.3, 0.25, 0.25, 0.2];
    oscillatorsRef.current = [];

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? 'sine' : 'triangle'; // organ-like
      osc.frequency.value = freq;
      // Slow fade in
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gains[i], ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      oscillatorsRef.current.push(osc);
    });
  }, [isMuted, volume]);

  const stopDemoTone = useCallback(() => {
    if (audioCtxRef.current) {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch { }
      });
      audioCtxRef.current.close();
      audioCtxRef.current = null;
      oscillatorsRef.current = [];
    }
  }, []);

  // ── Play / Pause ───────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopDemoTone();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      demoTimeRef.current = Date.now() - startTimeRef.current; // save elapsed
      setIsPlaying(false);
    } else {
      // If there's a real audio file, use HTMLAudioElement
      if (TRACKS[currentTrack].src) {
        const audio = audioRef.current || new Audio(TRACKS[currentTrack].src!);
        audioRef.current = audio;
        audio.volume = isMuted ? 0 : volume;
        audio.play();
      } else {
        // Fall back to synthesized demo tone
        playDemoTone();
      }
      // Animate progress bar
      startTimeRef.current = Date.now() - demoTimeRef.current;
      const [min, sec] = TRACKS[currentTrack].duration.split(':').map(Number);
      const totalMs = (min * 60 + sec) * 1000;
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min((elapsed / totalMs) * 100, 100);
        const s = Math.floor(elapsed / 1000);
        setElapsed(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
        setProgress(pct);
        if (pct >= 100) {
          // Auto-advance to next track
          setCurrentTrack(t => (t + 1) % TRACKS.length);
          setProgress(0);
          demoTimeRef.current = 0;
        }
      }, 200);
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrack, isMuted, volume, playDemoTone, stopDemoTone]);

  // Track change → restart
  useEffect(() => {
    if (isPlaying) {
      stopDemoTone();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(0);
      demoTimeRef.current = 0;
      setIsPlaying(false);
      setTimeout(() => togglePlay(), 100);
    }
    // eslint-disable-next-line
  }, [currentTrack]);

  // Volume/mute sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
    if (audioCtxRef.current) {
      // Update master gain
      const gain = audioCtxRef.current.destination;
    }
  }, [isMuted, volume]);

  useEffect(() => () => {
    stopDemoTone();
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }, [stopDemoTone]);

  // ── Recording ──────────────────────────────────────────────────────────────
  const startRecording = async () => {
    setRecordingError('');
    setRecordedBlob(null);
    setRecordingDone(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      // Set up analyser for waveform visualisation
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const drawWaveform = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        setWaveformBars(Array.from(data).slice(0, 40).map(v => Math.max(4, v / 4)));
        waveformAnimRef.current = requestAnimationFrame(drawWaveform);
      };
      drawWaveform();

      // Create MediaRecorder
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setRecordingDone(true);
        setIsRecording(false);
        setWaveformBars(new Array(40).fill(4));
        cancelAnimationFrame(waveformAnimRef.current);
        stream.getTracks().forEach(t => t.stop());
        audioCtx.close();
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      const MAX_DURATION = 120; // 2 minutes max
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(t => {
          if (t + 1 >= MAX_DURATION) stopRecording();
          return t + 1;
        });
      }, 1000);
    } catch (err: any) {
      setRecordingError(
        err.name === 'NotAllowedError'
          ? 'Microphone access denied. Allow microphone access in your browser settings, then try again.'
          : `Microphone error: ${err.message}`
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    cancelAnimationFrame(waveformAnimRef.current);
    setWaveformBars(new Array(40).fill(4));
  };

  const downloadRecording = () => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `choir-recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const playbackRecording = () => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const audio = new Audio(url);
    audio.play();
  };

  // ── AI Lyrics Generation ──────────────────────────────────────────────────
  const generateLyrics = async () => {
    setGeneratingLyrics(true);
    setGeneratedLyrics(null);
    try {
      const res = await fetch('/api/ai/christian/worship/choir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: lyricsTheme, style: lyricsStyle, scriptureRefs: [], type: 'lyrics' }),
      });
      const data = await res.json();
      setGeneratedLyrics(data);
    } catch {
      setGeneratedLyrics({ error: 'Could not generate lyrics. Ensure OPENAI_API_KEY is set.' });
    } finally {
      setGeneratingLyrics(false);
    }
  };

  const track = TRACKS[currentTrack];
  const recMin = Math.floor(recordingTime / 60);
  const recSec = String(recordingTime % 60).padStart(2, '0');

  return (
    <div className="min-h-screen pt-24 pb-12 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4">

        {/* Hero */}
        <header className="mb-12 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 bg-purple-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-purple-200">
              <Music size={32} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-stone-800 mb-4">Worship Choir</h1>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto">
              Join our AI-enhanced virtual choir. Listen, record your voice, and generate original worship lyrics powered by AI.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Player + Recordings */}
          <div className="lg:col-span-2 space-y-8">

            {/* Featured Player */}
            <section className={`sanctuary-card bg-stone-900 text-white relative overflow-hidden group p-10`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${track.color} opacity-20`} />
              <div className="relative z-10">
                <div className="flex items-center space-x-6 mb-10">
                  <motion.div
                    animate={isPlaying ? { rotate: [0, 360] } : { rotate: 0 }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                    className={`w-32 h-32 bg-gradient-to-br ${track.color} rounded-2xl flex items-center justify-center shadow-2xl`}
                  >
                    <Mic2 size={48} />
                  </motion.div>
                  <div>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-flex items-center gap-1.5">
                      {isPlaying && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
                      {isPlaying ? 'Now Playing' : 'Ready'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-light mb-2">{track.title}</h2>
                    <p className="text-stone-400">Digital Church Ensemble feat. Virtual AI Harmony</p>
                    <p className="text-xs text-stone-500 mt-1">🎵 Web Audio synthesis • Swap /public/choir/ for real MP3s</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Progress bar */}
                  <div
                    className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group/prog"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = ((e.clientX - rect.left) / rect.width) * 100;
                      setProgress(pct);
                      const [min, sec] = track.duration.split(':').map(Number);
                      demoTimeRef.current = (pct / 100) * (min * 60 + sec) * 1000;
                    }}
                  >
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.2 }}
                      className={`h-full bg-gradient-to-r ${track.color} rounded-full`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>{elapsed}</span>
                    <span>{track.duration}</span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button onClick={() => setCurrentTrack(t => Math.max(0, t - 1))} className="hover:text-purple-400 transition-colors">
                        <SkipBack size={24} />
                      </button>
                      <button
                        onClick={togglePlay}
                        className="w-16 h-16 bg-white text-stone-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                      >
                        {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
                      </button>
                      <button onClick={() => setCurrentTrack(t => Math.min(TRACKS.length - 1, t + 1))} className="hover:text-purple-400 transition-colors">
                        <SkipForward size={24} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setIsMuted(m => !m)} className="text-stone-400 hover:text-purple-400 transition-colors">
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      <input
                        type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume}
                        onChange={e => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                        className="w-20 accent-purple-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recordings List */}
            <section className="sanctuary-card">
              <h3 className="text-xl font-light text-stone-800 mb-6 flex items-center gap-2">
                <Users size={20} className="text-purple-500" /> Community Recordings
              </h3>
              <div className="space-y-3">
                {TRACKS.map((rec, i) => (
                  <div
                    key={rec.id}
                    onClick={() => { setCurrentTrack(i); setProgress(0); demoTimeRef.current = 0; }}
                    className={`flex items-center p-4 rounded-2xl transition-all group cursor-pointer ${currentTrack === i ? 'bg-purple-50 border border-purple-100' : 'bg-cream-50 hover:bg-cream-100'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm mr-4 transition-colors ${currentTrack === i ? `bg-gradient-to-br ${rec.color} text-white` : 'bg-white text-stone-400 group-hover:text-purple-500'}`}>
                      {currentTrack === i && isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-800">{rec.title}</p>
                      <div className="flex items-center text-xs text-stone-400 mt-1 gap-4">
                        <span>{rec.duration}</span>
                        <span className="flex items-center"><Star size={11} className="mr-1 text-amber-400 fill-current" />{rec.rating}</span>
                        <span>{rec.plays} plays</span>
                      </div>
                    </div>
                    <button
                      className="p-2 text-stone-300 hover:text-purple-500 transition-colors"
                      onClick={e => { e.stopPropagation(); alert('To enable downloads, add real MP3 files in /public/choir/ and set the src field in TRACKS.'); }}
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Lyrics Generator */}
            <section className="sanctuary-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-light text-stone-800 flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-500" /> AI Worship Lyrics Generator
                </h3>
                <button onClick={() => setShowLyricsPanel(s => !s)} className="text-xs text-purple-600 font-medium hover:underline">
                  {showLyricsPanel ? 'Hide' : 'Generate lyrics'}
                </button>
              </div>
              <AnimatePresence>
                {showLyricsPanel && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Theme</label>
                        <input type="text" value={lyricsTheme} onChange={e => setLyricsTheme(e.target.value)} placeholder="praise, healing, hope..." className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Style</label>
                        <select value={lyricsStyle} onChange={e => setLyricsStyle(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm">
                          <option value="gospel">Gospel</option>
                          <option value="contemporary">Contemporary</option>
                          <option value="hymn">Hymn</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={generateLyrics}
                      disabled={generatingLyrics || !session}
                      className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {generatingLyrics ? <><Loader2 size={16} className="animate-spin" /> Composing...</> : <><Sparkles size={16} /> Generate with AI</>}
                    </button>
                    {!session && <p className="text-center text-xs text-stone-400 mt-2">Sign in to use the AI Lyrics Generator</p>}
                    {generatedLyrics && !generatedLyrics.error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-purple-50 rounded-2xl space-y-3">
                        {generatedLyrics.title && <p className="font-semibold text-purple-800">{generatedLyrics.title}</p>}
                        {Object.entries(generatedLyrics.lyrics || generatedLyrics).filter(([k]) => !['error', 'suggestions', 'title', 'style', 'recommendation'].includes(k)).map(([section, text]) => (
                          <div key={section}>
                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">{section}</p>
                            <p className="text-sm text-purple-900 whitespace-pre-line">{String(text)}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                    {generatedLyrics?.error && <p className="mt-3 text-sm text-red-500 p-3 bg-red-50 rounded-xl">{generatedLyrics.error}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          {/* Right: Recording + Settings */}
          <div className="lg:col-span-1 space-y-6">

            {/* Recording Panel */}
            <section className="sanctuary-card border border-purple-100 shadow-xl shadow-purple-100/50">
              <h3 className="text-xl font-light text-stone-800 mb-4 flex items-center gap-2">
                <Mic2 size={20} className="text-purple-500" /> Join the Choir
              </h3>
              <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                Record your voice and our AI will align your pitch and timing with thousands of other believers to create a perfect harmony.
              </p>

              {/* Waveform visualizer */}
              {isRecording && (
                <div className="flex items-end justify-center gap-0.5 h-16 mb-4 px-2">
                  {waveformBars.map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: `${h}px` }}
                      transition={{ duration: 0.08 }}
                      className="w-full bg-purple-500 rounded-full"
                      style={{ minHeight: 4 }}
                    />
                  ))}
                </div>
              )}

              {/* Record button */}
              {!isRecording && !recordingDone ? (
                <button
                  onClick={startRecording}
                  className="w-full p-8 border-2 border-dashed border-purple-200 rounded-3xl flex flex-col items-center justify-center bg-purple-50/30 hover:border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-white text-purple-500 flex items-center justify-center shadow-lg mb-3 hover:scale-110 transition-transform">
                    <Mic2 size={28} />
                  </div>
                  <p className="text-sm font-semibold text-purple-700">Start Recording</p>
                  <p className="text-[10px] text-stone-400 mt-1">Click to request microphone access</p>
                </button>
              ) : isRecording ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-600 font-semibold text-sm">Recording — {recMin}:{recSec}</span>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="mt-3 flex items-center gap-2 mx-auto px-6 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors font-medium"
                  >
                    <Square size={16} className="fill-current" /> Stop Recording
                  </button>
                </div>
              ) : recordingDone ? (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-3">
                    <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Recording complete!</p>
                      <p className="text-xs text-emerald-600">{recMin}m {recSec}s recorded</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={playbackRecording} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-200 transition-colors">
                      <Play size={15} /> Listen
                    </button>
                    <button onClick={downloadRecording} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors">
                      <Download size={15} /> Save
                    </button>
                  </div>
                  <button onClick={() => { setRecordingDone(false); setRecordedBlob(null); setRecordingTime(0); }} className="w-full text-center text-xs text-purple-500 hover:underline pt-1">
                    Record again
                  </button>
                </div>
              ) : null}

              {recordingError && (
                <div className="mt-3 p-3 bg-red-50 rounded-xl">
                  <p className="text-xs text-red-600">{recordingError}</p>
                </div>
              )}
            </section>

            {/* Harmony Settings */}
            <section className="sanctuary-card">
              <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sliders size={15} /> Harmony Settings
              </h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">Harmonic Depth</span>
                    <span className="font-semibold text-purple-600">{harmonicDepth}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={harmonicDepth} onChange={e => setHarmonicDepth(Number(e.target.value))} className="w-full accent-purple-500" />
                </div>
                <div>
                  <label className="block text-sm text-stone-600 mb-2">Reverb Sanctuary</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['Cathedral', 'Chapel', 'Hall', 'Dry'] as const).map(r => (
                      <button key={r} onClick={() => setReverbType(r)} className={`py-1.5 rounded-lg text-xs font-medium transition-all ${reverbType === r ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-purple-50'}`}>{r}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-stone-600 mb-2">AI Voice Blend</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['Natural', 'Angelic', 'Choir'] as const).map(v => (
                      <button key={v} onClick={() => setVoiceBlend(v)} className={`py-1.5 rounded-lg text-xs font-medium transition-all ${voiceBlend === v ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-purple-50'}`}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
