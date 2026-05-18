'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Heart, Lock, Globe, Eye, Sparkles, Play, Loader2 } from 'lucide-react';
import { PrayerRequestForm } from '@/components/prayers/PrayerRequestForm';
import { PrayerWall } from '@/components/prayers/PrayerWall';
import { VoicePlayer } from '@/components/ai/VoicePlayer';
import { CinematicAIPrayerResult } from '@/components/prayers/CinematicAIPrayerResult';

export default function PrayerRoomPage() {
    const { data: session } = useSession();
    const [viewMode, setViewMode] = useState<'wall' | 'submit' | 'ai'>('wall');
    const [wallKey, setWallKey] = useState(0);

    // AI Prayer State
    const [aiRequest, setAiRequest] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);

    const handlePrayerSubmitted = () => {
        setViewMode('wall');
        setWallKey(k => k + 1); // forces PrayerWall to remount and re-fetch
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
            {/* Hero Section */}
            <section className="relative h-[40vh] flex items-center justify-center bg-gradient-to-b from-sage-100 to-cream-100">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/prayer-pattern.svg')] opacity-10" />
                </div>

                <div className="relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Heart className="w-16 h-16 text-sage-500 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-5xl font-light text-stone-800 mb-4">
                            Prayer Room
                        </h1>
                        <p className="text-xl text-stone-600 max-w-2xl mx-auto px-4 mb-6">
                            Share your heart openly or in quiet confidence
                        </p>
                        {/* 🎤 Guided Prayer Voice */}
                        <VoicePlayer
                            text="Welcome to the Prayer Room. Take a breath. God sees you. He knows every burden you carry and every hope in your heart. As you enter this sacred space, know that you are not alone. Heaven is listening. You are loved beyond measure."
                            context="prayer"
                            emotion="tender"
                            label="A word of welcome"
                            compact
                        />
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4">
                    {session ? (
                        <>
                            <div className="flex justify-center mb-10 border-b border-stone-200">
                                <div className="flex space-x-8">
                                    <button
                                        onClick={() => setViewMode('wall')}
                                        className={`pb-4 text-sm font-medium transition-colors relative ${viewMode === 'wall' ? 'text-sage-600' : 'text-stone-500 hover:text-stone-800'}`}
                                    >
                                        Community Wall
                                        {viewMode === 'wall' && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sage-500" />}
                                    </button>
                                    <button
                                        onClick={() => setViewMode('submit')}
                                        className={`pb-4 text-sm font-medium transition-colors relative ${viewMode === 'submit' ? 'text-sage-600' : 'text-stone-500 hover:text-stone-800'}`}
                                    >
                                        Share Request
                                        {viewMode === 'submit' && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sage-500" />}
                                    </button>
                                    <button
                                        onClick={() => setViewMode('ai')}
                                        className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${viewMode === 'ai' ? 'text-amber-600' : 'text-stone-500 hover:text-stone-800'}`}
                                    >
                                        <Sparkles className="w-4 h-4" /> AI Guided Prayer
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
                                            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-amber-100 ring-1 ring-amber-50">
                                                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                                                    <Sparkles className="w-6 h-6 text-amber-600" />
                                                </div>
                                                <h3 className="text-2xl font-light text-stone-800 mb-2">Cinematic Guided Prayer</h3>
                                                <p className="text-stone-500 mb-8 leading-relaxed text-sm">
                                                    Our AI Prayer Warrior will generate a deeply personal, biblically grounded prayer, accompanied by a dynamic visual background and comforting voice.
                                                </p>

                                                <form onSubmit={handleAIPrayer}>
                                                    <textarea
                                                        value={aiRequest}
                                                        onChange={(e) => setAiRequest(e.target.value)}
                                                        placeholder="What's heavy on your heart today?"
                                                        className="w-full px-6 py-4 bg-stone-50 border-transparent rounded-2xl focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none mb-6 h-32"
                                                        required
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={isGenerating || !aiRequest.trim()}
                                                        className="w-full py-4 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all font-medium flex items-center justify-center disabled:opacity-50"
                                                    >
                                                        {isGenerating ? (
                                                            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating visuals and prayer...</>
                                                        ) : (
                                                            <>Generate Cinematic Prayer <Play className="w-4 h-4 ml-2" /></>
                                                        )}
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Lock className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-light text-stone-600 mb-4">
                                Please sign in to access the Prayer Room
                            </h2>
                            <a
                                href="/api/auth/signin"
                                className="inline-block px-6 py-3 bg-sage-500 text-white rounded-full hover:bg-sage-600"
                            >
                                Sign In
                            </a>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
