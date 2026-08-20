'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Compass,
    Eye,
    Feather,
    Focus,
    Heart,
    MapPin,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

type Lens = 'observe' | 'context' | 'reflect';

type ScriptureSite = {
    id: string;
    name: string;
    region: string;
    period: string;
    reference: string;
    setting: string;
    context: string;
    observationPrompts: string[];
    reflectionPrompts: string[];
    accent: string;
};

const SITES: ScriptureSite[] = [
    {
        id: 'olives',
        name: 'Mount of Olives',
        region: 'Jerusalem',
        period: 'New Testament setting',
        reference: 'Luke 22:39–46',
        setting: 'A ridge east of Jerusalem associated with prayer, teaching, the final week of Jesus’ ministry, and the route toward Bethany.',
        context: 'Luke places this prayer scene immediately before Jesus’ arrest. Read the surrounding chapter to notice the meal, the disciples’ conversation, Jesus’ warning, and the movement toward the garden.',
        observationPrompts: [
            'What actions are explicitly described in the passage?',
            'What does Jesus ask the disciples to do?',
            'Which details belong to the text, and which ideas might be assumptions you bring to it?',
        ],
        reflectionPrompts: [
            'What does the passage reveal about prayer under pressure?',
            'Where do you see obedience, fear, surrender, or companionship in the scene?',
            'What is one response you can carry into prayer without claiming the text promises a specific outcome?',
        ],
        accent: 'from-amber-300/18 via-emerald-300/7 to-transparent',
    },
    {
        id: 'galilee',
        name: 'Sea of Galilee',
        region: 'Galilee',
        period: 'Ministry of Jesus',
        reference: 'Mark 4:35–41',
        setting: 'A freshwater lake in northern Israel surrounded by fishing communities and hills, central to many Gospel narratives.',
        context: 'Mark’s account moves from teaching by the sea into an overnight crossing. Notice who initiates the crossing, the disciples’ fear, Jesus’ response, and the final question the disciples ask.',
        observationPrompts: [
            'What changes between the beginning and end of the scene?',
            'What do the disciples say before Jesus addresses the storm?',
            'What question does Jesus ask them afterward?',
        ],
        reflectionPrompts: [
            'How does the passage hold fear and trust together?',
            'What does the disciples’ final question invite you to investigate elsewhere in Mark?',
            'What would a faithful response look like without turning the story into a formula for avoiding hardship?',
        ],
        accent: 'from-cyan-300/16 via-blue-300/6 to-transparent',
    },
    {
        id: 'gethsemane',
        name: 'Gethsemane',
        region: 'Kidron Valley / Mount of Olives area',
        period: 'Passion narrative',
        reference: 'Matthew 26:36–46',
        setting: 'A garden or olive-grove setting near the Mount of Olives where Matthew situates Jesus’ prayer before his arrest.',
        context: 'Read from the Passover meal through the arrest narrative. Matthew repeats elements of Jesus’ prayer and the disciples’ sleep, creating a rhythm that rewards slow observation.',
        observationPrompts: [
            'Which words or actions repeat in the scene?',
            'What emotions does Matthew explicitly attribute to Jesus?',
            'How do the disciples respond across the repeated moments?',
        ],
        reflectionPrompts: [
            'What does this scene show about honest prayer and costly obedience?',
            'How might repetition function in prayer when circumstances have not changed?',
            'Who could accompany you in a difficult season rather than leaving you to carry it alone?',
        ],
        accent: 'from-emerald-300/16 via-amber-300/5 to-transparent',
    },
];

