'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Layers,
    Loader2,
    MessageSquare,
    Scissors,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { ScriptureReference } from '@/components/scripture/ScriptureReference';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

const AGE_BRACKETS = [
    { id: 'toddlers', name: 'Toddlers & Pre-K', detail: '0–4 years' },
    { id: 'elementary', name: 'Elementary', detail: '5–10 years' },
    { id: 'youth', name: 'Youth & Teens', detail: '11–17 years' },
    { id: 'adults', name: 'Adult class', detail: '18+ years' },
];

type Lesson = {
    title: string;
    targetAgeGroup?: string;
    scriptureReference?: string;
    teacherPrepChecklist?: string[];
    objectLesson?: { materials?: string[]; instructions?: string };
    storyScript?: string;
    activityCraft?: { name?: string; steps?: string[] };
    discussionQuestions?: string[];
    safeguardingNote?: string;
    boundaryNote?: string;
    generatedBy?: string;
};

export default function SundaySchoolTeacherStudioPage() {
    const { theme } = useSanctuaryTheme();
    const isLight = theme === 'light';
    const [selectedAge, setSelectedAge] = useState('elementary');
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState('45 mins');
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateLesson = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setError('');
        setLesson(null);
        try {
            const response = await fetch('/api/ai/children/lesson-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ageGroup: selectedAge, topic: topic.trim(), duration }),
            });
            const data = await response.json();
            if (!response.ok || !data.title) throw new Error(data.error || 'Unable to prepare lesson plan.');
            setLesson(data);
        } catch (lessonError: any) {
            setError(lessonError?.message || 'Unable to prepare the lesson plan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`sanctuary-page-shell min-h-screen pt-24 pb-24 ${isLight ? 'bg-[#f8f3eb]/92 text-stone-900' : 'bg-[#020807]/92 text-white'}`}>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] px-6 py-10 sm:px-10 sm:py-12 text-white shadow-2xl shadow-black/25">
                    <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                    <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/18 bg-amber-300/7 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-amber-200"><BookOpen className="h-3.5 w-3.5" /> Children & teaching studio</div>
                            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.03]">AI helps the adult prepare. The adult still teaches, protects, and decides.</h1>
                            <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-400">Prepare age-aware Scripture lesson drafts, discussion prompts, and safe activities without placing children into a direct AI counseling relationship or pretending a generated curriculum is already approved for ministry.</p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <button onClick={generateLesson} disabled={loading || !topic.trim()} className="sacred-primary-button disabled:opacity-45">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Prepare teacher draft</button>
                                <Link href="/scripture/immersion" className="sacred-secondary-button"><BookOpen className="h-4 w-4" /> Open Scripture</Link>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                            <ShieldCheck className="h-5 w-5 text-emerald-300" />
                            <h2 className="mt-4 text-lg font-semibold">Adult supervision stays central</h2>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">Lesson drafts require teacher/parent review, age-safety checks, accessibility review, doctrinal fit, and the organization’s safeguarding procedures. The system does not diagnose children or ask them to disclose private experiences to AI.</p>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid xl:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
                    <aside className={`rounded-[2rem] border p-6 xl:sticky xl:top-24 ${isLight ? 'border-stone-200 bg-white/85' : 'border-white/8 bg-white/[0.03]'}`}>
                        <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-amber-300'}`}>Teacher brief</p>
                        <div className="mt-5">
                            <p className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>Age group</p>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {AGE_BRACKETS.map((bracket) => {
                                    const selected = selectedAge === bracket.id;
                                    return <button key={bracket.id} onClick={() => setSelectedAge(bracket.id)} className={`sacred-focus-ring rounded-2xl border p-3 text-left ${selected ? isLight ? 'border-sage-300 bg-sage-50' : 'border-amber-300/20 bg-amber-300/[0.055]' : isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/7 bg-black/15'}`}><span className={`block text-xs font-semibold ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>{bracket.name}</span><span className={`mt-1 block text-[9px] ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>{bracket.detail}</span></button>;
                                })}
                            </div>
                        </div>

                        <label className="mt-5 block">
                            <span className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>Topic or Scripture direction</span>
                            <textarea value={topic} onChange={(event) => setTopic(event.target.value)} rows={5} placeholder="e.g. Courage and trust — 1 Samuel 17" className={`mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-300/15 ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-black/18'}`} />
                        </label>

                        <label className="mt-4 block">
                            <span className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>Class duration</span>
                            <select value={duration} onChange={(event) => setDuration(event.target.value)} className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-[#07110f]'}`}>
                                <option>30 mins</option><option>45 mins</option><option>60 mins</option><option>90 mins (Full Workshop)</option>
                            </select>
                        </label>

                        {error && <p className={`mt-5 rounded-2xl border p-3 text-xs ${isLight ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-rose-300/15 bg-rose-300/[0.04] text-rose-300'}`}>{error}</p>}
                    </aside>

                    <main className="min-w-0">
                        {loading ? (
                            <div className={`rounded-[2rem] border p-14 text-center ${isLight ? 'border-stone-200 bg-white/70' : 'border-white/8 bg-white/[0.025]'}`}><Loader2 className={`mx-auto h-7 w-7 animate-spin ${isLight ? 'text-sage-700' : 'text-amber-300'}`} /><p className={`mt-4 text-xs ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>Preparing an adult-facing lesson draft…</p></div>
                        ) : !lesson ? (
                            <div className={`rounded-[2rem] border border-dashed p-12 text-center ${isLight ? 'border-stone-200 bg-white/60' : 'border-white/10 bg-white/[0.02]'}`}><BookOpen className={`mx-auto h-7 w-7 ${isLight ? 'text-stone-300' : 'text-slate-700'}`} /><h2 className={`mt-5 text-2xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>No demo curriculum is preloaded.</h2><p className={`mt-3 max-w-xl mx-auto text-sm leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Choose an age group, provide the actual topic or passage, then generate a teacher draft for adult review.</p></div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] p-6 sm:p-8 text-white">
                                    <div className="absolute inset-0 sanctuary-radiance opacity-70" aria-hidden="true" />
                                    <div className="relative">
                                        <p className="sanctuary-section-label text-amber-300">Adult-review lesson draft</p>
                                        <h2 className="mt-3 text-3xl sm:text-4xl font-light">{lesson.title}</h2>
                                        <p className="mt-2 text-xs text-slate-500">Target: {lesson.targetAgeGroup || selectedAge} • source: {lesson.generatedBy === 'openai' ? 'configured model' : 'offline template'}</p>
                                        {lesson.scriptureReference && <div className="mt-5"><ScriptureReference reference={lesson.scriptureReference} /></div>}
                                        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/12 bg-amber-300/[0.035] p-4 text-[10px] leading-relaxed text-slate-500"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" /> {lesson.boundaryNote}</div>
                                    </div>
                                </section>

                                <div className="grid lg:grid-cols-2 gap-5">
                                    <LessonCard isLight={isLight} icon={CheckCircle2} title="Teacher preparation">{lesson.teacherPrepChecklist?.map((item, index) => <p key={item} className="text-xs leading-relaxed"><span className="mr-2 font-bold text-emerald-500">{index + 1}.</span>{item}</p>)}</LessonCard>
                                    <LessonCard isLight={isLight} icon={Layers} title="Object lesson"><p className="text-xs leading-relaxed">{lesson.objectLesson?.instructions}</p>{lesson.objectLesson?.materials?.length ? <p className={`mt-4 text-[10px] ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>Materials: {lesson.objectLesson.materials.join(', ')}</p> : null}</LessonCard>
                                </div>

                                <LessonCard isLight={isLight} icon={BookOpen} title="Teaching narrative draft"><p className="text-sm leading-7">{lesson.storyScript}</p></LessonCard>

                                <div className="grid lg:grid-cols-2 gap-5">
                                    <LessonCard isLight={isLight} icon={Scissors} title={lesson.activityCraft?.name || 'Activity'}>{lesson.activityCraft?.steps?.map((step, index) => <p key={step} className="text-xs leading-relaxed"><span className="mr-2 font-bold text-violet-500">{index + 1}.</span>{step}</p>)}</LessonCard>
                                    <LessonCard isLight={isLight} icon={MessageSquare} title="Discussion prompts">{lesson.discussionQuestions?.map((question) => <p key={question} className="text-xs leading-relaxed">• {question}</p>)}</LessonCard>
                                </div>

                                <section className={`rounded-[2rem] border p-6 sm:p-7 ${isLight ? 'border-emerald-200 bg-emerald-50/60' : 'border-emerald-300/12 bg-emerald-300/[0.035]'}`}>
                                    <div className="flex items-start gap-3"><Users className={`mt-0.5 h-5 w-5 shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`} /><div><p className={`text-sm font-semibold ${isLight ? 'text-stone-900' : 'text-white'}`}>Safeguarding review before use</p><p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{lesson.safeguardingNote}</p></div></div>
                                </section>

                                <div className="flex flex-wrap gap-3"><Link href="/scripture/immersion" className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-bold ${isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950'}`}><BookOpen className="h-4 w-4" /> Verify in Scripture</Link><Link href="/pastoral/hub" className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-bold ${isLight ? 'border-stone-200 text-stone-700' : 'border-white/10 text-slate-300'}`}>Leader guidance <ArrowRight className="h-4 w-4" /></Link></div>
                            </motion.div>
                        )}
                    </main>
                </section>
            </div>
        </div>
    );
}

function LessonCard({ isLight, icon: Icon, title, children }: { isLight: boolean; icon: typeof BookOpen; title: string; children: React.ReactNode }) {
    return <section className={`rounded-[2rem] border p-6 sm:p-7 ${isLight ? 'border-stone-200 bg-white/85' : 'border-white/8 bg-white/[0.03]'}`}><div className="flex items-center gap-3"><Icon className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-amber-300'}`} /><h3 className={`text-lg font-semibold ${isLight ? 'text-stone-900' : 'text-white'}`}>{title}</h3></div><div className={`mt-5 space-y-3 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{children}</div></section>;
}
