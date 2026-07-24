'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, CheckCircle2, Scissors, MessageSquare, Layers, RefreshCw, Heart, Star, Users } from 'lucide-react';

const AGE_BRACKETS = [
    { id: 'toddlers', name: '🧸 Toddlers & Pre-K (0-4 yrs)', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { id: 'elementary', name: '🎨 Elementary (5-10 yrs)', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { id: 'youth', name: '⚡ Youth & Teens (11-17 yrs)', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { id: 'adults', name: '🎓 Adults & Seniors (18+ yrs)', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
];

export default function SundaySchoolTeacherStudioPage() {
    const [selectedAge, setSelectedAge] = useState('elementary');
    const [topic, setTopic] = useState('Courage & Trusting God (David & Goliath)');
    const [duration, setDuration] = useState('45 mins');
    const [loading, setLoading] = useState(false);
    const [lesson, setLesson] = useState<any>({
        title: 'Courage Under Fire: David & Goliath',
        targetAgeGroup: 'ELEMENTARY (5-10 YRS)',
        memoryVerse: '1 Samuel 17:47 — The battle is the LORD’s.',
        teacherPrepChecklist: [
            'Print out memory verse coloring sheets',
            'Gather 5 smooth river stones and a sling demonstration rope',
            'Set up audio player for praise songs'
        ],
        objectLesson: {
            materials: ['5 smooth river stones', '1 heavy backpack'],
            instructions: 'Fill a backpack with heavy rocks representing fears. Show how trusting God removes the heavy burden.'
        },
        storyScript: 'Long ago in ancient Israel, a young shepherd boy named David trusted God when everyone else was afraid. While the army trembled before Goliath, David knew God was bigger than any giant!',
        activityCraft: {
            name: 'Paper Armor of God & David’s Pouch',
            steps: [
                'Fold brown paper into a pouch shape and staple edges.',
                'Write 5 stones of faith on paper rocks (Trust, Prayer, Scripture, Worship, Love).',
                'Place faith rocks inside the pouch.'
            ]
        },
        discussionQuestions: [
            'What is a "giant" or fear you faced this week?',
            'How did David show courage even when others doubted him?',
            'How can we pray for each other when we feel afraid?'
        ]
    });

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/children/lesson-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ageGroup: selectedAge, topic, duration })
            });
            const data = await res.json();
            if (data.title) setLesson(data);
        } catch (err) {
            console.error('Lesson generation error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-xl">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">AI Sunday School Teacher's Studio</h1>
                    <p className="text-slate-400 text-sm">Instant age-tailored lesson plans, object lessons, crafts, & skits for all age groups</p>
                </div>

                {/* Controls */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl mb-8 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Target Age Group</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {AGE_BRACKETS.map(b => (
                                <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => setSelectedAge(b.id)}
                                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                                        selectedAge === b.id ? `${b.color} bg-slate-950 shadow-lg` : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lesson Topic / Scripture</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class Duration</label>
                            <select
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                            >
                                <option>30 mins</option>
                                <option>45 mins</option>
                                <option>60 mins</option>
                                <option>90 mins (Full Workshop)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        <span>Generate Lesson Plan Package</span>
                    </button>
                </div>

                {/* Lesson Plan Result Sheet */}
                {lesson && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Title Bar */}
                        <div className="p-6 bg-slate-900 border border-amber-500/30 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{lesson.title}</h2>
                                <p className="text-xs text-amber-400 font-mono">Target: {lesson.targetAgeGroup}</p>
                            </div>
                            <span className="px-4 py-2 bg-amber-950/50 border border-amber-500/30 text-amber-300 rounded-full text-xs font-semibold">
                                📖 {lesson.memoryVerse}
                            </span>
                        </div>

                        {/* Prep & Object Lesson Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Teacher Prep */}
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Teacher Prep Checklist
                                </h3>
                                <ul className="space-y-2">
                                    {lesson.teacherPrepChecklist?.map((chk: string, i: number) => (
                                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                            <span className="text-emerald-400 font-bold">✓</span> {chk}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Object Lesson */}
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
                                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                    <Layers className="w-4 h-4" /> Visual Object Lesson
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed">{lesson.objectLesson?.instructions}</p>
                            </div>
                        </div>

                        {/* Narrative Script */}
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
                            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                🗣️ Storytelling & Teaching Script
                            </h3>
                            <p className="text-xs text-slate-200 italic leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                "{lesson.storyScript}"
                            </p>
                        </div>

                        {/* DIY Craft & Discussion Questions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Craft */}
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
                                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                    <Scissors className="w-4 h-4" /> DIY Activity Craft: {lesson.activityCraft?.name}
                                </h3>
                                <ol className="space-y-2">
                                    {lesson.activityCraft?.steps?.map((step: string, i: number) => (
                                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                            <span className="text-purple-400 font-bold">{i + 1}.</span> {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Discussion Questions */}
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
                                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                                    💬 Discussion & Reflection Questions
                                </h3>
                                <ul className="space-y-2">
                                    {lesson.discussionQuestions?.map((q: string, i: number) => (
                                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                            <span className="text-rose-400 font-bold">?</span> {q}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
