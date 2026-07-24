'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, Square, Volume2, VolumeX, Loader2,
    Mic, Settings, ChevronDown, ChevronUp, Activity
} from 'lucide-react';

type VoiceContext = 'sermon' | 'prayer' | 'scripture' | 'pastoral' | 'children';
type VoiceEmotion = 'compassionate' | 'celebratory' | 'urgent' | 'somber' | 'tender' | 'triumphant' | 'default';

interface VoicePlayerProps {
    text: string;
    context?: VoiceContext;
    emotion?: VoiceEmotion;
    label?: string;         // e.g. "Listen to this Sermon"
    autoPlay?: boolean;
    compact?: boolean;      // condensed player (button only)
    className?: string;
    onComplete?: () => void;
}

const CONTEXT_LABELS: Record<VoiceContext, string> = {
    sermon: '⛪ Sermon Delivery',
    prayer: '🙏 Prayer Voice',
    scripture: '📖 Scripture Reading',
    pastoral: '💬 Pastoral Voice',
    children: '👶 Children\'s Voice',
};

const EMOTION_LABELS: Record<VoiceEmotion, string> = {
    compassionate: '💛 Compassionate',
    celebratory: '🎉 Celebratory',
    urgent: '🔥 Urgent',
    somber: '🕊️ Somber',
    tender: '💙 Tender',
    triumphant: '👑 Triumphant',
    default: '⚖️ Balanced',
};

