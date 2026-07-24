'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Send, BookOpen, Award, RefreshCw, MessageSquare } from 'lucide-react';

const SKEPTIC_QUESTIONS = [
    'Why does a loving God allow suffering and evil?',
    'Is there historical evidence for the Resurrection of Jesus?',
    'How can we know the Bible is divine scripture and not just human writings?',
    'Don’t all religions lead to God?'
];

export default function EvangelismCoachPage() {
    const [selectedQuestion, setSelectedQuestion] = useState(SKEPTIC_QUESTIONS[0]);
    const [userAnswer, setUserAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);

    const handleEvaluate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userAnswer.trim() || loading) return;

        setLoading(true);
        try {
            const res = await fetch('/api/ai/evangelism/coach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionType: selectedQuestion, userResponse: userAnswer })
            });

            const data = await res.json();
            setFeedback(data);
        } catch (err) {
            console.error('Evaluation error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-xl">
                        <ShieldCheck className="w-8 h-8 text-amber-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">AI Evangelism & Apologetics Coach</h1>
                    <p className="text-slate-400 text-sm">Practice sharing your faith with gentleness, respect, and scriptural grounding (1 Peter 3:15)</p>
                </div>

                {/* Practice Container */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Skeptic Prompt / Inquiry</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {SKEPTIC_QUESTIONS.map(q => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => setSelectedQuestion(q)}
                                    className={`p-3 rounded-xl text-xs font-semibold text-left border transition-all ${
                                        selectedQuestion === q ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleEvaluate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Witness / Defense Response</label>
                            <textarea
                                value={userAnswer}
                                onChange={e => setUserAnswer(e.target.value)}
                                placeholder="Write how you would respond with truth, grace, and scripture..."
                                rows={4}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !userAnswer.trim()}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            <span>Evaluate Response & Get Feedback</span>
                        </button>
                    </form>
                </div>

                {/* AI Feedback Display */}
                {feedback && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-900 border border-amber-500/30 rounded-3xl space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-400" /> Coaching Score: <span className="text-amber-400">{feedback.score}/100</span>
                            </h3>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-semibold">
                                    Gentleness: {feedback.gentlenessRating}
                                </span>
                                <span className="px-3 py-1 bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-semibold">
                                    Scripture: {feedback.scriptureGrounding}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Pastoral Feedback</span>
                            <p className="text-xs text-slate-300 leading-relaxed">{feedback.pastoralFeedback}</p>
                        </div>

                        <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-1">
                            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Recommended Refinement</span>
                            <p className="text-xs text-slate-200 leading-relaxed">{feedback.improvedSampleAnswer}</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
