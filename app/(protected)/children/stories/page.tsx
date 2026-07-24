'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Volume2, RefreshCw, Star, Heart } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

const STORIES = [
    { title: 'David and Goliath', topic: 'Courage & Faith' },
    { title: 'Noah’s Ark & The Rainbow', topic: 'God’s Promises & Obedience' },
    { title: 'Daniel in the Lion’s Den', topic: 'Protection & Integrity' },
    { title: 'The Prodigal Son', topic: 'Unconditional Grace & Forgiveness' }
];

export default function AgeAdaptiveStoriesPage() {
    const [selectedStory, setSelectedStory] = useState(STORIES[0].title);
    const [ageGroup, setAgeGroup] = useState<'toddlers' | 'kids' | 'youth' | 'adult'>('kids');
    const [storyText, setStoryText] = useState({
        title: 'David and Goliath',
        narration: 'A young boy named David trusted God when everyone else was afraid. With just a small sling and one river stone, he defeated a huge giant because God was with him!',
        moral: 'No matter how big your problems seem, God is always bigger.',
        verse: '1 Samuel 17:47'
    });

    const handleAdapt = (story: string, age: any) => {
        setSelectedStory(story);
        setAgeGroup(age);

        if (age === 'toddlers') {
            setStoryText({
                title: `${story} (For Little Ones)`,
                narration: 'David loved God! David was small, but God is big and strong! God helped David be brave.',
                moral: 'God loves you and makes you strong!',
                verse: 'Psalm 56:3'
            });
        } else if (age === 'youth') {
            setStoryText({
                title: `${story} (Youth Perspective)`,
                narration: 'Faced with a 9-foot warrior whom the entire Israeli army feared, David rejected human armor and stepped into the valley empowered by covenant faith.',
                moral: 'True confidence comes from knowing who you are in Christ.',
                verse: '1 Samuel 17:45'
            });
        } else if (age === 'adult') {
            setStoryText({
                title: `${story} (Exegetical Reflection)`,
                narration: 'The battle in the Valley of Elah demonstrates covenantal theology: Christ, our true David, defeats the overwhelming giant of sin and death on our behalf.',
                moral: 'We do not fight for victory; we fight from the victory already won.',
                verse: '1 Corinthians 15:57'
            });
        } else {
            setStoryText({
                title: `${story} (Kids Story)`,
                narration: 'A young boy named David trusted God when everyone else was afraid. With just a small sling and one river stone, he defeated a huge giant because God was with him!',
                moral: 'No matter how big your problems seem, God is always bigger.',
                verse: '1 Samuel 17:47'
            });
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-400 shadow-xl">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Age-Adaptive Bible Storybook</h1>
                    <p className="text-slate-400 text-sm">Bible stories dynamically adapted for Toddlers, Kids, Youth, and Adults</p>
                </div>

                {/* Age Dial Controls */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl mb-8 space-y-4">
                    <div className="flex justify-center gap-2 flex-wrap">
                        {[
                            { key: 'toddlers', label: '🧸 Toddlers (0-4 yrs)' },
                            { key: 'kids', label: '🎨 Kids (5-10 yrs)' },
                            { key: 'youth', label: '⚡ Youth (11-17 yrs)' },
                            { key: 'adult', label: '🎓 Adult (18+ yrs)' }
                        ].map(a => (
                            <button
                                key={a.key}
                                onClick={() => handleAdapt(selectedStory, a.key)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    ageGroup === a.key ? 'bg-blue-500 text-slate-950 shadow-lg' : 'bg-slate-950 text-slate-400 border border-slate-800'
                                }`}
                            >
                                {a.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-800 pt-4">
                        {STORIES.map(s => (
                            <button
                                key={s.title}
                                onClick={() => handleAdapt(s.title, ageGroup)}
                                className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                                    selectedStory === s.title ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                                }`}
                            >
                                {s.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Story Card */}
                {storyText && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-900 border border-blue-500/30 rounded-3xl space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h2 className="text-xl font-bold text-white">{storyText.title}</h2>
                            <span className="text-xs font-semibold text-amber-400">📖 {storyText.verse}</span>
                        </div>

                        <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                            "{storyText.narration}"
                        </p>

                        <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-2xl space-y-1">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Life Application Moral</span>
                            <p className="text-xs text-slate-200 font-semibold">{storyText.moral}</p>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <VoicePlayer text={storyText.narration} context="scripture" label="Listen Story Narration" compact />
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
