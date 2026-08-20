'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    BookOpen,
    Heart,
    HeartHandshake,
    Loader2,
    Lock,
    MessageCircleHeart,
    Play,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { PrayerRequestForm } from '@/components/prayers/PrayerRequestForm';
import { PrayerWall } from '@/components/prayers/PrayerWall';
import { VoicePlayer } from '@/components/ai/VoicePlayer';
import { CinematicAIPrayerResult } from '@/components/prayers/CinematicAIPrayerResult';

type PrayerMode = 'wall' | 'submit' | 'guided';

type GuidedPrayerResult = {
    prayer?: {
        opening?: string;
        scriptureReadings?: Array<{ reference?: string; reflection?: string }>;
        intercession?: string;
        thanksgiving?: string;
        closing?: string;
    };
    themes?: string[];
    suggestedScriptures?: string[];
    encouragement?: string;
    visuals?: { image?: string | null; video?: string | null };
    note?: string;
};

function prayerDraftToText(result: GuidedPrayerResult | null) {
    if (!result?.prayer) return '';
    const prayer = result.prayer;
    return [
        prayer.opening,
        prayer.intercession,
        prayer.thanksgiving,
        prayer.closing,
    ].filter((part): part is string => typeof part === 'string' && Boolean(part.trim())).join('\n\n');
}

const modes: Array<{ id: PrayerMode; title: string; description: string; icon: typeof Heart }> = [
    { id: 'wall', title: 'Pray with others', description: 'See approved community requests and encourage people prayerfully.', icon: MessageCircleHeart },
    { id: 'submit', title: 'Share a request', description: 'Choose the privacy level that fits what you are carrying.', icon: Heart },
    { id: 'guided', title: 'Guided prayer', description: 'Use a bounded writing companion to help put your own prayer into words.', icon: Sparkles },
];

