'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Sparkles, RefreshCw, Layers, GraduationCap, Users, ScrollText, Languages, ArrowRight,
} from 'lucide-react';
import { ScriptureReference, ScriptureText } from '@/components/scripture/ScriptureReference';
import { VoicePlayer } from '@/components/ai/VoicePlayer';
import { ThinkingSkeleton } from '@/components/ui/Skeleton';

type Tab = 'sermon' | 'sunday' | 'group' | 'word';

const SUGGESTIONS = ['Unshakeable Peace', 'Forgiveness', 'Faith over Fear', 'God\u2019s Provision', 'Hope in Suffering'];

export default function PastorStudyDeskPage() {
    const [topic, setTopic] = useState('Unshakeable Peace');
    const [loading, setLoading] = useState(false);
    const [study, setStudy] = useState<any>(null);
    const [tab, setTab] = useState<Tab>('sermon');

    const generate = async (t?: string) => {
        const subject = (t ?? topic).trim();
        if (!subject) return;
        if (t) setTopic(t);
        setLoading(true);
        try {
            const res = await fetch('/api/ai/study-desk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: subject }),
            });
            const data = await res.json();
            setStudy(data);
            setTab('sermon');
        } catch (err) {
            console.error('Study desk error:', err);
        } finally {
            setLoading(false);
        }
    };

    const sermonText = study
        ? `${study.sermon.title}. ${study.sermon.introduction} ${study.sermon.points
              .map((p: any) => `${p.title}. ${p.explanation}`)
              .join(' ')} ${study.sermon.conclusion}`
        : '';

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'sermon', label: 'Sermon Outline', icon: ScrollText },
        { id: 'sunday', label: 'Sunday School', icon: GraduationCap },
        { id: 'group', label: 'Small Group', icon: Users },
        { id: 'word', label: 'Word Study', icon: Languages },
    ];

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 mb-3">
                        <Sparkles className="w-4 h-4 animate-pulse" /> Pastor Study Desk
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">One Topic. A Complete Teaching Kit.</h1>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto">
                        Turn any topic or passage into a sermon outline, an age-adapted Sunday-school lesson, small-group
                        questions, and original-language insight — grounded in Scripture.
                    </p>
                </div>

                {/* Input */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl mb-8">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Topic or Passage</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && generate()}
                            placeholder="e.g. Forgiveness, Psalm 23, Faith over Fear…"
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                        />
                        <button
                            onClick={() => generate()}
                            disabled={loading}
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Generate Study Kit
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => generate(s)}
                                className="text-xs px-3 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-800 hover:text-amber-300 hover:border-amber-500/40 transition-all"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                        <ThinkingSkeleton label="Building your teaching kit from Scripture…" />
                    </div>
                )}

                {study && !loading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((t) => {
                                const Icon = t.icon;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setTab(t.id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                                            tab === t.id
                                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" /> {t.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Sermon */}
                        {tab === 'sermon' && (
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{study.sermon.title}</h2>
                                        <p className="text-sm text-amber-300/80 mt-1 italic">{study.sermon.bigIdea}</p>
                                    </div>
                                    <VoicePlayer text={sermonText} context="sermon" emotion="triumphant" label="Preview Sermon Audio" compact />
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">{study.sermon.introduction}</p>
                                <div className="space-y-3">
                                    {study.sermon.points.map((p: any, i: number) => (
                                        <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-white text-sm">{i + 1}. {p.title}</h3>
                                                <ScriptureReference reference={p.scripture} />
                                            </div>
                                            <p className="text-xs text-slate-300 leading-relaxed">{p.explanation}</p>
                                            <p className="text-xs text-amber-300/90"><span className="font-semibold">Apply:</span> {p.application}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-4">
                                    <span className="font-semibold text-amber-400">Conclusion — </span>{study.sermon.conclusion}
                                </p>
                            </div>
                        )}

                        {/* Sunday School */}
                        {tab === 'sunday' && (
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">{study.sundaySchool.title}</h2>
                                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                                        {study.sundaySchool.ageBand}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-400">Memory verse:</span>
                                    <ScriptureReference reference={study.sundaySchool.memoryVerse} />
                                </div>
                                {[
                                    ['Big Idea', study.sundaySchool.bigIdea],
                                    ['Opening Question', study.sundaySchool.opener],
                                    ['Story Time', study.sundaySchool.story],
                                    ['Activity', study.sundaySchool.activity],
                                    ['Takeaway', study.sundaySchool.takeaway],
                                ].map(([h, body]) => (
                                    <div key={h as string} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">{h}</h3>
                                        <p className="text-sm text-slate-300 leading-relaxed">{body}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Small Group */}
                        {tab === 'group' && (
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">Icebreaker</h3>
                                    <p className="text-sm text-slate-300">{study.smallGroup.icebreaker}</p>
                                </div>
                                <div className="space-y-2">
                                    {study.smallGroup.questions.map((q: string, i: number) => (
                                        <div key={i} className="flex gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                                            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                            <p className="text-sm text-slate-300 leading-relaxed"><ScriptureLinked text={q} /></p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                    <p className="text-sm text-amber-200"><span className="font-semibold">Challenge: </span>{study.smallGroup.challenge}</p>
                                </div>
                            </div>
                        )}

                        {/* Word Study & Cross-references */}
                        {tab === 'word' && (
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                                        <Languages className="w-4 h-4" /> Original-Language Word Studies
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {study.wordStudies.map((w: any, i: number) => (
                                            <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg text-white font-serif">{w.term}</span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">{w.strongs}</span>
                                                </div>
                                                <p className="text-xs text-amber-300 font-semibold">{w.translit} · <span className="text-slate-400 font-normal">{w.language}</span></p>
                                                <p className="text-xs text-slate-400 italic">"{w.gloss}"</p>
                                                <p className="text-xs text-slate-300 leading-relaxed pt-1">{w.insight}</p>
                                                <div className="pt-1"><ScriptureReference reference={w.verse} /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                                        <Layers className="w-4 h-4" /> Cross-Reference Chain
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {study.crossReferences.map((v: any) => (
                                            <ScriptureReference key={v.reference} reference={v.reference} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// Small helper to keep JSX tidy: renders text with any scripture references linked.
function ScriptureLinked({ text }: { text: string }) {
    return <ScriptureText text={text} />;
}
