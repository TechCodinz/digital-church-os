'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Send, ShieldCheck, Heart, BookOpen, Star, Music, Baby, Users, RefreshCw } from 'lucide-react';

const moduleConfig: Record<string, {
    icon: any; color: string; bg: string; title: string;
    ageOptions: string[]; inputLabel: string; inputPlaceholder: string;
}> = {
    prayer: {
        icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100',
        title: "Magical Prayer Room",
        ageOptions: ["Toddler (2-3)", "Preschool (4-5)", "Early Elementary (6-8)", "Elementary (9-11)"],
        inputLabel: "What would you like to pray about?",
        inputPlaceholder: "E.g., my sick grandma, my fear of the dark, I want to thank God for...",
    },
    stories: {
        icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100',
        title: "Bible Story Adventures",
        ageOptions: ["Preschool (4-5)", "Early Elementary (6-8)", "Elementary (9-11)"],
        inputLabel: "What Bible story would you like to explore?",
        inputPlaceholder: "E.g., David and Goliath, Noah's Ark, Jonah and the Whale, Jesus walking on water...",
    },
    memory: {
        icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100',
        title: "Memory Verse Games",
        ageOptions: ["Preschool (4-5)", "Early Elementary (6-8)", "Elementary (9-11)"],
        inputLabel: "What verse or topic would you like to memorize?",
        inputPlaceholder: "E.g., John 3:16, something about God's love, Psalm 23...",
    },
    worship: {
        icon: Music, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-100',
        title: "Joyful Worship",
        ageOptions: ["Toddler (2-3)", "Preschool (4-5)", "Early Elementary (6-8)", "Elementary (9-11)"],
        inputLabel: "What theme would you like to worship about?",
        inputPlaceholder: "E.g., how great God is, Jesus loves me, thankfulness, heaven...",
    },
    crafts: {
        icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100',
        title: "Crafts & Creativity",
        ageOptions: ["Preschool (4-5)", "Early Elementary (6-8)", "Elementary (9-11)"],
        inputLabel: "What Bible story or theme would you like to create a craft for?",
        inputPlaceholder: "E.g., Noah's Ark with household items, creation week, the armor of God...",
    },
    parents: {
        icon: Users, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200',
        title: "Parent Dashboard & Devotionals",
        ageOptions: ["Toddler (2-3)", "Preschool (4-5)", "Early Elementary (6-8)", "Elementary (9-11)"],
        inputLabel: "What devotional topic or discipline milestone would you like help with?",
        inputPlaceholder: "E.g., teaching my 7-year-old to pray, family devotional on forgiveness...",
    },
};