export default function ScriptureImmersionPage() {
    const { theme } = useSanctuaryTheme();
    const [selectedId, setSelectedId] = useState(SITES[0].id);
    const [lens, setLens] = useState<Lens>('observe');
    const [focusMode, setFocusMode] = useState(false);

    const selectedSite = useMemo(() => SITES.find((site) => site.id === selectedId) || SITES[0], [selectedId]);
    const isLight = theme === 'light';

    const lenses = [
        { id: 'observe' as const, label: 'Observe', icon: Eye, note: 'Start with what the passage actually says.' },
        { id: 'context' as const, label: 'Context', icon: Compass, note: 'Place the passage in geography and narrative flow.' },
        { id: 'reflect' as const, label: 'Reflect', icon: Heart, note: 'Respond carefully after observation and context.' },
    ];

    return (
        <div className={`sanctuary-page-shell min-h-screen pt-24 pb-24 transition-colors ${isLight ? 'bg-[#f8f3eb]/92 text-stone-900' : 'bg-[#020807]/92 text-white'}`}>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {!focusMode && (
                    <header className="grid lg:grid-cols-[1fr_auto] gap-6 items-end mb-8">
                        <div>
                            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.22em] ${isLight ? 'border-sage-200 bg-white text-sage-800' : 'border-amber-300/18 bg-amber-300/7 text-amber-200'}`}>
                                <BookOpen className="h-3.5 w-3.5" /> Scripture Immersion Atlas
                            </div>
                            <h1 className={`mt-5 max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.03] ${isLight ? 'text-stone-900' : 'text-white'}`}>
                                Enter the setting. Slow the reading. See what the text actually says.
                            </h1>
                            <p className={`mt-4 max-w-3xl text-sm sm:text-base leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                                A cinematic study space built around biblical references, geographic context, observation, and reflection — without pretending a decorative screen is literal 3D reconstruction or divine revelation.
                            </p>
                        </div>
                        <button
                            onClick={() => setFocusMode(true)}
                            className={`sacred-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-xs font-bold ${isLight ? 'border-stone-200 bg-white text-stone-700 hover:border-sage-300' : 'border-white/10 bg-white/[0.035] text-slate-300 hover:border-amber-300/20'}`}
                        >
                            <Focus className="h-4 w-4" /> Focus mode
                        </button>
                    </header>
                )}

                <div className={`grid gap-6 ${focusMode ? 'max-w-5xl mx-auto' : 'xl:grid-cols-[280px_minmax(0,1fr)]'}`}>
                    {!focusMode && (
                        <aside className={`rounded-[1.75rem] border p-3 self-start xl:sticky xl:top-24 ${isLight ? 'border-stone-200 bg-white/75' : 'border-white/8 bg-white/[0.025]'}`}>
                            <p className={`px-3 pt-2 pb-3 text-[9px] font-bold uppercase tracking-[0.2em] ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>Locations</p>
                            <div className="space-y-2">
                                {SITES.map((site) => {
                                    const selected = site.id === selectedId;
                                    return (
                                        <button
                                            key={site.id}
                                            onClick={() => {
                                                setSelectedId(site.id);
                                                setLens('observe');
                                            }}
                                            className={`sacred-focus-ring w-full rounded-2xl border p-4 text-left transition-all ${selected ? isLight ? 'border-sage-300 bg-sage-50' : 'border-amber-300/22 bg-amber-300/[0.06]' : isLight ? 'border-transparent hover:border-stone-200 hover:bg-[#fbf8f3]' : 'border-transparent hover:border-white/8 hover:bg-white/[0.035]'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? isLight ? 'text-sage-700' : 'text-amber-300' : isLight ? 'text-stone-400' : 'text-slate-600'}`} />
                                                <div>
                                                    <p className={`text-xs font-semibold ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>{site.name}</p>
                                                    <p className={`mt-1 text-[10px] ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>{site.region}</p>
                                                    <p className={`mt-2 text-[9px] uppercase tracking-[0.12em] ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>{site.reference}</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>
                    )}

                    <main className="min-w-0">
                        <motion.section
                            key={selectedSite.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] text-white shadow-2xl shadow-black/25"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${selectedSite.accent}`} aria-hidden="true" />
                            <div className="absolute inset-0 sanctuary-radiance opacity-70" aria-hidden="true" />
                            <div className="sanctuary-light-column !left-[74%] !top-[-18%] !h-[90%] !opacity-40" aria-hidden="true" />

                            <div className="relative z-10 p-6 sm:p-8 lg:p-10">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-3 py-2 text-[9px] uppercase tracking-[0.18em] text-slate-400">
                                        <MapPin className="h-3 w-3 text-amber-300" /> {selectedSite.region}
                                    </span>
                                    {focusMode && (
                                        <button onClick={() => setFocusMode(false)} className="sacred-focus-ring rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold text-slate-300">Exit focus</button>
                                    )}
                                </div>

                                <div className="mt-10 max-w-3xl">
                                    <p className="sanctuary-section-label text-amber-300/75">{selectedSite.period}</p>
                                    <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">{selectedSite.name}</h2>
                                    <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-300">{selectedSite.setting}</p>
                                </div>

                                <div className="mt-10 grid md:grid-cols-[0.72fr_1.28fr] gap-4">
                                    <div className="rounded-3xl border border-amber-300/16 bg-amber-300/[0.045] p-5">
                                        <BookOpen className="h-5 w-5 text-amber-300" />
                                        <p className="mt-4 text-[9px] uppercase tracking-[0.2em] text-amber-300/70">Passage anchor</p>
                                        <p className="mt-2 text-2xl font-light text-white">{selectedSite.reference}</p>
                                        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Open the passage in your preferred Bible translation. This experience uses references rather than silently inventing or mixing translation text.</p>
                                    </div>
                                    <div className="rounded-3xl border border-white/8 bg-black/18 p-5">
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                                            <div>
                                                <p className="text-xs font-semibold text-slate-200">Study boundary</p>
                                                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Historical and interpretive notes are study aids. Distinguish the biblical text from commentary, and test application within Scripture and accountable church teaching.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        <section className={`mt-5 rounded-[2rem] border p-2 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.025]'}`}>
                            <div className="grid sm:grid-cols-3 gap-2">
                                {lenses.map((item) => {
                                    const Icon = item.icon;
                                    const selected = lens === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setLens(item.id)}
                                            className={`sacred-focus-ring rounded-2xl p-4 text-left transition-all ${selected ? isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950' : isLight ? 'text-stone-500 hover:bg-stone-50' : 'text-slate-500 hover:bg-white/[0.04]'}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <p className="mt-3 text-xs font-bold">{item.label}</p>
                                            <p className={`mt-1 text-[10px] leading-relaxed ${selected ? isLight ? 'text-stone-300' : 'text-slate-700' : isLight ? 'text-stone-400' : 'text-slate-600'}`}>{item.note}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <motion.section key={`${selectedSite.id}-${lens}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`mt-5 rounded-[2rem] border p-6 sm:p-8 ${isLight ? 'border-stone-200 bg-white/85' : 'border-white/8 bg-white/[0.03]'}`}>
                            {lens === 'observe' && (
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Eye className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-emerald-300'}`} />
                                        <div>
                                            <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Observation first</p>
                                            <h3 className={`mt-2 text-2xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Read before explaining.</h3>
                                        </div>
                                    </div>
                                    <div className="mt-6 grid gap-3">
                                        {selectedSite.observationPrompts.map((prompt, index) => (
                                            <div key={prompt} className={`rounded-2xl border p-4 ${isLight ? 'border-stone-100 bg-[#fbf8f3]' : 'border-white/7 bg-black/15'}`}>
                                                <span className={`text-[9px] font-bold ${isLight ? 'text-sage-700' : 'text-amber-300'}`}>0{index + 1}</span>
                                                <p className={`mt-2 text-sm leading-relaxed ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>{prompt}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {lens === 'context' && (
                                <div>
                                    <Compass className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                                    <p className={`mt-4 sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-amber-300'}`}>Narrative & setting</p>
                                    <h3 className={`mt-3 text-2xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Put the scene back into its world.</h3>
                                    <p className={`mt-5 max-w-3xl text-sm leading-7 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{selectedSite.context}</p>
                                    <div className={`mt-6 rounded-2xl border p-4 ${isLight ? 'border-amber-100 bg-amber-50/60' : 'border-amber-300/12 bg-amber-300/[0.035]'}`}>
                                        <p className={`text-xs font-semibold ${isLight ? 'text-amber-800' : 'text-amber-200'}`}>Useful discipline</p>
                                        <p className={`mt-2 text-[11px] leading-relaxed ${isLight ? 'text-amber-900/65' : 'text-slate-500'}`}>Read before and after the selected verses. Ask what the author is doing in the larger section before jumping to a personal application.</p>
                                    </div>
                                </div>
                            )}

                            {lens === 'reflect' && (
                                <div>
                                    <Feather className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                                    <p className={`mt-4 sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-amber-300'}`}>Reflection after study</p>
                                    <h3 className={`mt-3 text-2xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Respond without forcing certainty.</h3>
                                    <div className="mt-6 grid gap-3">
                                        {selectedSite.reflectionPrompts.map((prompt) => (
                                            <div key={prompt} className={`rounded-2xl border p-4 ${isLight ? 'border-stone-100 bg-[#fbf8f3]' : 'border-white/7 bg-black/15'}`}>
                                                <p className={`text-sm leading-relaxed ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>{prompt}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <Link href="/journal" className="sacred-primary-button group">Journal reflection <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
                                        <Link href="/prayer-room" className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-xs font-bold ${isLight ? 'border-stone-200 text-stone-700' : 'border-white/10 text-slate-300'}`}><Heart className="h-4 w-4" /> Pray with the passage</Link>
                                    </div>
                                </div>
                            )}
                        </motion.section>
                    </main>
                </div>
            </div>
        </div>
    );
}