export default function PrayerRoomPage() {
    const { data: session } = useSession();
    const [viewMode, setViewMode] = useState<PrayerMode>('wall');
    const [wallKey, setWallKey] = useState(0);
    const [guidedRequest, setGuidedRequest] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [guidedResult, setGuidedResult] = useState<GuidedPrayerResult | null>(null);
    const [guidedError, setGuidedError] = useState('');

    const handlePrayerSubmitted = () => {
        setViewMode('wall');
        setWallKey((key) => key + 1);
    };

    const handleGuidedPrayer = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!guidedRequest.trim()) return;

        setIsGenerating(true);
        setGuidedError('');
        try {
            const response = await fetch('/api/ai/christian/prayer/warrior', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prayerRequest: guidedRequest }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data?.error || 'Guided prayer could not be prepared.');
            setGuidedResult(data);
        } catch (error: any) {
            setGuidedError(error?.message || 'Guided prayer could not be prepared right now.');
        } finally {
            setIsGenerating(false);
        }
    };

    const prayerText = prayerDraftToText(guidedResult);
    const scriptureReferences = guidedResult?.suggestedScriptures?.length
        ? guidedResult.suggestedScriptures
        : guidedResult?.prayer?.scriptureReadings?.map((reading) => reading.reference || '').filter(Boolean) || [];

    return (
        <div className="sanctuary-page-shell min-h-screen bg-[#06110f] pb-20 pt-20 text-white sm:pt-24">
            <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
                <div className="sanctuary-light-column" />
                <div className="sanctuary-nave" />
                <div className="sanctuary-vignette" />
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
                        <div className="relative z-10 max-w-4xl">
                            <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl">
                                <Heart className="mr-2 h-4 w-4" /> Prayer sanctuary
                            </div>
                            <h1 className="mt-6 text-4xl font-light leading-[1.04] text-white md:text-7xl">Come as you are. Pray quietly, pray together, or ask a person to walk with you.</h1>
                            <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">Prayer requests can be deeply personal. This room makes privacy visible, keeps AI optional, and keeps human pastoral care one clear step away.</p>
                            <div className="mt-7 max-w-xl">
                                <VoicePlayer
                                    text="Welcome to the Prayer Room. Take a moment to become still. Bring your words honestly, and share only what you are comfortable sharing."
                                    context="prayer"
                                    emotion="tender"
                                    label="Prayer room welcome"
                                    compact
                                />
                            </div>
                        </div>

                        <div className="sacred-panel-dark relative z-10 p-6">
                            <p className="sanctuary-section-label text-emerald-200/60">Prayer boundaries</p>
                            <div className="mt-4 space-y-3 text-xs leading-6 text-white/48">
                                <p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Choose privacy intentionally. Public prayer and private care are not the same thing.</p>
                                <p className="flex gap-3"><BookOpen className="mt-1 h-4 w-4 shrink-0 text-amber-100" /> Generated prayer language is a reflection aid, not Scripture, prophecy, or a message from God.</p>
                                <p className="flex gap-3"><HeartHandshake className="mt-1 h-4 w-4 shrink-0 text-rose-200" /> When you need a person, the human care pathway remains available without using the AI companion.</p>
                            </div>
                            <Link href="/care" className="sacred-secondary-button mt-5 w-full"><HeartHandshake className="h-4 w-4" /> Request human care</Link>
                        </div>
                    </div>

                    <div className="mt-12 grid gap-3 md:grid-cols-3">
                        {modes.map((mode) => {
                            const Icon = mode.icon;
                            const active = viewMode === mode.id;
                            return (
                                <button
                                    key={mode.id}
                                    type="button"
                                    onClick={() => setViewMode(mode.id)}
                                    className={`group rounded-[1.75rem] border p-5 text-left transition ${active ? 'border-amber-200/25 bg-amber-100/10 shadow-[0_20px_60px_rgba(0,0,0,.24)]' : 'border-white/8 bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.055]'}`}
                                >
                                    <Icon className={`h-5 w-5 ${active ? 'text-amber-100' : 'text-emerald-200'}`} />
                                    <h2 className="mt-4 text-lg font-semibold text-white">{mode.title}</h2>
                                    <p className="mt-2 text-xs leading-6 text-white/45">{mode.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="bg-[#f7f5ef] px-4 py-14 text-stone-900 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {session ? (
                        <AnimatePresence mode="wait">
                            {viewMode === 'wall' && (
                                <motion.div key="wall" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                    <div className="mb-7 max-w-3xl">
                                        <p className="sanctuary-section-label text-emerald-700">Community intercession</p>
                                        <h2 className="mt-2 text-3xl font-light text-stone-800">Pray with what people chose to share</h2>
                                        <p className="mt-3 text-sm leading-7 text-stone-600">The wall should contain only requests whose chosen visibility allows community viewing. Sensitive care belongs in private pathways.</p>
                                    </div>
                                    <PrayerWall key={wallKey} />
                                </motion.div>
                            )}

                            {viewMode === 'submit' && (
                                <motion.div key="submit" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                    <div className="mb-7 max-w-3xl">
                                        <p className="sanctuary-section-label text-emerald-700">Share intentionally</p>
                                        <h2 className="mt-2 text-3xl font-light text-stone-800">Bring a request into the sanctuary</h2>
                                        <p className="mt-3 text-sm leading-7 text-stone-600">Choose privacy deliberately and avoid including credentials, financial account details, or another person’s confidential information.</p>
                                    </div>
                                    <PrayerRequestForm onSubmitted={handlePrayerSubmitted} />
                                </motion.div>
                            )}

                            {viewMode === 'guided' && (
                                <motion.div key="guided" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                    {guidedResult && prayerText ? (
                                        <CinematicAIPrayerResult
                                            title="A guided prayer draft"
                                            prayerText={prayerText}
                                            themes={guidedResult.themes || []}
                                            scriptureReferences={scriptureReferences}
                                            visuals={guidedResult.visuals}
                                            note={guidedResult.note}
                                            onClose={() => {
                                                setGuidedResult(null);
                                                setGuidedError('');
                                            }}
                                        />
                                    ) : (
                                        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.65fr]">
                                            <div className="rounded-[2rem] border border-amber-100 bg-white p-6 shadow-xl sm:p-8">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50"><Sparkles className="h-6 w-6 text-amber-600" /></div>
                                                <p className="sanctuary-section-label mt-5 text-amber-700">Prayer writing companion</p>
                                                <h2 className="mt-2 text-3xl font-light text-stone-800">When the words are hard to find</h2>
                                                <p className="mt-3 text-sm leading-7 text-stone-600">Describe only what you are comfortable sending to an AI service. The companion can help structure a Christian prayer draft and suggest Scripture references to open and verify.</p>

                                                <form onSubmit={handleGuidedPrayer} className="mt-6">
                                                    <label htmlFor="guided-prayer-request" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">What would you like to pray about?</label>
                                                    <textarea
                                                        id="guided-prayer-request"
                                                        value={guidedRequest}
                                                        onChange={(event) => setGuidedRequest(event.target.value)}
                                                        placeholder="Share only what you are comfortable processing for a prayer draft…"
                                                        className="min-h-40 w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-stone-800 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                                                        maxLength={4000}
                                                        required
                                                    />
                                                    <div className="mt-2 flex justify-between text-[10px] text-stone-400"><span>Do not include passwords or account credentials.</span><span>{guidedRequest.length}/4000</span></div>
                                                    {guidedError && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{guidedError}<div className="mt-3"><Link href="/care" className="font-semibold underline">Request human care instead</Link></div></div>}
                                                    <button type="submit" disabled={isGenerating || guidedRequest.trim().length < 3} className="mt-5 inline-flex min-h-13 w-full items-center justify-center rounded-2xl bg-stone-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-stone-800 disabled:opacity-50">
                                                        {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing prayer draft…</> : <>Prepare guided prayer <Play className="ml-2 h-4 w-4" /></>}
                                                    </button>
                                                </form>
                                            </div>

                                            <aside className="space-y-4">
                                                <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
                                                    <Lock className="h-5 w-5 text-emerald-600" />
                                                    <h3 className="mt-4 font-semibold text-stone-800">Sensitive prayer text is not copied into the generic AI audit trail</h3>
                                                    <p className="mt-2 text-xs leading-6 text-stone-600">The operation audit records metadata such as timing and input length, not the full prayer text or generated prayer.</p>
                                                </div>
                                                <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
                                                    <BookOpen className="h-5 w-5 text-amber-600" />
                                                    <h3 className="mt-4 font-semibold text-stone-800">Open the references yourself</h3>
                                                    <p className="mt-2 text-xs leading-6 text-stone-600">Scripture references remain separate from generated commentary so you can read them in context.</p>
                                                    <Link href="/scripture" className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700">Open Scripture <span className="ml-2">→</span></Link>
                                                </div>
                                                <Link href="/care" className="flex min-h-14 items-center justify-between rounded-[1.75rem] bg-emerald-900 px-5 text-sm font-semibold text-white"><span className="inline-flex items-center"><HeartHandshake className="mr-3 h-4 w-4" />I need a person</span><span>→</span></Link>
                                            </aside>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    ) : (
                        <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
                            <Lock className="mx-auto h-10 w-10 text-stone-400" />
                            <h2 className="mt-5 text-2xl font-light text-stone-700">Sign in to enter the Prayer Room</h2>
                            <p className="mt-3 text-sm leading-6 text-stone-500">Prayer requests, community intercession, and guided prayer are attached to an authenticated member experience.</p>
                            <Link href="/auth/signin" className="mt-6 inline-flex rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white">Enter Sanctuary</Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
