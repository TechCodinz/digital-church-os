'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Award, CheckCircle2, RefreshCw, Trophy, BookOpen } from 'lucide-react';

interface MemoryVerse {
    reference: string;
    text: string;
    words: string[];
}

const VERSES: MemoryVerse[] = [
    {
        reference: 'John 3:16',
        text: 'For God so loved the world that he gave his only Son.',
        words: ['For', 'God', 'so', 'loved', 'the', 'world', 'that', 'he', 'gave', 'his', 'only', 'Son.']
    },
    {
        reference: 'Psalm 23:1',
        text: 'The Lord is my shepherd I shall not want.',
        words: ['The', 'Lord', 'is', 'my', 'shepherd', 'I', 'shall', 'not', 'want.']
    },
    {
        reference: 'Philippians 4:13',
        text: 'I can do all things through Christ who strengthens me.',
        words: ['I', 'can', 'do', 'all', 'things', 'through', 'Christ', 'who', 'strengthens', 'me.']
    }
];

export default function GamifiedScriptureMemoryPage() {
    const [currentVerseIdx, setCurrentVerseIdx] = useState(0);
    const [userSelection, setUserSelection] = useState<string[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [streak, setStreak] = useState(3);
    const [xp, setXp] = useState(240);
    const [isCompleted, setIsCompleted] = useState(false);

    const verse = VERSES[currentVerseIdx];

    const startVerse = (idx: number) => {
        setCurrentVerseIdx(idx);
        const v = VERSES[idx];
        setUserSelection([]);
        // Shuffle words
        const shuffled = [...v.words].sort(() => Math.random() - 0.5);
        setAvailableWords(shuffled);
        setIsCompleted(false);
    };

    useEffect(() => {
        startVerse(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePickWord = (word: string, index: number) => {
        const nextSelection = [...userSelection, word];
        setUserSelection(nextSelection);
        setAvailableWords(prev => prev.filter((_, i) => i !== index));

        if (nextSelection.join(' ') === verse.words.join(' ')) {
            setIsCompleted(true);
            setStreak(s => s + 1);
            setXp(x => x + 50);
        }
    };

    const handleReset = () => {
        startVerse(currentVerseIdx);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-950 text-slate-100">
            <div className="max-w-4xl mx-auto px-4">
                {/* Stats Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-8">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-bold text-slate-300">Memory Streak: <strong className="text-amber-400">{streak} Days</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-400 fill-current" />
                        <span className="text-xs font-bold text-slate-300">Total XP: <strong className="text-purple-400">{xp} XP</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300">Badge: Sword of Spirit</span>
                    </div>
                </div>

                {/* Main Game Container */}
                <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-amber-400" /> {verse.reference}
                            </h2>
                            <p className="text-xs text-slate-400">Tap the words in correct order to complete the verse</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {VERSES.map((v, i) => (
                                <button
                                    key={v.reference}
                                    onClick={() => startVerse(i)}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                        currentVerseIdx === i ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {v.reference}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Target Answer Slot Area */}
                    <div className="min-h-[100px] p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-2">
                        {userSelection.length === 0 ? (
                            <span className="text-slate-600 text-xs italic">Tap words below to build the verse...</span>
                        ) : (
                            userSelection.map((w, i) => (
                                <span key={i} className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-sm font-semibold">
                                    {w}
                                </span>
                            ))
                        )}
                    </div>

                    {/* Word Pickers */}
                    {!isCompleted ? (
                        <div className="space-y-4">
                            <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Available Words</p>
                            <div className="flex flex-wrap gap-2">
                                {availableWords.map((word, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePickWord(word, i)}
                                        className="px-4 py-2 bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/40 rounded-xl text-sm font-semibold text-slate-200 hover:text-amber-300 transition-all active:scale-95"
                                    >
                                        {word}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                            <h3 className="text-xl font-bold text-emerald-300">Verse Mastered! +50 XP</h3>
                            <p className="text-xs text-slate-300">"Your word I have hidden in my heart, that I might not sin against You." — Psalm 119:11</p>
                            <button onClick={handleReset} className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition-all">
                                Practice Again
                            </button>
                        </motion.div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-500">
                        <span>Spaced Repetition Engine Active</span>
                        <button onClick={handleReset} className="hover:text-white flex items-center gap-1">
                            <RefreshCw className="w-3.5 h-3.5" /> Reset Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
