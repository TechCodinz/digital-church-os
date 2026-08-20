'use client';

import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Heart,
    Home,
    Loader2,
    Plus,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { VoicePlayer } from '@/components/ai/VoicePlayer';
import { ScriptureReference } from '@/components/scripture/ScriptureReference';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

type FamilyPrayerItem = {
    id: string;
    person: string;
    need: string;
    date: string;
    markedAnswered: boolean;
};

type FamilyGuide = {
    title: string;
    familyScriptureAnchor?: string;
    reflection?: string;
    familyPrayerScript?: string;
    peaceRoadmapSteps?: string[];
    audioDevotionalScript?: string;
    boundaryNote?: string;
    generatedBy?: string;
};

export default function FamilyDevotionalPage() {
    const { theme } = useSanctuaryTheme();
    const isLight = theme === 'light';
    const [familyName, setFamilyName] = useState('');
    const [culturalTradition, setCulturalTradition] = useState('');
    const [doctrinalStyle, setDoctrinalStyle] = useState('');
    const [lifestyleRhythm, setLifestyleRhythm] = useState('10-minute evening devotional');
    const [person, setPerson] = useState('');
    const [need, setNeed] = useState('');
    const [items, setItems] = useState<FamilyPrayerItem[]>([]);
    const [guide, setGuide] = useState<FamilyGuide | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const addPrayer = (event: FormEvent) => {
        event.preventDefault();
        if (!need.trim()) return;
        setItems((current) => [{
            id: `family-${Date.now()}`,
            person: person.trim() || 'Our household',
            need: need.trim(),
            date: new Date().toISOString(),
            markedAnswered: false,
        }, ...current]);
        setPerson('');
        setNeed('');
    };

    const toggleAnswered = (id: string) => {
        setItems((current) => current.map((item) => item.id === id ? { ...item, markedAnswered: !item.markedAnswered } : item));
    };

    const generateGuide = async () => {
        setLoading(true);
        setError('');
        setGuide(null);
        try {
            const response = await fetch('/api/family/prayer-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    familyName: familyName.trim() || 'Our Family',
                    culturalTradition,
                    doctrinalStyle,
                    familyBattles: items.map((item) => `${item.person}: ${item.need}`),
                    lifestyleRhythm,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.title) throw new Error(data.error || 'Unable to prepare family devotional.');
            setGuide(data);
        } catch (guideError: any) {
            setError(guideError?.message || 'Unable to prepare the family devotional.');
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
                            <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/18 bg-rose-300/7 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-rose-200"><Home className="h-3.5 w-3.5" /> Family altar</div>
                            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.03]">A private household sanctuary built from your real family, not invented demo lives.</h1>
                            <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-400">Record what your household wants to pray about, prepare a gentle Scripture-centered devotional, listen together, and mark your own memories without the AI claiming hidden spiritual insight into your family.</p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <button onClick={generateGuide} disabled={loading} className="sacred-primary-button disabled:opacity-45">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Prepare family devotional</button>
                                <Link href="/prayer-room" className="sacred-secondary-button"><Heart className="h-4 w-4" /> Prayer Room</Link>
                            </div>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                            <ShieldCheck className="h-5 w-5 text-emerald-300" />
                            <h2 className="mt-4 text-lg font-semibold">Private reflection, not spiritual surveillance</h2>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">The family assistant uses only what you provide. It does not diagnose children, detect curses, infer God’s private message, promise healing, or determine whether a prayer was objectively answered.</p>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid xl:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
                    <aside className={`rounded-[2rem] border p-6 xl:sticky xl:top-24 ${isLight ? 'border-stone-200 bg-white/85' : 'border-white/8 bg-white/[0.03]'}`}>
                        <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-rose-300'}`}>Household rhythm</p>
                        <div className="mt-5 space-y-4">
                            <Field label="Family / household name" value={familyName} onChange={setFamilyName} placeholder="Our family" isLight={isLight} />
                            <Field label="Tradition or cultural context (optional)" value={culturalTradition} onChange={setCulturalTradition} placeholder="Optional context" isLight={isLight} />
                            <Field label="Doctrinal preference (optional)" value={doctrinalStyle} onChange={setDoctrinalStyle} placeholder="Optional preference" isLight={isLight} />
                            <label className="block">
                                <span className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>Preferred rhythm</span>
                                <select value={lifestyleRhythm} onChange={(event) => setLifestyleRhythm(event.target.value)} className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-[#07110f]'}`}>
                                    <option>10-minute evening devotional</option>
                                    <option>Morning breakfast prayer</option>
                                    <option>Bedtime family blessing</option>
                                    <option>Weekend family worship hour</option>
                                </select>
                            </label>
                        </div>

                        <form onSubmit={addPrayer} className={`mt-6 border-t pt-6 ${isLight ? 'border-stone-100' : 'border-white/7'}`}>
                            <p className={`text-xs font-semibold ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>Add something to remember in prayer</p>
                            <div className="mt-3 space-y-3">
                                <Field label="Person / people" value={person} onChange={setPerson} placeholder="Mom, Dad, everyone…" isLight={isLight} />
                                <label className="block">
                                    <span className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>Prayer need, gratitude, or concern</span>
                                    <textarea value={need} onChange={(event) => setNeed(event.target.value)} rows={4} required placeholder="Share only what you want stored in this session…" className={`mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-rose-300/15 ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-black/18'}`} />
                                </label>
                                <button type="submit" className={`sacred-focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl text-xs font-bold ${isLight ? 'bg-stone-900 text-white' : 'bg-rose-300 text-slate-950'}`}><Plus className="h-4 w-4" /> Add to family prayer list</button>
                            </div>
                        </form>
                    </aside>

                    <main className="space-y-6 min-w-0">
                        <section className={`rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-stone-200 bg-white/85' : 'border-white/8 bg-white/[0.03]'}`}>
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-rose-300'}`}>Family prayer memory</p>
                                    <h2 className={`mt-3 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>What your household has chosen to carry.</h2>
                                </div>
                                <Users className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-rose-300'}`} />
                            </div>

                            {items.length === 0 ? (
                                <div className={`mt-6 rounded-3xl border border-dashed p-10 text-center ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/10 bg-black/12'}`}>
                                    <Heart className={`mx-auto h-6 w-6 ${isLight ? 'text-stone-300' : 'text-slate-700'}`} />
                                    <p className={`mt-4 text-sm ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>No invented prayer requests are preloaded. Add only what belongs to your household.</p>
                                </div>
                            ) : (
                                <div className="mt-6 space-y-3">
                                    {items.map((item) => (
                                        <button key={item.id} onClick={() => toggleAnswered(item.id)} className={`sacred-focus-ring w-full rounded-2xl border p-4 text-left transition-all ${item.markedAnswered ? isLight ? 'border-emerald-200 bg-emerald-50/70' : 'border-emerald-300/14 bg-emerald-300/[0.04]' : isLight ? 'border-stone-100 bg-[#fbf8f3]' : 'border-white/7 bg-black/15'}`}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className={`text-xs font-semibold ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>{item.person}</p>
                                                    <p className={`mt-2 text-sm leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{item.need}</p>
                                                    <p className={`mt-2 text-[9px] ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>{new Date(item.date).toLocaleDateString()}</p>
                                                </div>
                                                <CheckCircle2 className={`h-5 w-5 shrink-0 ${item.markedAnswered ? 'text-emerald-500' : isLight ? 'text-stone-200' : 'text-slate-700'}`} />
                                            </div>
                                            <p className={`mt-3 text-[9px] font-semibold uppercase tracking-[0.13em] ${item.markedAnswered ? 'text-emerald-600' : isLight ? 'text-stone-400' : 'text-slate-600'}`}>{item.markedAnswered ? 'Your family marked this answered' : 'Tap when your family wants to mark it answered'}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        {error && <div className={`rounded-2xl border p-4 text-xs ${isLight ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-rose-300/15 bg-rose-300/[0.04] text-rose-300'}`}>{error}</div>}

                        {guide ? (
                            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] p-6 sm:p-8 text-white">
                                    <div className="absolute inset-0 sanctuary-radiance opacity-70" aria-hidden="true" />
                                    <div className="relative">
                                        <p className="sanctuary-section-label text-amber-300">Family devotional draft</p>
                                        <h2 className="mt-3 text-3xl sm:text-4xl font-light">{guide.title}</h2>
                                        {guide.familyScriptureAnchor && <div className="mt-5"><ScriptureReference reference={guide.familyScriptureAnchor} /></div>}
                                        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/12 bg-amber-300/[0.035] p-4 text-[10px] leading-relaxed text-slate-500"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" /> {guide.boundaryNote}</div>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-5">
                                    <div className={`rounded-[2rem] border p-6 ${isLight ? 'border-stone-200 bg-white/85' : 'border-white/8 bg-white/[0.03]'}`}>
                                        <BookOpen className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                                        <h3 className={`mt-4 text-lg font-semibold ${isLight ? 'text-stone-900' : 'text-white'}`}>Reflection</h3>
                                        <p className={`mt-3 text-sm leading-7 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{guide.reflection}</p>
                                        {guide.familyPrayerScript && <div className={`mt-5 rounded-2xl border p-4 text-sm leading-7 ${isLight ? 'border-sage-100 bg-sage-50/60 text-stone-700' : 'border-emerald-300/10 bg-emerald-300/[0.035] text-slate-300'}`}>{guide.familyPrayerScript}</div>}
                                    </div>
                                    <div className={`rounded-[2rem] border p-6 ${isLight ? 'border-stone-200 bg-white/85' : 'border-white/8 bg-white/[0.03]'}`}>
                                        <Sparkles className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-rose-300'}`} />
                                        <h3 className={`mt-4 text-lg font-semibold ${isLight ? 'text-stone-900' : 'text-white'}`}>Simple household steps</h3>
                                        <div className="mt-4 space-y-3">{guide.peaceRoadmapSteps?.map((step, index) => <div key={step} className={`rounded-2xl border p-4 ${isLight ? 'border-stone-100 bg-[#fbf8f3]' : 'border-white/7 bg-black/15'}`}><span className={`text-[9px] font-bold ${isLight ? 'text-sage-700' : 'text-rose-300'}`}>0{index + 1}</span><p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{step}</p></div>)}</div>
                                    </div>
                                </div>

                                {guide.audioDevotionalScript && <div className="sacred-panel-dark p-6 text-white"><VoicePlayer text={guide.audioDevotionalScript} context="prayer" emotion="tender" label="Listen to family devotional" /><p className="mt-3 text-[10px] leading-relaxed text-slate-600">Audio reads the generated devotional draft; it is not a claim of divine speech or presence generated by the system.</p></div>}
                            </motion.section>
                        ) : (
                            <div className={`rounded-[2rem] border border-dashed p-10 text-center ${isLight ? 'border-stone-200 bg-white/60' : 'border-white/10 bg-white/[0.02]'}`}>
                                <BookOpen className={`mx-auto h-6 w-6 ${isLight ? 'text-stone-300' : 'text-slate-700'}`} />
                                <p className={`mt-4 text-sm ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>No family guide is generated until your household asks for one.</p>
                            </div>
                        )}
                    </main>
                </section>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, isLight }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; isLight: boolean }) {
    return <label className="block"><span className={`text-xs font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-300/15 ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-black/18'}`} /></label>;
}
