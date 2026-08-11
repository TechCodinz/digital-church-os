'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Heart, Lock, Sparkles, Play, Loader2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { PrayerRequestForm } from '@/components/prayers/PrayerRequestForm';
import { PrayerWall } from '@/components/prayers/PrayerWall';
import { VoicePlayer } from '@/components/ai/VoicePlayer';
import { CinematicAIPrayerResult } from '@/components/prayers/CinematicAIPrayerResult';

export default function PrayerRoomPage() {
    const { data: session } = useSession();
    const [viewMode, setViewMode] = useState<'wall' | 'submit' | 'ai'>('wall');
    const [wallKey, setWallKey] = useState(0);
    const [aiRequest, setAiRequest] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);

    const handlePrayerSubmitted = () => {
        setViewMode('wall');
        setWallKey(k => k + 1);
    };

    const handleAIPrayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiRequest.trim()) return;

        setIsGenerating(true);
        try {
            const res = await fetch('/api/ai/christian/prayer/warrior', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prayerRequest: aiRequest })
            });
            if (!res.ok) throw new Error('Prayer generation failed');
            const data = await res.json();
            setAiResult(data);
        } catch (err) {
            console.error('AI Prayer failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen pt-20">
            <section className="relative flex h-[40vh] items-center justify-center bg-gradient-to-b from-sage-100 to-cream-100">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/prayer-pattern.svg')] opacity-10" />
                </div>

                <div className="relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Heart className="mx-auto mb-4 h-16 w-16 text-sage-500" />
                        <h1 className="mb-4 text-4xl font-light text-stone-800 md:text-5xl">Prayer Room</h1>
                        <p className="mx-auto mb-6 max-w-2xl px-4 text-xl text-stone-600">Share your heart openly or in quiet confidence</p>
                        <VoicePlayer
                            text="Welcome to the Prayer Room. Take a breath. God sees you. He knows every burden you carry and every hope in your heart. As you enter this sacred space, know that you are not alone. You are loved and invited to pray with honesty."
                            context="prayer"
                            emotion="tender"
                            label="A word of welcome"
                            compact
                        />
                    </motion.div>
                </div>
            </section>

            <section className="border-y border-stone-100 bg-white/70 py-5">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3 text-sm text-stone-600">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sage-600" />
                        <p className="max-w-3xl leading-6">
                            Prayer requests can be sensitive. Choose the privacy level that fits your situation. AI-guided prayer is optional and should support—not replace—Scripture, trusted community, or human pastoral care.
                        </p>
                    </div>
                    <Link href="/care" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800">
                        <HeartHandshake className="h-4 w-4" /> Request human care
                    </Link>
                </div>
            </section>

            <section className="py-12">
                <div className="mx-auto max-w-7xl px-4">
                    {session ? (
                        <>
                            <div className="mb-10 flex justify-center border-b border-stone-200">
                                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                                    <button onClick={() => setViewMode('wall')} className={`relative pb-4 text-sm font-medium transition-colors ${viewMode === 'wall' ? 'text-sage-600' : 'text-stone-500 hover:text-stone-800'}`}>
                                        Community Wall
                                        {viewMode === 'wall' && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sage-500" />}
                                    </button>
                                    <button onClick={() => setViewMode('submit')} className={`relative pb-4 text-sm font-medium transition-colors ${viewMode === 'submit' ? 'text-sage-600' : 'text-stone-500 hover:text-stone-800'}`}>
                                        Share Request
                                        {viewMode === 'submit' && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sage-500" />}
                                    </button>
                                    <button onClick={() => setViewMode('ai')} className={`relative flex items-center gap-2 pb-4 text-sm font-medium transition-colors ${viewMode === 'ai' ? 'text-amber-600' : 'text-stone-500 hover:text-stone-800'}`}>
                                        <Sparkles className="h-4 w-4" /> AI Guided Prayer
                                        {viewMode === 'ai' && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-amber-500" />}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {viewMode === 'wall' && (
                                    <motion.div key="wall" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <PrayerWall key={wallKey} />
                                    </motion.div>
                                )}

                                {viewMode === 'submit' && (
                                    <motion.div key="submit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        <PrayerRequestForm onSubmitted={handlePrayerSubmitted} />
                                    </motion.div>
                                )}

                                {viewMode === 'ai' && (
                                    <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                        {aiResult ? (
                                            <CinematicAIPrayerResult
                                                title={`A Prayer for ${aiRequest.split(' ').slice(0, 3).join(' ')}...`}
                                                prayerText={aiResult.prayer}
                                                themes={aiResult.themes}
                                                visuals={aiResult.visuals}
                                                onClose={() => setAiResult(null)}
                                            />
                                        ) : (
                                            <div className="mx-auto max-w-2xl rounded-3xl border border-amber-100 bg-white p-8 shadow-sm ring-1 ring-amber-50">
                                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                                                    <Sparkles className="h-6 w-6 text-amber-600" />
                                                </div>
                                                <h3 className="mb-2 text-2xl font-light text-stone-800">Scripture-grounded guided prayer</h3>
                                                <p className="mb-4 text-sm leading-relaxed text-stone-500">
                                                    The AI Prayer companion can help structure a prayer around what you share and may suggest relevant biblical themes. Review the result prayerfully and use the human care option whenever you need a real person to walk with you.
                                                </p>
                                                <div className="mb-7 rounded-2xl border border-stone-100 bg-stone-50 p-4 text-xs leading-5 text-stone-500">
                                                    Avoid sharing passwords, financial credentials, or information you would not want processed by an AI service. For sensitive pastoral needs, use the human care pathway instead.
                                                </div>

                                                <form onSubmit={handleAIPrayer}>
                                                    <label htmlFor="ai-prayer-request" className="mb-2 block text-sm font-medium text-stone-700">What would you like prayer for?</label>
                                                    <textarea
                                                        id="ai-prayer-request"
                                                        value={aiRequest}
                                                        onChange={(e) => setAiRequest(e.target.value)}
                                                        placeholder="Share only what you are comfortable using for a guided prayer..."
                                                        className="mb-6 h-32 w-full resize-none rounded-2xl border-transparent bg-stone-50 px-6 py-4 outline-none transition-all focus:ring-2 focus:ring-amber-200"
                                                        required
                                                    />
                                                    <button type="submit" disabled={isGenerating || !aiRequest.trim()} className="flex w-full items-center justify-center rounded-xl bg-amber-500 py-4 font-medium text-white transition-all hover:bg-amber-600 disabled:opacity-50">
                                                        {isGenerating ? (
                                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparing guided prayer...</>
                                                        ) : (
                                                            <>Prepare Guided Prayer <Play className="ml-2 h-4 w-4" /></>
                                                        )}
                                                    </button>
                                                </form>

                                                <div className="mt-5 text-center">
                                                    <Link href="/care" className="inline-flex items-center gap-2 text-sm font-semibold text-sage-700 hover:text-sage-800">
                                                        <HeartHandshake className="h-4 w-4" /> I would rather speak with a human care team
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <div className="py-12 text-center">
                            <Lock className="mx-auto mb-4 h-12 w-12 text-stone-400" />
                            <h2 className="mb-4 text-2xl font-light text-stone-600">Please sign in to access the Prayer Room</h2>
                            <a href="/api/auth/signin" className="inline-block rounded-full bg-sage-500 px-6 py-3 text-white hover:bg-sage-600">Sign In</a>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
