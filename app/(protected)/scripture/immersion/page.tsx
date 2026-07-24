'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Volume2, VolumeX, Sparkles, MapPin, BookOpen, Layers } from 'lucide-react';

interface HolyLandSite {
    id: string;
    name: string;
    region: string;
    period: string;
    bgGradient: string;
    scripture: string;
    description: string;
    exegesis: string;
}

const SITES: HolyLandSite[] = [
    {
        id: '1',
        name: 'Mount of Olives',
        region: 'Jerusalem',
        period: 'New Testament Era',
        bgGradient: 'from-amber-950 via-slate-950 to-slate-950',
        scripture: 'Luke 22:39 — And he came out and went, as was his custom, to the Mount of Olives.',
        description: 'Overlooking the Holy City of Jerusalem, a sacred mountain of prayer and prophetic ascension.',
        exegesis: 'The olive tree represents pressing, trial, and the pouring out of sacred oil. Here Christ prayed in profound surrender.'
    },
    {
        id: '2',
        name: 'Sea of Galilee',
        region: 'Galilee',
        period: 'Ministry of Jesus',
        bgGradient: 'from-cyan-950 via-slate-950 to-slate-950',
        scripture: 'Mark 4:39 — And he awoke and rebuked the wind and said to the sea, "Peace! Be still!"',
        description: 'A freshwater lake surrounded by rolling hills where Jesus walked on water and called his first disciples.',
        exegesis: 'Original Greek "Siopa, pephimoso" — a divine command silencing chaotic natural forces.'
    },
    {
        id: '3',
        name: 'Garden of Gethsemane',
        region: 'Kidron Valley',
        period: 'Passion Week',
        bgGradient: 'from-emerald-950 via-slate-950 to-slate-950',
        scripture: 'Matthew 26:36 — Sit here, while I go over there and pray.',
        description: 'An ancient olive orchard where Christ offered His agonizing prayer of surrender before the cross.',
        exegesis: 'Gethsemane means "Olive Press". Under immense pressure, the purest oil of divine redemption was poured out.'
    }
];

export default function HolyLandImmersionPage() {
    const [selectedSite, setSelectedSite] = useState<HolyLandSite>(SITES[0]);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const toggleAudio = () => {
        if (isPlayingAudio) {
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
                audioCtxRef.current = null;
            }
            setIsPlayingAudio(false);
        } else {
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;

            // Ambient 432 Hz Solfeggio Tone
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 432;
            gain.gain.value = 0.03;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            setIsPlayingAudio(true);
        }
    };

    useEffect(() => {
        return () => {
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 mb-3">
                            <Compass className="w-4 h-4 animate-spin-slow" /> Interactive 3D Holy Land Immersion
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">3D Scripture Immersion Studio</h1>
                        <p className="text-slate-400 text-sm">Explore biblical locations with spatial audio and exegetical popups</p>
                    </div>

                    <button
                        onClick={toggleAudio}
                        className={`px-5 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                            isPlayingAudio ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                    >
                        {isPlayingAudio ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
                        <span>{isPlayingAudio ? 'Ambient Holy Land Acoustics: ON' : 'Enable Spatial Audio'}</span>
                    </button>
                </div>

                {/* Site Selection Tabs */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6">
                    {SITES.map(site => (
                        <button
                            key={site.id}
                            onClick={() => setSelectedSite(site)}
                            className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                                selectedSite.id === site.id
                                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xl shadow-amber-500/20'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                        >
                            <MapPin className="w-4 h-4" /> {site.name} ({site.region})
                        </button>
                    ))}
                </div>

                {/* Main 3D Atmospheric Display Stage */}
                <div className={`relative w-full h-[520px] rounded-3xl border border-slate-800 bg-gradient-to-b ${selectedSite.bgGradient} p-8 flex flex-col justify-between overflow-hidden shadow-2xl`}>
                    {/* Glowing Sun / Sanctuary Light Effect */}
                    <div className="absolute top-10 right-10 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-2 max-w-xl">
                        <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">{selectedSite.period} • {selectedSite.region}</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">{selectedSite.name}</h2>
                        <p className="text-xs text-slate-300 leading-relaxed">{selectedSite.description}</p>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Scripture Anchor */}
                        <div className="p-4 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-2xl space-y-1">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Scripture Anchor</span>
                            <p className="text-xs text-slate-200 italic leading-relaxed">"{selectedSite.scripture}"</p>
                        </div>

                        {/* Exegetical Insight */}
                        <div className="p-4 bg-amber-950/40 backdrop-blur border border-amber-500/30 rounded-2xl space-y-1">
                            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" /> Exegetical Insight
                            </span>
                            <p className="text-xs text-slate-200 leading-relaxed">{selectedSite.exegesis}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
