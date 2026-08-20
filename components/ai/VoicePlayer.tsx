'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, Square, Volume2, VolumeX, Loader2,
    Mic, Settings
} from 'lucide-react';

type VoiceContext = 'sermon' | 'prayer' | 'scripture' | 'pastoral' | 'children';
type VoiceEmotion = 'compassionate' | 'celebratory' | 'urgent' | 'somber' | 'tender' | 'triumphant' | 'default';

interface VoicePlayerProps {
    text: string;
    context?: VoiceContext;
    emotion?: VoiceEmotion;
    label?: string;
    autoPlay?: boolean;
    compact?: boolean;
    className?: string;
    onComplete?: () => void;
    /**
     * Keep narration entirely in the browser with Web Speech. Use this for
     * sensitive user-generated prayer/care content so text is never posted to
     * the server TTS route or a configured external voice provider.
     */
    localOnly?: boolean;
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

function localSpeechConfig(emotion: VoiceEmotion) {
    if (emotion === 'urgent') return { rate: 1.02, pitch: 1.0, volume: 1.0 };
    if (emotion === 'celebratory' || emotion === 'triumphant') return { rate: 1.0, pitch: 1.04, volume: 1.0 };
    if (emotion === 'somber' || emotion === 'tender' || emotion === 'compassionate') return { rate: 0.88, pitch: 0.98, volume: 1.0 };
    return { rate: 0.94, pitch: 1.0, volume: 1.0 };
}

export function VoicePlayer({
    text,
    context = 'pastoral',
    emotion = 'default',
    label,
    autoPlay = false,
    compact = false,
    className = '',
    onComplete,
    localOnly = false,
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
    const autoPlayStartedRef = useRef(false);

    const stopAll = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (isBrowserSpeech.current && typeof window !== 'undefined') {
            window.speechSynthesis?.cancel();
        }
    }, []);

    useEffect(() => {
        return () => {
            stopAll();
            if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        };
    }, [stopAll]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const playBrowserSpeech = useCallback((speechText: string, config: { rate?: number; pitch?: number; volume?: number }) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setStatus('error');
            return;
        }

        const utter = new SpeechSynthesisUtterance(speechText);
        utter.rate = config?.rate ?? 1.0;
        utter.pitch = config?.pitch ?? 1.0;
        utter.volume = muted ? 0 : (config?.volume ?? 1.0);

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
            if (isBrowserSpeech.current) window.speechSynthesis?.pause();
            else audioRef.current?.pause();
            setStatus('paused');
            return;
        }

        if (status === 'paused') {
            if (isBrowserSpeech.current) window.speechSynthesis?.resume();
            else await audioRef.current?.play();
            setStatus('playing');
            return;
        }

        stopAll();
        isBrowserSpeech.current = false;
        setStatus('loading');
        setProgress(0);

        if (localOnly) {
            setProvider('web-speech-local');
            playBrowserSpeech(text, localSpeechConfig(selectedEmotion));
            return;
        }

        try {
            const res = await fetch('/api/voice/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, context, emotion: selectedEmotion }),
            });

            if (!res.ok) throw new Error('TTS request failed');
            const contentType = res.headers.get('Content-Type') || '';

