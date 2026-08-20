'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
    BookOpen,
    Heart,
    HeartHandshake,
    Loader2,
    Lock,
    Play,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import { PrayerRequestForm } from '@/components/prayers/PrayerRequestForm';
import { PrayerWall } from '@/components/prayers/PrayerWall';
import { VoicePlayer } from '@/components/ai/VoicePlayer';
import { CinematicAIPrayerResult } from '@/components/prayers/CinematicAIPrayerResult';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

type PrayerView = 'wall' | 'submit' | 'ai';

export default function PrayerRoomPage() {
    const { data: session } = useSession();
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<PrayerView>('wall');
    const [wallKey, setWallKey] = useState(0);
    const [aiRequest, setAiRequest] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);
    const [aiError, setAiError] = useState('');

    useEffect(() => setMounted(true), []);

    const activeTheme = mounted ? theme : 'emerald';
    const isLight = activeTheme === 'light';

    const handlePrayerSubmitted = () => {
        setViewMode('wall');
        setWallKey((key) => key + 1);
    };

    const handleAIPrayer = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!aiRequest.trim()) return;

        setIsGenerating(true);
        setAiError('');
        try {
            const response = await fetch('/api/ai/christian/prayer/warrior', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prayerRequest: aiRequest.trim() }),
            });
            if (!response.ok) throw new Error('Prayer companion unavailable');
            setAiResult(await response.json());
        } catch {
            setAiError('The guided-prayer service is unavailable right now. You can still write your prayer, enter the community wall, or speak with a pastor.');
        } finally {
            setIsGenerating(false);
        }
    };

    const tabs: Array<{ id: PrayerView; label: string; note: string; icon: typeof Heart }> = [
        { id: 'wall', label: 'Pray with others', note: 'Community intercession', icon: Users },
        { id: 'submit', label: 'Share a request', note: 'Public or private options', icon: Heart },
        { id: 'ai', label: 'Guided prayer', note: 'Scripture-grounded companion', icon: Sparkles },
    ];

    return (
        <div className={`sanctuary-page-shell pt-20 pb-24 ${isLight ? 'bg-[#f8f3eb]/90 text-stone-900' : 'bg-[#020807]/90 text-white'}`}>
            <section className="relative min-h-[62vh] flex items-center overflow-hidden bg-[#06120f] text-white">
                <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                <div className="sanctuary-light-column !h-[76%] !top-[-10%]" aria-hidden="true" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(16,185,129,.14),transparent_38%)]" aria-hidden="true" />

                <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-16">
                    <div className="grid lg:grid-cols-[1.12fr_0.88fr] gap-12 items-center">
                        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/8 px-4 py-2 text-[10px] uppercase tracking-[0.23em] text-amber-200">
                                <Heart className="h-3.5 w-3.5" /> Prayer Room
                            </div>
                            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.02]">
                                Bring the words you have — or the ones you cannot find yet.
                            </h1>
                            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
                                Pray privately, ask the community to stand with you, or use a Scripture-grounded companion to help shape a prayer from what is on your heart.
                            </p>
                            <div className="mt-8 max-w-xl">
                                <VoicePlayer
                                    text="Welcome to the Prayer Room. Be still for a moment. Bring your burden honestly, without needing perfect words. You can pray privately, invite others to pray with you, or use Scripture as a guide for reflection."
                                    context="prayer"
                                    emotion="tender"
                                    label="A gentle welcome"
                                    compact
                                />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 }} className="sacred-panel-dark p-6 sm:p-7">
                            <p className="sanctuary-section-label text-amber-300/75">How would you like to arrive?</p>
                            <div className="mt-5 space-y-3">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setViewMode(tab.id)}
                                            className={`sacred-focus-ring w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${viewMode === tab.id ? 'border-amber-300/28 bg-amber-300/9' : 'border-white/8 bg-white/[0.025] hover:bg-white/[0.055]'}`}
                                        >
                                            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${viewMode === tab.id ? 'bg-amber-300/14 text-amber-300' : 'bg-white/[0.04] text-slate-400'}`}>
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <span className="flex-1">
                                                <span className="block text-sm font-semibold text-white">{tab.label}</span>
                                                <span className="mt-1 block text-[11px] text-slate-500">{tab.note}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 border-t border-white/8 pt-5 flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                                <p className="text-[11px] leading-relaxed text-slate-500">Generated prayer assistance is a writing and reflection aid. It does not claim revelation, prophecy, or divine authority.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="relative z-10 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {session ? (
                        <>
                            <div className={`rounded-3xl border p-2 ${isLight ? 'border-stone-200 bg-white/70' : 'border-white/8 bg-white/[0.025]'}`}>
                                <div className="grid sm:grid-cols-3 gap-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const selected = viewMode === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setViewMode(tab.id)}
                                                className={`sacred-focus-ring flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-xs font-semibold transition-all ${selected ? isLight ? 'bg-stone-900 text-white shadow-lg' : 'bg-amber-200 text-slate-950 shadow-lg shadow-amber-300/10' : isLight ? 'text-stone-500 hover:bg-stone-50 hover:text-stone-900' : 'text-slate-500 hover:bg-white/[0.04] hover:text-white'}`}
                                            >
                                                <Icon className="h-4 w-4" /> {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-8">
                                <AnimatePresence mode="wait">
                                    {viewMode === 'wall' && (
                                        <motion.div key="wall" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                                                <div>
                                                    <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Community intercession</p>
                                                    <h2 className={`mt-3 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Stand with someone in prayer.</h2>
                                                </div>
                                                <p className={`max-w-lg text-xs leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Respond with care. Avoid public diagnosis, spiritual ranking, or claims about what God has specifically told you about another person.</p>
                                            </div>
                                            <PrayerWall key={wallKey} />
                                        </motion.div>
                                    )}

                                    {viewMode === 'submit' && (
                                        <motion.div key="submit" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                            <div className="mb-6 max-w-3xl">
                                                <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Your request</p>
                                                <h2 className={`mt-3 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Share only what feels right to share.</h2>
                                                <p className={`mt-3 text-sm leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Use the privacy controls in the request form. Sensitive pastoral matters are better handled through the care hub rather than a public wall.</p>
                                            </div>
                                            <PrayerRequestForm onSubmitted={handlePrayerSubmitted} />
                                        </motion.div>
                                    )}

                                    {viewMode === 'ai' && (
                                        <motion.div key="ai" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                                            {aiResult ? (
                                                <CinematicAIPrayerResult
                                                    title="A Scripture-grounded prayer for this moment"
                                                    prayerText={aiResult.prayer}
                                                    themes={aiResult.themes}
                                                    visuals={aiResult.visuals}
                                                    onClose={() => setAiResult(null)}
                                                />
                                            ) : (
                                                <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
                                                    <div className={`rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-stone-200 bg-white/85 shadow-xl shadow-stone-200/30' : 'border-white/8 bg-white/[0.035]'}`}>
                                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isLight ? 'bg-amber-50 text-amber-700' : 'bg-amber-300/10 text-amber-300'}`}>
                                                            <Sparkles className="h-5 w-5" />
                                                        </div>
                                                        <h2 className={`mt-6 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Guided prayer companion</h2>
                                                        <p className={`mt-3 text-sm leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Describe the situation in your own words. The assistant can help shape a prayer anchored in Scripture and humility.</p>

                                                        <form onSubmit={handleAIPrayer} className="mt-7">
                                                            <label htmlFor="guided-prayer-request" className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>What is on your heart?</label>
                                                            <textarea
                                                                id="guided-prayer-request"
                                                                value={aiRequest}
                                                                onChange={(event) => setAiRequest(event.target.value)}
                                                                placeholder="Write only what you are comfortable sharing with the prayer assistant..."
                                                                className={`mt-3 h-40 w-full resize-none rounded-2xl border px-5 py-4 text-sm leading-relaxed outline-none transition-all focus:ring-2 focus:ring-amber-300/30 ${isLight ? 'border-stone-200 bg-[#fbf8f3] text-stone-900 placeholder:text-stone-400' : 'border-white/8 bg-black/20 text-white placeholder:text-slate-600'}`}
                                                                required
                                                            />
                                                            {aiError && <p className="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/8 p-3 text-xs leading-relaxed text-rose-300">{aiError}</p>}
                                                            <button type="submit" disabled={isGenerating || !aiRequest.trim()} className={`mt-4 w-full sacred-focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all disabled:opacity-40 ${isLight ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-amber-200 text-slate-950 hover:bg-amber-100'}`}>
                                                                {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Preparing a prayer...</> : <>Prepare guided prayer <Play className="h-4 w-4" /></>}
                                                            </button>
                                                        </form>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="sacred-panel-dark p-6 text-white">
                                                            <BookOpen className="h-5 w-5 text-emerald-300" />
                                                            <h3 className="mt-4 text-lg font-semibold">Scripture remains the anchor</h3>
                                                            <p className="mt-2 text-xs leading-relaxed text-slate-500">Generated wording should be checked against Scripture and your church tradition, especially when the subject is sensitive or consequential.</p>
                                                        </div>
                                                        <a href="/pastoral/hub" className="sacred-panel-dark group block p-6 text-white">
                                                            <HeartHandshake className="h-5 w-5 text-amber-300" />
                                                            <h3 className="mt-4 text-lg font-semibold">Prefer a person?</h3>
                                                            <p className="mt-2 text-xs leading-relaxed text-slate-500">Move directly to pastoral care when you want accountable human presence, follow-up, or confidential support.</p>
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <div className="max-w-2xl mx-auto text-center py-14">
                            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${isLight ? 'bg-white border border-stone-200 text-stone-500' : 'bg-white/[0.04] border border-white/8 text-slate-400'}`}>
                                <Lock className="h-5 w-5" />
                            </div>
                            <h2 className={`mt-6 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Sign in to enter the Prayer Room</h2>
                            <p className={`mt-3 text-sm leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Prayer requests, community intercession, and guided prayer are connected to your account so privacy and continuity can be respected.</p>
                            <a href="/auth/signin" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-amber-200 px-6 text-sm font-bold text-slate-950 hover:bg-amber-100 transition-all">Sign in</a>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
