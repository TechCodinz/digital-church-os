'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Volume2, VolumeX, Heart, Sparkles, Plus, X, Globe, Music } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface PrayerCandle {
    id: string;
    intention: string;
    litBy: string;
    timeAgo: string;
    x: number;
    y: number;
    color: string;
}

export default function VirtualSanctuary3DPage() {
    const { data: session } = useSession();
    const [candles, setCandles] = useState<PrayerCandle[]>([
        { id: '1', intention: 'For global peace and unity across all communities.', litBy: 'Hannah S.', timeAgo: '2m ago', x: 25, y: 40, color: '#f59e0b' },
        { id: '2', intention: 'Praying for healing for my father undergoing surgery.', litBy: 'Marcus T.', timeAgo: '15m ago', x: 50, y: 55, color: '#ef4444' },
        { id: '3', intention: 'Gratitude for a new open door and restoration.', litBy: 'Grace K.', timeAgo: '1h ago', x: 75, y: 35, color: '#10b981' },
    ]);

    const [showLightModal, setShowLightModal] = useState(false);
    const [newIntention, setNewIntention] = useState('');
    const [candleColor, setCandleColor] = useState('#f59e0b');
    const [selectedCandle, setSelectedCandle] = useState<PrayerCandle | null>(null);
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const [soundTrack, setSoundTrack] = useState<'cathedral' | 'piano' | 'chants'>('cathedral');
    const audioCtxRef = useRef<AudioContext | null>(null);

    const toggleAudio = () => {
        if (isPlayingSound) {
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
                audioCtxRef.current = null;
            }
            setIsPlayingSound(false);
        } else {
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 174; // Solfeggio frequency for healing & peace
            gain.gain.value = 0.05;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            setIsPlayingSound(true);
        }
    };

    useEffect(() => {
        return () => {
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

    const handleLightCandle = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIntention.trim()) return;

        const candle: PrayerCandle = {
            id: `c-${Date.now()}`,
            intention: newIntention.trim(),
            litBy: session?.user?.name?.split(' ')[0] || 'A Worshipper',
            timeAgo: 'Just now',
            x: Math.floor(Math.random() * 70) + 15,
            y: Math.floor(Math.random() * 50) + 30,
            color: candleColor,
        };

        setCandles(prev => [candle, ...prev]);
        setNewIntention('');
        setShowLightModal(false);
    };

    return (
        <div className="min-h-screen pt-20 pb-12 bg-slate-950 text-slate-100 overflow-hidden relative">
            {/* Header Controls */}
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4 relative z-20">
                <div>
                    <h1 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
                        <Flame className="w-6 h-6 text-amber-400 animate-pulse" /> 3D Virtual Sanctuary
                    </h1>
                    <p className="text-xs text-slate-400">Ambient prayer space & global candle lighting wall</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleAudio}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                            isPlayingSound ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                    >
                        {isPlayingSound ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
                        <span>{isPlayingSound ? 'Ambient Sanctuary Audio: ON' : 'Enable Ambient Music'}</span>
                    </button>

                    <button
                        onClick={() => setShowLightModal(true)}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                    >
                        <Plus className="w-4 h-4" /> Light a Candle
                    </button>
                </div>
            </div>

            {/* 3D Canvas / Chapel View Container */}
            <div className="relative w-full h-[650px] my-4 overflow-hidden rounded-3xl max-w-7xl mx-auto border border-slate-800 bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 shadow-2xl">
                {/* Visual Backdrop Architecture */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-black pointer-events-none" />

                {/* Stained Glass Window Glow Effect */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-80 rounded-t-full bg-gradient-to-b from-purple-500/20 via-amber-500/20 to-emerald-500/10 blur-2xl pointer-events-none" />
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-64 border-2 border-amber-500/30 rounded-t-full flex items-center justify-center opacity-40">
                    <Sparkles className="w-16 h-16 text-amber-400 animate-pulse" />
                </div>

                {/* Altar / Candle Stand Platform */}
                <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent border-t border-amber-500/20" />

                {/* Interactive Candle Flames */}
                {candles.map((c) => (
                    <motion.button
                        key={c.id}
                        onClick={() => setSelectedCandle(c)}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute group z-10 focus:outline-none"
                        style={{ left: `${c.x}%`, top: `${c.y}%` }}
                    >
                        <div className="relative flex flex-col items-center">
                            {/* Flame Glow */}
                            <div className="w-8 h-8 rounded-full bg-amber-400/30 blur-md animate-pulse absolute -top-4" />
                            <Flame className="w-6 h-6 text-amber-400 animate-bounce relative z-10" style={{ color: c.color }} />
                            {/* Candle Base */}
                            <div className="w-3 h-10 bg-gradient-to-b from-amber-100 to-amber-200 rounded-t-sm shadow-lg border border-amber-300/30" />
                            <span className="text-[10px] text-amber-200/80 mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                                {c.litBy}
                            </span>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Candle Details Modal */}
            <AnimatePresence>
                {selectedCandle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
                            <button onClick={() => setSelectedCandle(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                                <Flame className="w-5 h-5" /> Candle Lit by {selectedCandle.litBy}
                            </div>
                            <p className="text-slate-200 text-sm leading-relaxed italic bg-slate-950 p-4 rounded-xl border border-slate-800">
                                "{selectedCandle.intention}"
                            </p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Lit {selectedCandle.timeAgo}</span>
                                <span className="text-amber-400 font-medium flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-current" /> Joined in Prayer</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Light Candle Modal */}
            <AnimatePresence>
                {showLightModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-bold text-base flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-amber-400" /> Light a Prayer Candle
                                </h3>
                                <button onClick={() => setShowLightModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleLightCandle} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prayer Intention</label>
                                    <textarea
                                        value={newIntention}
                                        onChange={(e) => setNewIntention(e.target.value)}
                                        placeholder="Write your prayer request or praise report..."
                                        rows={3}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowLightModal(false)} className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white">Cancel</button>
                                    <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs">Light Candle</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