            if (contentType.includes('audio')) {
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
                const data = await res.json();
                setProvider('web-speech');
                playBrowserSpeech(data.text || text, data.speechConfig || localSpeechConfig(selectedEmotion));
            }
        } catch (err) {
            console.error('Voice play error:', err);
            setProvider('web-speech');
            playBrowserSpeech(text, localSpeechConfig(selectedEmotion));
        }
    }, [status, text, context, selectedEmotion, muted, stopAll, playBrowserSpeech, onComplete, localOnly]);

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
        if (!autoPlay || autoPlayStartedRef.current) return;
        autoPlayStartedRef.current = true;
        void handlePlay();
    }, [autoPlay, handlePlay]);

    const isActive = status === 'playing' || status === 'paused';
    const isLoading = status === 'loading';

    if (compact) {
        return (
            <button
                type="button"
                onClick={() => void handlePlay()}
                disabled={isLoading}
                title={localOnly ? 'Listen on this device' : `Listen — ${CONTEXT_LABELS[context]}`}
                className={`flex items-center gap-2 rounded-xl bg-sage-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-sage-700 active:scale-95 disabled:opacity-50 ${className}`}
            >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : status === 'playing' ? <Pause size={16} /> : <Volume2 size={16} />}
                {label || 'Listen'}
            </button>
        );
    }

    return (
        <div className={`overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-md ${className}`}>
            <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-5 py-3">
                <div className="flex items-center gap-2">
                    <Mic size={14} className="text-sage-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{CONTEXT_LABELS[context]}</span>
                    {localOnly && (
                        <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-semibold text-sage-700">On-device only</span>
                    )}
                    {!localOnly && provider && (
                        <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-500">
                            {provider === 'elevenlabs' ? '⚡ ElevenLabs' : provider === 'openai-tts' ? '🤖 OpenAI TTS' : '🌐 Browser'}
                        </span>
                    )}
                </div>
                <button type="button" onClick={() => setShowSettings(s => !s)} className="text-stone-400 transition-colors hover:text-stone-600" aria-label="Voice settings">
                    <Settings size={14} />
                </button>
            </div>

            <AnimatePresence>
                {showSettings && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-stone-100">
                        <div className="space-y-3 px-5 py-3">
                            <div>
                                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-stone-400">Voice Emotion</label>
                                <div className="flex flex-wrap gap-2">
                                    {(Object.keys(EMOTION_LABELS) as VoiceEmotion[]).map(em => (
                                        <button
                                            type="button"
                                            key={em}
                                            onClick={() => setSelectedEmotion(em)}
                                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${selectedEmotion === em ? 'border-sage-600 bg-sage-600 text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-sage-400'}`}
                                        >
                                            {EMOTION_LABELS[em]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {localOnly && <p className="text-[10px] leading-5 text-stone-500">This narration uses your browser/device speech engine. The text is not posted to Digital Church OS TTS or an external voice provider.</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-3 px-5 py-4">
                {label && <p className="truncate text-sm font-medium text-stone-700">{label}</p>}

                {!isBrowserSpeech.current && duration > 0 && (
                    <div className="space-y-1">
                        <div
                            className="h-1.5 cursor-pointer overflow-hidden rounded-full bg-stone-100"
                            onClick={e => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                seekTo(((e.clientX - rect.left) / rect.width) * 100);
                            }}
                        >
                            <motion.div className="h-full rounded-full bg-sage-500" style={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-400">
                            <span>{formatTime((progress / 100) * duration)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                )}

                {status === 'playing' && (
                    <div className="flex h-6 items-end gap-0.5">
                        {[0.3, 0.7, 1, 0.5, 0.9, 0.6, 1, 0.4, 0.8, 0.3, 0.6, 1, 0.7].map((h, i) => (
                            <motion.div key={i} className="w-1 rounded-full bg-sage-400" animate={{ scaleY: [h, h * 0.3, h] }} transition={{ duration: 0.6 + i * 0.05, repeat: Infinity, ease: 'easeInOut' }} style={{ height: `${h * 100}%`, originY: 1 }} />
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => void handlePlay()} disabled={isLoading} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-600 text-white shadow-md transition-all hover:bg-sage-700 active:scale-95 disabled:opacity-60">
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : status === 'playing' ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                    </button>

                    {isActive && (
                        <button type="button" onClick={handleStop} className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition-all hover:bg-stone-50" aria-label="Stop narration">
                            <Square size={16} />
                        </button>
                    )}

                    <button type="button" onClick={toggleMute} className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition-all hover:bg-stone-50" aria-label={muted ? 'Unmute narration' : 'Mute narration'}>
                        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>

                    <div className="flex-1" />

                    {status === 'error' && <span className="text-xs font-medium text-red-500">Narration unavailable</span>}
                    {status === 'idle' && provider && <span className="text-[10px] text-stone-400">{localOnly || provider.startsWith('web-speech') ? 'Using device voice' : 'AI voice ready'}</span>}
                </div>
            </div>
        </div>
    );
}
