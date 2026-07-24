'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles, BookOpen, RefreshCw } from 'lucide-react';

export default function SmallGroupsPage() {
    const [theme, setTheme] = useState('Unshakeable Peace & Trust');
    const [loading, setLoading] = useState(false);
    const [guide, setGuide] = useState<any>({
        groupTitle: 'Grace & Truth Small Group Study',
        icebreaker: 'What is one moment this week where you felt God’s peace unexpectedly?',
        discussionQuestions: [
            'How does trusting in God\'s sovereignty change how we respond to uncertainty?',
            'What is the difference between worldly peace and Christ\'s peace (John 14:27)?',
            'How can we practically support each other in prayer this week?'
        ],
        actionChallenge: 'Pair up with a group partner and text an encouraging scripture verse on Wednesday.',
    });

    const handleGenerate = () => {
        setLoading(true);
        setTimeout(() => {
            setGuide({
                groupTitle: `Sanctuary AI Study: ${theme}`,
                icebreaker: 'What is a Bible passage that has comforted you during difficult times?',
                discussionQuestions: [
                    `How does the main message of ${theme} apply to our work and family life?`,
                    'Where in your life are you currently tempted to rely on self-effort instead of faith?',
                    'What steps can our small group take to serve those in need in our local city?'
                ],
                actionChallenge: 'Memorize Psalm 23:1 together as a group this week.'
            });
            setLoading(false);
        }, 600);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-950 text-slate-100">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-xl">
                        <Users className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">AI Small Group Co-Host</h1>
                    <p className="text-slate-400 text-sm">Instant Bible study discussion guides & weekly group challenges</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl mb-8 space-y-4">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Sermon Theme / Bible Passage</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-xl text-xs flex items-center gap-1 transition-all"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            <span>Generate Study Guide</span>
                        </button>
                    </div>
                </div>

                {guide && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="p-6 bg-slate-900 border border-indigo-500/30 rounded-3xl space-y-4 shadow-xl">
                            <h2 className="text-xl font-bold text-indigo-300">{guide.groupTitle}</h2>

                            <div className="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl space-y-1">
                                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                    💬 Group Icebreaker
                                </h3>
                                <p className="text-xs text-slate-200">{guide.icebreaker}</p>
                            </div>

                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4" /> Discussion Questions
                                </h3>
                                <ul className="space-y-2">
                                    {guide.discussionQuestions.map((q: string, i: number) => (
                                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                            <span className="text-indigo-400 font-bold">{i + 1}.</span> {q}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-2xl space-y-1">
                                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    🎯 Weekly Application Challenge
                                </h3>
                                <p className="text-xs text-slate-200">{guide.actionChallenge}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
