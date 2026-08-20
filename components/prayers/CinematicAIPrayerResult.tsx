'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, Loader2, Heart, Shield, Share2, Expand } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

interface StructuredPrayer {
    opening?: string;
    scriptureReadings?: Array<{ reference: string; text: string; reflection?: string }>;
    intercession?: string;
    thanksgiving?: string;
    closing?: string;
}

interface CinematicAIPrayerProps {
    // Accepts either a plain string or the structured prayer object from the engine.
    prayerText: string | StructuredPrayer;
    title: string;
    themes: string[];
    visuals?: {
        image?: string | null;
        video?: string | null;
    };
    onClose?: () => void;
}

/** Flatten a structured prayer (or string) into a readable spoken/plain-text form. */
function prayerToPlainText(prayer: string | StructuredPrayer): string {
    if (typeof prayer === 'string') return prayer;
    if (!prayer) return '';
    const parts: string[] = [];
    if (prayer.opening) parts.push(prayer.opening);
    (prayer.scriptureReadings || []).forEach((r) => {
        if (r?.text) parts.push(`${r.text}${r.reference ? ` (${r.reference})` : ''}`);
    });
    if (prayer.intercession) parts.push(prayer.intercession);
    if (prayer.thanksgiving) parts.push(prayer.thanksgiving);
    if (prayer.closing) parts.push(prayer.closing);
    return parts.join('\n\n');
}

export function CinematicAIPrayerResult({ prayerText, title, themes, visuals, onClose }: CinematicAIPrayerProps) {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => console.error(e));
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative rounded-3xl overflow-hidden shadow-2xl bg-stone-900 border border-stone-800 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full max-w-4xl mx-auto min-h-[600px]'}`}
        >
            {/* Visual Background (Video or Image) */}
            <div className="absolute inset-0 z-0">
                {visuals?.video && (
                    <video
                        src={visuals.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedData={() => setIsVideoLoaded(true)}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-40' : 'opacity-0'}`}
                    />
                )}

                {visuals?.image && !isVideoLoaded && (
                    <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ duration: 1 }}
                        src={visuals.image}
                        alt="Prayer visual"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-stone-900/40" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col h-full p-8 md:p-12">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                            <Sparkles className="w-5 h-5 text-amber-300" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">AI Guided Prayer</p>
                            <div className="flex gap-2">
                                {(themes || []).map((theme, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/70 uppercase tracking-widest">
                                        {theme}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={toggleFullscreen} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition-colors flex items-center justify-center text-white/70 hover:text-white">
                            <Expand className="w-4 h-4" />
                        </button>
                        {onClose && (
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition-colors flex items-center justify-center text-white/70 hover:text-white">
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Prayer Text */}
                <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full text-center">
                    <h2 className="text-3xl md:text-5xl font-light text-white mb-8 leading-tight drop-shadow-lg">
                        {title}
                    </h2>

                    <div className="prose prose-invert prose-lg mx-auto text-white/90 font-serif leading-relaxed drop-shadow-md text-left md:text-center">
                        {typeof prayerText === 'string' ? (
                            prayerText.split('\n\n').map((paragraph, i) => (
                                <p key={i} className="mb-6 last:mb-0">{paragraph}</p>
                            ))
                        ) : (
                            <>
                                {prayerText.opening && <p className="mb-6">{prayerText.opening}</p>}
                                {(prayerText.scriptureReadings || []).map((r, i) => (
                                    <blockquote
                                        key={i}
                                        className="my-6 border-l-2 border-amber-300/60 pl-4 text-left not-italic"
                                    >
                                        <p className="text-white/90 mb-1">“{r.text}”</p>
                                        <cite className="block text-amber-200/80 text-sm font-sans not-italic">
                                            — {r.reference}
                                        </cite>
                                        {r.reflection && (
                                            <p className="text-white/60 text-sm font-sans mt-2">{r.reflection}</p>
                                        )}
                                    </blockquote>
                                ))}
                                {prayerText.intercession && <p className="mb-6">{prayerText.intercession}</p>}
                                {prayerText.thanksgiving && <p className="mb-6">{prayerText.thanksgiving}</p>}
                                {prayerText.closing && <p className="mb-6 font-medium text-white">{prayerText.closing}</p>}
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 w-full max-w-sm">
                        <VoicePlayer
                            text={prayerToPlainText(prayerText)}
                            context="prayer"
                            emotion="tender"
                            label="Listen to Prayer"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <Shield className="w-3.5 h-3.5" />
                            Private & Secure
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
