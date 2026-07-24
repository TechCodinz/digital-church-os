'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, BookOpen, Volume2, RefreshCw, Plus, CheckCircle2, ShieldCheck, Users, Sun, Moon } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

interface FamilyPrayerItem {
    id: string;
    person: string;
    battle: string;
    date: string;
    isAnswered: boolean;
}

export default function FamilyDevotionalPage() {
    const [familyName, setFamilyName] = useState('The Johnson Family');
    const [culturalTradition, setCulturalTradition] = useState('Evangelical / Contemporary');
    const [doctrinalStyle, setDoctrinalStyle] = useState('Scripture-Anchored & Grace-Filled');
    const [lifestyleRhythm, setLifestyleRhythm] = useState('10-Min Evening Dinner Altar');

    // Family Worries / Prayer Altar Items
    const [newPerson, setNewPerson] = useState('');
    const [newBattle, setNewBattle] = useState('');
    const [prayers, setPrayers] = useState<FamilyPrayerItem[]>([
        { id: '1', person: 'Caleb (Age 8)', battle: 'Anxiety about school tests & making new friends', date: 'Jul 24, 2026', isAnswered: false },
        { id: '2', person: 'Dad & Mom', battle: 'Wisdom for mortgage refinancing & job stability', date: 'Jul 20, 2026', isAnswered: false },
        { id: '3', person: 'Grandma Mary', battle: 'Physical healing & knee recovery', date: 'Jul 15, 2026', isAnswered: true },
    ]);

    const [loading, setLoading] = useState(false);
    const [familyGuide, setFamilyGuide] = useState<any>({
        title: 'Unshakeable Peace for The Johnson Family',
        familyScriptureAnchor: 'Joshua 24:15 — "As for me and my house, we will serve the LORD."',
        worryPatternAnalysis: 'The AI Altar Engine detects a desire to protect Caleb from school anxiety while seeking financial wisdom and health restoration.',
        familyPrayerScript: 'Heavenly Father, we dedicate our family into Your hands. We cast every worry about school, finances, and health at the feet of Jesus. Let Your peace reign in our home. Amen.',
        peaceRoadmapSteps: [
            'Hold hands at the dinner table and speak Joshua 24:15 out loud together.',
            'Replace 10 minutes of evening news/screen time with a 3-minute family praise song.',
            'Write down 1 thing each family member is grateful for in your Family Prayer Altar Log.'
        ],
        audioDevotionalScript: 'Welcome to the Johnson Family Evening Prayer Altar. Peace be to this home. Lord Jesus, we invite Your Holy Presence into our living room right now...'
    });

    const handleAddPrayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBattle.trim()) return;

        const item: FamilyPrayerItem = {
            id: `p-${Date.now()}`,
            person: newPerson.trim() || 'Entire Family',
            battle: newBattle.trim(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            isAnswered: false,
        };

        setPrayers(prev => [item, ...prev]);
        setNewPerson('');
        setNewBattle('');
    };

    const toggleAnswered = (id: string) => {
        setPrayers(prev => prev.map(p => p.id === id ? { ...p, isAnswered: !p.isAnswered } : p));
    };

    const handleGenerateGuide = async () => {
        setLoading(true);
        try {
            const battlesList = prayers.map(p => `${p.person}: ${p.battle}`);
            const res = await fetch('/api/family/prayer-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    familyName,
                    culturalTradition,
                    doctrinalStyle,
                    familyBattles: battlesList,
                    lifestyleRhythm
                })
            });

            const data = await res.json();
            if (data.title) setFamilyGuide(data);
        } catch (err) {
            console.error('Family guide error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-xl">
                        <Heart className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Family Devotional Altar & Peace Guide</h1>
                    <p className="text-slate-400 text-sm">Build an unshakeable spiritual altar for your household, track family prayers, & receive custom peace roadmaps</p>
                </div>

                {/* Family Configuration Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl mb-8 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Family Household Name</label>
                            <input
                                type="text"
                                value={familyName}
                                onChange={e => setFamilyName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Culture / Tradition</label>
                            <input
                                type="text"
                                value={culturalTradition}
                                onChange={e => setCulturalTradition(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doctrinal Style</label>
                            <input
                                type="text"
                                value={doctrinalStyle}
                                onChange={e => setDoctrinalStyle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Daily Lifestyle Rhythm</label>
                            <select
                                value={lifestyleRhythm}
                                onChange={e => setLifestyleRhythm(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500/50"
                            >
                                <option>10-Min Evening Dinner Altar</option>
                                <option>Morning Breakfast Prayer</option>
                                <option>Bedtime Kid's Blessing</option>
                                <option>Weekend Family Worship Hour</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Family Prayer Altar & Worry Log */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Add Prayer Input */}
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Plus className="w-4 h-4 text-rose-400" /> Record Family Prayer / Worry
                        </h3>

                        <form onSubmit={handleAddPrayer} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Family Member</label>
                                <input
                                    type="text"
                                    value={newPerson}
                                    onChange={e => setNewPerson(e.target.value)}
                                    placeholder="e.g. Caleb / Mom / All of us"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Specific Need / Battle / Praise</label>
                                <textarea
                                    value={newBattle}
                                    onChange={e => setNewBattle(e.target.value)}
                                    placeholder="Describe what your family is trusting God for..."
                                    rows={3}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" /> Add to Family Altar Log
                            </button>
                        </form>
                    </div>

                    {/* Prayer Altar Log List */}
                    <div className="md:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-rose-400" /> Family Altar Prayer Ledger
                                </h3>
                                <button
                                    onClick={handleGenerateGuide}
                                    disabled={loading}
                                    className="px-4 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                                >
                                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    <span>Analyze & Generate Peace Guide</span>
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {prayers.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => toggleAnswered(p.id)}
                                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                                            p.isAnswered
                                                ? 'bg-emerald-950/30 border-emerald-500/30 opacity-80'
                                                : 'bg-slate-950 border-slate-800 hover:border-rose-500/30'
                                        }`}
                                    >
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2 font-bold text-slate-200">
                                                <span>{p.person}</span>
                                                <span className="text-[10px] text-slate-500 font-mono">({p.date})</span>
                                            </div>
                                            <p className="text-slate-300">{p.battle}</p>
                                        </div>

                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                                            p.isAnswered ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-amber-400 border border-amber-500/20'
                                        }`}>
                                            {p.isAnswered ? '✓ Answered Prayer!' : 'Interceding...'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Family Peace & Victory Roadmap */}
                {familyGuide && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Title Bar & Audio Player */}
                        <div className="p-6 bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/30 rounded-3xl shadow-2xl space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs uppercase font-mono tracking-widest text-rose-400 font-bold">Family Audio Broadcast</span>
                                <span className="text-xs font-semibold text-amber-300">📖 {familyGuide.familyScriptureAnchor}</span>
                            </div>

                            <h2 className="text-2xl font-bold text-white">{familyGuide.title}</h2>

                            <VoicePlayer
                                text={familyGuide.audioDevotionalScript || familyGuide.familyPrayerScript}
                                context="pastoral"
                                label="Play Evening Family Audio Prayer Time"
                            />
                        </div>

                        {/* Worry Pattern Analysis & Prayer Script */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Pattern Insight */}
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 shadow-xl">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> AI Family Pattern Analysis
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                    {familyGuide.worryPatternAnalysis}
                                </p>
                            </div>

                            {/* Family Prayer Script */}
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 shadow-xl">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                                    🙏 Family Guided Prayer Script
                                </h3>
                                <p className="text-xs text-slate-200 italic leading-relaxed bg-rose-950/20 p-4 rounded-2xl border border-rose-500/20">
                                    "{familyGuide.familyPrayerScript}"
                                </p>
                            </div>
                        </div>

                        {/* Peace Roadmap Steps */}
                        <div className="p-6 bg-slate-900 border border-emerald-500/30 rounded-3xl space-y-3 shadow-xl">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                                🕊️ Step-by-Step Family Peace Roadmap
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {familyGuide.peaceRoadmapSteps?.map((step: string, i: number) => (
                                    <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1 text-xs">
                                        <span className="font-bold text-emerald-400">Step {i + 1}</span>
                                        <p className="text-slate-300 leading-relaxed">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