function renderResponse(slug: string, data: any) {
    if (slug === 'prayer') {
        return (
            <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
                    <p className="text-rose-800 font-medium text-lg mb-2">{data.title}</p>
                    <p className="text-rose-700 italic mb-4">{data.opening}</p>
                    <ul className="space-y-2 mb-4">
                        {data.points?.map((p: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-rose-700"><Heart className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />{p}</li>
                        ))}
                    </ul>
                    <p className="text-rose-700 italic mb-4">{data.closing}</p>
                </div>
                {data.scripture && <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">📖 <strong>Scripture:</strong> {data.scripture}</div>}
                {data.funFact && <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">⭐ <strong>Fun Bible Fact:</strong> {data.funFact}</div>}
            </div>
        );
    }
    if (slug === 'stories') {
        return (
            <div className="space-y-4">
                <h4 className="text-xl font-semibold text-stone-800">{data.title}</h4>
                <p className="text-stone-600 leading-relaxed whitespace-pre-line">{data.story}</p>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">📖 <strong>{data.bibleReference}</strong></div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">💡 <strong>Key Lesson:</strong> {data.keyLesson}</div>
                {data.memoryVerse && <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">🌟 <strong>Memory Verse:</strong> {data.memoryVerse}</div>}
                {data.discussionQuestions?.length > 0 && (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                        <p className="font-semibold text-purple-800 mb-2">💬 Discussion Questions:</p>
                        <ul className="space-y-1">{data.discussionQuestions.map((q: string, i: number) => <li key={i} className="text-purple-700 text-sm">• {q}</li>)}</ul>
                    </div>
                )}
            </div>
        );
    }
    if (slug === 'memory') {
        return (
            <div className="space-y-4">
                {data.verse && <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center"><p className="text-amber-900 font-semibold text-lg italic">"{data.verse}"</p><p className="text-amber-600 text-sm mt-1">— {data.reference}</p></div>}
                {data.memoryHook && <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">🧠 <strong>Memory Hook:</strong> {data.memoryHook}</div>}
                {data.actionGame && <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">🎯 <strong>Action Game:</strong> {data.actionGame}</div>}
                {data.song && <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">🎶 <strong>Memory Song:</strong> <pre className="whitespace-pre-line font-sans text-sm mt-1">{data.song}</pre></div>}
                {data.practiceChallenge && <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">🏆 <strong>This Week's Challenge:</strong> {data.practiceChallenge}</div>}
            </div>
        );
    }
    if (slug === 'worship') {
        return (
            <div className="space-y-4">
                {data.songTitle && <h4 className="text-xl font-bold text-purple-800">🎵 {data.songTitle}</h4>}
                {data.lyrics && <div className="bg-purple-50 border border-purple-100 rounded-xl p-4"><pre className="whitespace-pre-line font-sans text-purple-800">{data.lyrics}</pre></div>}
                {data.motions?.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="font-semibold text-blue-800 mb-2">🙌 Motions:</p>
                        <ul className="space-y-1">{data.motions.map((m: string, i: number) => <li key={i} className="text-blue-700 text-sm">• {m}</li>)}</ul>
                    </div>
                )}
                {data.instruments?.length > 0 && <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">🥁 <strong>Instruments to Use:</strong> {data.instruments.join(', ')}</div>}
                {data.bibleConnection && <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">📖 <strong>Bible Connection:</strong> {data.bibleConnection}</div>}
            </div>
        );
    }

    // Generic beautiful response renderer for crafts, parents, and any other module
    return (
        <div className="space-y-4">
            {Object.entries(data).map(([key, value]) => {
                if (!value) return null;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                if (Array.isArray(value)) {
                    return (
                        <div key={key} className="bg-white border border-stone-100 rounded-xl p-4">
                            <p className="font-semibold text-stone-700 mb-2">{label}</p>
                            <ul className="space-y-1">{(value as string[]).map((v, i) => <li key={i} className="text-stone-600 text-sm">• {v}</li>)}</ul>
                        </div>
                    );
                }
                if (typeof value === 'object') {
                    return (
                        <div key={key} className="bg-white border border-stone-100 rounded-xl p-4">
                            <p className="font-semibold text-stone-700 mb-2">{label}</p>
                            <pre className="text-stone-600 text-sm whitespace-pre-wrap font-sans">{JSON.stringify(value, null, 2)}</pre>
                        </div>
                    );
                }
                return (
                    <div key={key} className="bg-white border border-stone-100 rounded-xl p-4">
                        <p className="font-semibold text-stone-700 mb-1">{label}</p>
                        <p className="text-stone-600 text-sm">{value as string}</p>
                    </div>
                );
            })}
        </div>
    );
}

export default function ChildrenModuleExperience({ params }: { params: { slug: string } }) {
    const { data: session } = useSession();
    const [input, setInput] = useState('');
    const [ageGroup, setAgeGroup] = useState('');
    const [response, setResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { slug } = params;
    const config = moduleConfig[slug] || {
        icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-100',
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        ageOptions: ["Early Elementary (6-8)", "Elementary (9-11)"],
        inputLabel: "What would you like to explore?",
        inputPlaceholder: "Type your question or topic here...",
    };
    const Icon = config.icon;

    if (!ageGroup && config.ageOptions.length > 0 && ageGroup !== config.ageOptions[0]) {
        // Set default age group
    }

    const handleSubmit = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const res = await fetch('/api/ai/children', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    input: input.trim(),
                    ageGroup: ageGroup || config.ageOptions[0],
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to get response');
            }

            const data = await res.json();
            setResponse(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-[#FDFBF7]">
            <div className="max-w-4xl mx-auto px-4">
                <Link href="/children" className="inline-flex items-center text-sage-600 hover:text-sage-700 font-medium mb-8 group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Children's Center
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden">
                    {/* Rainbow header bar */}
                    <div className="h-2 bg-gradient-to-r from-rose-400 via-amber-400 via-emerald-400 to-blue-400" />

                    <div className="p-8 md:p-10">
                        {/* Header */}
                        <div className="flex items-center mb-8">
                            <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center mr-4 shadow-sm border`}>
                                <Icon className={`w-7 h-7 ${config.color}`} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold text-stone-800">{config.title}</h1>
                                <div className="flex items-center mt-1 text-sm text-emerald-600 font-medium">
                                    <ShieldCheck className="w-4 h-4 mr-1" /> Safe & Age-Appropriate • AI-Powered
                                </div>
                            </div>
                        </div>

                        {/* Age Group Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-stone-600 mb-2">Child's Age Group:</label>
                            <div className="flex flex-wrap gap-2">
                                {config.ageOptions.map(age => (
                                    <button
                                        key={age}
                                        onClick={() => setAgeGroup(age)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${ageGroup === age || (!ageGroup && age === config.ageOptions[0])
                                            ? `${config.bg} ${config.color} border-current font-semibold`
                                            : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300'
                                            }`}
                                    >
                                        {age}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="bg-stone-50 rounded-2xl p-6 mb-8 border border-stone-100">
                            <label className="block text-sm font-medium text-stone-700 mb-3">
                                <Heart className="inline w-4 h-4 mr-1 text-rose-500" />
                                {config.inputLabel}
                            </label>
                            <div className="flex gap-3">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={config.inputPlaceholder}
                                    rows={3}
                                    className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !input.trim()}
                                    className={`px-5 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1 ${config.color.replace('text-', 'bg-').replace('-500', '-500')} hover:opacity-90 bg-purple-600 hover:bg-purple-700`}
                                >
                                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    <span className="text-xs">{isLoading ? 'Creating...' : 'GO!'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Response Area */}
                        <AnimatePresence>
                            {response && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-sm font-semibold text-stone-700">AI Response Ready</span>
                                        </div>
                                        <button
                                            onClick={handleSubmit}
                                            className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"
                                        >
                                            <RefreshCw className="w-3 h-3" /> Try Again
                                        </button>
                                    </div>
                                    {renderResponse(slug, response.data)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
