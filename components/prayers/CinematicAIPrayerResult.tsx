'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Expand, ShieldCheck, Sparkles } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

interface CinematicAIPrayerProps {
    prayerText: string;
    title: string;
    themes?: string[];
    scriptureReferences?: string[];
    note?: string;
    visuals?: {
        image?: string | null;
        video?: string | null;
    };
    onClose?: () => void;
}

export function CinematicAIPrayerResult({
    prayerText,
    title,
    themes = [],
    scriptureReferences = [],
    note,
    visuals,
    onClose,
}: CinematicAIPrayerProps) {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', sync);
        return () => document.removeEventListener('fullscreenchange', sync);
    }, []);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
            else await document.exitFullscreen();
        } catch (error) {
            console.error('Guided prayer fullscreen failed:', error);
        }
    };

    const paragraphs = String(prayerText || '')
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden border border-white/10 bg-[#06110f] shadow-2xl ${isFullscreen ? 'fixed inset-0 z-[100] overflow-y-auto rounded-none' : 'mx-auto min-h-[600px] w-full max-w-4xl rounded-[2rem]'}`}
        >
            <div className="absolute inset-0 z-0">
                {visuals?.video && (
                    <video
                        src={visuals.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedData={() => setIsVideoLoaded(true)}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-20' : 'opacity-0'}`}
                    />
                )}
                {visuals?.image && !isVideoLoaded && (
                    <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.22 }}
                        transition={{ duration: 1 }}
                        src={visuals.image}
                        alt="Decorative prayer atmosphere"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(245,201,120,.13),transparent_26%),linear-gradient(to_top,rgba(2,7,6,.99),rgba(5,17,14,.88),rgba(5,17,14,.75))]" />
            </div>

            <div className="relative z-10 flex min-h-[600px] flex-col p-6 sm:p-10 md:p-12">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-200/20 bg-white/5">
                            <Sparkles className="h-5 w-5 text-amber-200" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100/60">Guided prayer draft</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {themes.slice(0, 6).map((theme) => (
                                    <span key={theme} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] uppercase tracking-wide text-white/55">{theme}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => void toggleFullscreen()} aria-label={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/65 transition hover:text-white"><Expand className="h-4 w-4" /></button>
                        {onClose && <button type="button" onClick={onClose} aria-label="Close guided prayer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/65 transition hover:text-white">✕</button>}
                    </div>
                </div>

                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-10 text-center">
                    <h2 className="text-3xl font-light leading-tight text-white md:text-5xl">{title}</h2>
                    <div className="mt-8 font-serif text-base leading-8 text-white/82 sm:text-lg">
                        {paragraphs.length ? paragraphs.map((paragraph, index) => <p key={index} className="mb-6 last:mb-0">{paragraph}</p>) : <p>No prayer draft was returned.</p>}
                    </div>

                    {scriptureReferences.length > 0 && (
                        <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-left">
                            <p className="flex items-center text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/65"><BookOpen className="mr-2 h-4 w-4" /> Scripture references to open and verify</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {scriptureReferences.slice(0, 6).map((reference) => (
                                    <a key={reference} href={`/scripture?ref=${encodeURIComponent(reference)}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:text-white">{reference}</a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-white/10 pt-6">
                    <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                        <VoicePlayer text={String(prayerText || '')} context="prayer" emotion="tender" label="Listen to prayer draft" />
                        <div className="max-w-sm text-[10px] leading-5 text-white/42">
                            <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-200" /><span>{note || 'Generated for reflection. Review it against Scripture and use human pastoral care when you need a person.'}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
