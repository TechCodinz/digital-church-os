'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Loader2, ArrowUpRight, X } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

interface VerseData {
    reference: string;
    text: string;
    exact?: boolean;
    translation?: string;
}

// Simple in-memory cache so repeated taps on the same verse are instant.
const verseCache = new Map<string, VerseData>();

type Variant = 'pill' | 'inline';

/**
 * ScriptureReference
 * ------------------
 * A tappable verse reference. On tap it opens an elegant popover that fetches
 * the verse text from /api/scripture/verse, lets the user listen to it, and
 * links into deeper study — turning dead reference text into a living,
 * interactive experience across the whole app.
 */
export function ScriptureReference({
    reference,
    variant = 'pill',
    className = '',
}: {
    reference: string;
    variant?: Variant;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<VerseData | null>(verseCache.get(reference) || null);
    const [loading, setLoading] = useState(false);
    const wrapRef = useRef<HTMLSpanElement>(null);

    const load = useCallback(async () => {
        if (data || loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/scripture/verse?ref=${encodeURIComponent(reference)}`);
            const json = await res.json();
            if (json?.text) {
                verseCache.set(reference, json);
                setData(json);
            }
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, [reference, data, loading]);

    const toggle = useCallback(() => {
        setOpen((o) => {
            const next = !o;
            if (next) load();
            return next;
        });
    }, [load]);

    // Close on outside click / Escape
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const trigger =
        variant === 'inline' ? (
            <button
                onClick={toggle}
                className={`inline items-baseline font-semibold text-emerald-500 hover:text-emerald-400 underline decoration-dotted underline-offset-2 transition-colors ${className}`}
            >
                {reference}
            </button>
        ) : (
            <button
                onClick={toggle}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/50 active:scale-95 transition-all ${className}`}
            >
                <BookOpen className="w-3 h-3" />
                {reference}
            </button>
        );

    return (
        <span ref={wrapRef} className="relative inline-block align-baseline">
            {trigger}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.16 }}
                        className="absolute left-0 top-full mt-2 z-50 w-[min(20rem,80vw)] text-left"
                    >
                        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-black/20">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {data?.reference || reference}
                                    {data?.translation && (
                                        <span className="text-[9px] text-emerald-400/70 font-mono">{data.translation}</span>
                                    )}
                                </span>
                                <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                {loading || !data ? (
                                    <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                                        Opening the Word…
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-slate-100 leading-relaxed font-serif">“{data.text}”</p>
                                        {data.exact === false && (
                                            <p className="text-[10px] text-amber-400/80">
                                                Showing the closest verse in our library for this theme.
                                            </p>
                                        )}
                                        <VoicePlayer
                                            text={`${data.reference}. ${data.text}`}
                                            context="scripture"
                                            emotion="tender"
                                            label="Listen"
                                            compact
                                            className="!bg-emerald-600 hover:!bg-emerald-500 w-full justify-center"
                                        />
                                        <a
                                            href={`/scripture/immersion?ref=${encodeURIComponent(data.reference)}`}
                                            className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold pt-1"
                                        >
                                            Study this verse in depth <ArrowUpRight className="w-3 h-3" />
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
}

// Matches references like: John 3:16 · Philippians 4:6-7 · 1 John 4:18 · Song of Solomon 2:1
const SCRIPTURE_RE =
    /((?:[123]\s)?[A-Z][a-z]+(?:\s(?:of\s)?[A-Z][a-z]+){0,2})\s(\d{1,3}):(\d{1,3}(?:[-–]\d{1,3})?)/g;

/**
 * linkifyScripture
 * ----------------
 * Parse free text and return React nodes where any scripture references are
 * rendered as interactive inline ScriptureReference links.
 */
export function linkifyScripture(text: string): React.ReactNode[] {
    if (!text) return [];
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const re = new RegExp(SCRIPTURE_RE);
    let key = 0;

    while ((match = re.exec(text)) !== null) {
        const [full] = match;
        const start = match.index;
        if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
        nodes.push(<ScriptureReference key={`ref-${key++}`} reference={full.trim()} variant="inline" />);
        lastIndex = start + full.length;
    }
    if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
    return nodes;
}

/** Convenience wrapper: render a block of text with interactive scripture links. */
export function ScriptureText({ text, className = '' }: { text: string; className?: string }) {
    return <span className={className}>{linkifyScripture(text)}</span>;
}