export function VoicePlayer({
    text,
    context = 'pastoral',
    emotion = 'default',
    label,
    autoPlay = false,
    compact = false,
    className = '',
    onComplete,
}: VoicePlayerProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
    const [provider, setProvider] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [muted, setMuted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedEmotion, setSelectedEmotion] = useState<VoiceEmotion>(emotion);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUrlRef = useRef<string | null>(null);
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isBrowserSpeech = useRef(false);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAll();
            if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        };
    }, []);

    const stopAll = useCallback(() => {
        // Stop HTML audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        // Stop browser speech
        if (isBrowserSpeech.current && typeof window !== 'undefined') {
            window.speechSynthesis?.cancel();
        }
    }, []);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const playBrowserSpeech = useCallback((speechText: string, config: any) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setStatus('error');
            return;
        }
        const utter = new SpeechSynthesisUtterance(speechText);
        utter.rate = config?.rate ?? 1.0;
        utter.pitch = config?.pitch ?? 1.0;
        utter.volume = muted ? 0 : (config?.volume ?? 1.0);

        // Try to pick a good English voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural'))
            || voices.find(v => v.lang === 'en-US')
            || voices[0];
        if (preferred) utter.voice = preferred;

        utter.onstart = () => setStatus('playing');
        utter.onend = () => { setStatus('idle'); setProgress(0); onComplete?.(); };
        utter.onerror = () => setStatus('error');

        isBrowserSpeech.current = true;
        speechRef.current = utter;
        window.speechSynthesis.speak(utter);
    }, [muted, onComplete]);

    const handlePlay = useCallback(async () => {
        if (status === 'playing') {
            // Pause
            if (isBrowserSpeech.current) {
                window.speechSynthesis?.pause();
            } else {
                audioRef.current?.pause();
            }
            setStatus('paused');
            return;
        }

        if (status === 'paused') {
            // Resume
            if (isBrowserSpeech.current) {
                window.speechSynthesis?.resume();
            } else {
                audioRef.current?.play();
            }
            setStatus('playing');
            return;
        }

        // Fresh play
        stopAll();
        isBrowserSpeech.current = false;
        setStatus('loading');
        setProgress(0);

        try {
            const res = await fetch('/api/voice/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    context,
                    emotion: selectedEmotion,
                }),
            });

            if (!res.ok) throw new Error('TTS request failed');

            const contentType = res.headers.get('Content-Type') || '';

            if (contentType.includes('audio')) {
                // Real audio from ElevenLabs or OpenAI TTS
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
                audioUrlRef.current = url;

                setProvider(res.headers.get('X-Voice-Provider') || 'ai-voice');

                const audio = new Audio(url);
                audioRef.current = audio;
                audio.muted = muted;

                audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
                audio.addEventListener('timeupdate', () => {
                    if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
                });
                audio.addEventListener('ended', () => {
                    setStatus('idle');
                    setProgress(0);
                    onComplete?.();
                });
                audio.addEventListener('error', () => setStatus('error'));

                await audio.play();
                setStatus('playing');

            } else {
                // Browser speech fallback
                const data = await res.json();
                setProvider('web-speech');
                playBrowserSpeech(data.text || text, data.speechConfig);
            }
        } catch (err) {
            console.error('Voice play error:', err);
            // Emergency fallback to browser speech
            setProvider('web-speech');
            playBrowserSpeech(text, { rate: 0.9, pitch: 1.0, volume: 1.0 });
        }
    }, [status, text, context, selectedEmotion, muted, stopAll, playBrowserSpeech, onComplete]);

    const handleStop = useCallback(() => {
        stopAll();
        setStatus('idle');
        setProgress(0);
    }, [stopAll]);

    const toggleMute = useCallback(() => {
        setMuted(m => {
            const next = !m;
            if (audioRef.current) audioRef.current.muted = next;
            return next;
        });
    }, []);

    const seekTo = useCallback((pct: number) => {
        if (audioRef.current && duration) {
            audioRef.current.currentTime = (pct / 100) * duration;
            setProgress(pct);
        }
    }, [duration]);

    useEffect(() => {
        if (autoPlay && status === 'idle') handlePlay();
    }, [autoPlay]);

    const isActive = status === 'playing' || status === 'paused';
    const isLoading = status === 'loading';

    // ── Compact (button-only) mode ────────────────────────────────────────────
    if (compact) {
        return (
            <button
                onClick={handlePlay}
                disabled={isLoading}
                title={`Listen — ${CONTEXT_LABELS[context]}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-sage-600 text-white text-sm font-semibold hover:bg-sage-700 active:scale-95 transition-all disabled:opacity-50 ${className}`}
            >
                {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : status === 'playing' ? (
                    <Pause size={16} />
                ) : (
                    <Volume2 size={16} />
                )}
                {label || 'Listen'}
            </button>
        );
    }

    // ── Full player ───────────────────────────────────────────────────────────
    return (
        <div className={`bg-white rounded-2xl border border-stone-100 shadow-md overflow-hidden ${className}`}>
            {/* Header bar */}
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mic size={14} className="text-sage-500" />
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {CONTEXT_LABELS[context]}
                    </span>
                    {provider && (
                        <span className="text-[10px] px-2 py-0.5 bg-stone-200 text-stone-500 rounded-full font-medium">
                            {provider === 'elevenlabs' ? '⚡ ElevenLabs' : provider === 'openai-tts' ? '🤖 OpenAI TTS' : '🌐 Browser'}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setShowSettings(s => !s)}
                    className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                    <Settings size={14} />
                </button>
            </div>

            {/* Settings panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-stone-100"
                    >
                        <div className="px-5 py-3 space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">
                                    Voice Emotion
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(Object.keys(EMOTION_LABELS) as VoiceEmotion[]).map(em => (
                                        <button
                                            key={em}
                                            onClick={() => setSelectedEmotion(em)}
                                            className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${selectedEmotion === em
                                                    ? 'bg-sage-600 text-white border-sage-600'
                                                    : 'bg-white text-stone-600 border-stone-200 hover:border-sage-400'
                                                }`}
                                        >
                                            {EMOTION_LABELS[em]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Player controls */}
            <div className="px-5 py-4 space-y-3">
                {label && (
                    <p className="text-sm font-medium text-stone-700 truncate">{label}</p>
                )}

                {/* Progress bar (only shown for real audio) */}
                {!isBrowserSpeech.current && duration > 0 && (
                    <div className="space-y-1">
                        <div
                            className="h-1.5 bg-stone-100 rounded-full cursor-pointer overflow-hidden"
                            onClick={e => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                seekTo(((e.clientX - rect.left) / rect.width) * 100);
                            }}
                        >
                            <motion.div
                                className="h-full bg-sage-500 rounded-full"
                                style={{ width: `${progress}%` }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-400">
                            <span>{formatTime((progress / 100) * duration)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                )}

                {/* Waveform animation when playing */}
                {status === 'playing' && (
                    <div className="flex items-end gap-0.5 h-6">
                        {[0.3, 0.7, 1, 0.5, 0.9, 0.6, 1, 0.4, 0.8, 0.3, 0.6, 1, 0.7].map((h, i) => (
                            <motion.div
                                key={i}
                                className="w-1 bg-sage-400 rounded-full"
                                animate={{ scaleY: [h, h * 0.3, h] }}
                                transition={{ duration: 0.6 + i * 0.05, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ height: `${h * 100}%`, originY: 1 }}
                            />
                        ))}
                    </div>
                )}

                {/* Control buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePlay}
                        disabled={isLoading}
                        className="w-12 h-12 rounded-2xl bg-sage-600 text-white flex items-center justify-center shadow-md hover:bg-sage-700 active:scale-95 transition-all disabled:opacity-60"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : status === 'playing' ? (
                            <Pause size={20} />
                        ) : (
                            <Play size={20} className="ml-0.5" />
                        )}
                    </button>

                    {isActive && (
                        <button
                            onClick={handleStop}
                            className="w-10 h-10 rounded-xl border border-stone-200 text-stone-500 flex items-center justify-center hover:bg-stone-50 transition-all"
                        >
                            <Square size={16} />
                        </button>
                    )}

                    <button
                        onClick={toggleMute}
                        className="w-10 h-10 rounded-xl border border-stone-200 text-stone-500 flex items-center justify-center hover:bg-stone-50 transition-all"
                    >
                        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>

                    <div className="flex-1" />

                    {status === 'error' && (
                        <span className="text-xs text-red-500 font-medium">Failed — tap retry</span>
                    )}
                    {status === 'idle' && provider && (
                        <span className="text-[10px] text-stone-400">
                            {provider === 'web-speech' ? 'Using device voice' : 'AI voice ready'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
