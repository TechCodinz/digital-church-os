'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    Bot,
    Heart,
    HeartHandshake,
    Loader2,
    MessageSquare,
    Send,
    ShieldCheck,
    Sparkles,
    Swords,
    User,
    UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { ScriptureReference, ScriptureText } from '@/components/scripture/ScriptureReference';
import { ShareButton } from '@/components/sharing/ShareButton';
import { VoicePlayer } from '@/components/ai/VoicePlayer';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

type Persona = 'pastor' | 'prayer_warrior' | 'counselor' | 'apologist';
type RiskLevel = 'normal' | 'sensitive' | 'urgent';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    persona: Persona;
    verses?: string[];
};

const MODES: Record<Persona, { title: string; eyebrow: string; description: string; icon: typeof BookOpen }> = {
    pastor: {
        title: 'Scripture Guide',
        eyebrow: 'Study & spiritual reflection',
        description: 'Explore Scripture, doctrine, discipleship questions, and possible next steps without pretending the AI holds pastoral office.',
        icon: BookOpen,
    },
    prayer_warrior: {
        title: 'Prayer Companion',
        eyebrow: 'Put a burden into prayer',
        description: 'Shape humble Scripture-grounded prayer without promising healing, deliverance, miracles, or a particular outcome.',
        icon: Heart,
    },
    counselor: {
        title: 'Gentle Reflection',
        eyebrow: 'Slow down difficult moments',
        description: 'Non-clinical reflection for grief, relationships, anxiety, loss, or emotional burdens, with human support kept close.',
        icon: HeartHandshake,
    },
    apologist: {
        title: 'Will — Apologetics Guide',
        eyebrow: 'Questions, objections & faith',
        description: 'Explore evidence, logic, historical claims, and Scripture while keeping disagreement respectful and uncertainty visible.',
        icon: Swords,
    },
};

export default function PastoralCareHubPage() {
    const { theme } = useSanctuaryTheme();
    const [activePersona, setActivePersona] = useState<Persona>('pastor');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            persona: 'pastor',
            content: 'You can begin with a question, a burden, a prayer request, or something you are trying to understand. I can help with Scripture and reflection, and I will keep human pastoral care visible when the situation deserves a person.',
            verses: ['Psalm 23:1-4'],
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [triageNotice, setTriageNotice] = useState('');
    const [riskLevel, setRiskLevel] = useState<RiskLevel>('normal');
    const [humanCareRecommended, setHumanCareRecommended] = useState(false);
    const [lastTopic, setLastTopic] = useState<string | null>(null);
    const [careRequestOpen, setCareRequestOpen] = useState(false);
    const [careConcern, setCareConcern] = useState('');
    const [careSubmitting, setCareSubmitting] = useState(false);
    const [careStatus, setCareStatus] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const isLight = theme === 'light';
    const currentMode = MODES[activePersona];

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async (event?: FormEvent) => {
        event?.preventDefault();
        const userText = input.trim();
        if (!userText || loading) return;

        setMessages((previous) => [...previous, { id: `u-${Date.now()}`, role: 'user', content: userText, persona: activePersona }]);
        setInput('');
        setLoading(true);
        setTriageNotice('');

        try {
            if (activePersona === 'apologist') {
                const history = messages
                    .filter((message) => message.persona === 'apologist')
                    .map((message) => ({ role: message.role, content: message.content }));

                const response = await fetch('/api/ai/apologist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userText, history, lastTopic }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Apologetics guide unavailable');
                if (data.topic) setLastTopic(data.topic);
                setMessages((previous) => [...previous, {
                    id: `a-${Date.now()}`,
                    role: 'assistant',
                    persona: 'apologist',
                    content: data.response || 'I can help examine that question carefully.',
                    verses: Array.isArray(data.suggestedVerses) ? data.suggestedVerses : [],
                }]);
                return;
            }

            const response = await fetch('/api/ai/triage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userText, requestedPersona: activePersona }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Guide unavailable');

            const recommended = (data.recommendedPersona || activePersona) as Persona;
            if (MODES[recommended] && recommended !== activePersona) {
                setActivePersona(recommended);
                setTriageNotice(data.triageReason || `Moved to ${MODES[recommended].title}.`);
            } else if (data.triageReason) {
                setTriageNotice(data.triageReason);
            }

            const nextRisk: RiskLevel = data.riskLevel === 'urgent' || data.riskLevel === 'sensitive' ? data.riskLevel : 'normal';
            setRiskLevel(nextRisk);
            setHumanCareRecommended(Boolean(data.humanCareRecommended || data.escalateToHumanPastor));

            if (nextRisk !== 'normal' && !careConcern) setCareConcern(userText);
            if (data.topic) setLastTopic(data.topic);

            setMessages((previous) => [...previous, {
                id: `a-${Date.now()}`,
                role: 'assistant',
                persona: MODES[recommended] ? recommended : activePersona,
                content: data.initialResponse || 'I can help you slow this down and identify a thoughtful next step.',
                verses: Array.isArray(data.suggestedVerses) ? data.suggestedVerses : [],
            }]);
        } catch {
            setMessages((previous) => [...previous, {
                id: `err-${Date.now()}`,
                role: 'assistant',
                persona: activePersona,
                content: 'The intelligent guide is unavailable right now. You can still open Scripture, move to the Prayer Room, or record a request for human pastoral follow-up.',
                verses: [],
            }]);
        } finally {
            setLoading(false);
        }
    };

    const submitCareRequest = async () => {
        if (!careConcern.trim() || careSubmitting) return;
        setCareSubmitting(true);
        setCareStatus('');

        try {
            const response = await fetch('/api/pastoral/care-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ concern: careConcern.trim(), urgency: riskLevel }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to record request');
            setCareStatus(data.message || 'Pastoral follow-up request recorded.');
        } catch (error: any) {
            setCareStatus(error?.message || 'Unable to record the request. Sign in and try again.');
        } finally {
            setCareSubmitting(false);
        }
    };

    return (
        <div className={`sanctuary-page-shell min-h-screen pt-24 pb-24 ${isLight ? 'bg-[#f8f3eb]/92 text-stone-900' : 'bg-[#020807]/92 text-white'}`}>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] px-6 py-10 sm:px-10 sm:py-12 text-white shadow-2xl shadow-black/25">
                    <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
                    <div className="relative grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-end">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/18 bg-amber-300/7 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-amber-200">
                                <HeartHandshake className="h-3.5 w-3.5" /> Pastoral care gateway
                            </div>
                            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.03]">Intelligence for the first conversation. People for the care that needs people.</h1>
                            <p className="mt-5 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-400">Start with Scripture, prayer, difficult questions, or gentle reflection. The AI remains a bounded companion while accountable human pastoral care stays visible throughout the journey.</p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <button onClick={() => setCareRequestOpen(true)} className="sacred-primary-button"><UserCheck className="h-4 w-4" /> Request human follow-up</button>
                                <Link href="/minister/study" className="sacred-secondary-button"><BookOpen className="h-4 w-4" /> Pastor Study Desk</Link>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                            <ShieldCheck className="h-5 w-5 text-emerald-300" />
                            <h2 className="mt-4 text-lg font-semibold">Clear roles, clear boundaries</h2>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">The guide does not claim pastoral office, clinical credentials, prophecy, divine messages, healing authority, or emergency-response capability. Sensitive situations are routed toward real human support.</p>
                        </div>
                    </div>
                </section>

                {humanCareRecommended && (
                    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-5 rounded-3xl border p-5 sm:p-6 ${riskLevel === 'urgent' ? 'border-rose-400/25 bg-rose-400/[0.06]' : isLight ? 'border-amber-200 bg-amber-50' : 'border-amber-300/16 bg-amber-300/[0.04]'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <AlertTriangle className={`h-5 w-5 shrink-0 ${riskLevel === 'urgent' ? 'text-rose-400' : 'text-amber-400'}`} />
                            <div className="flex-1">
                                <h2 className={`text-sm font-semibold ${isLight ? 'text-stone-900' : 'text-white'}`}>{riskLevel === 'urgent' ? 'Immediate human support may be important' : 'A person may be the better next step'}</h2>
                                <p className={`mt-1 text-xs leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{riskLevel === 'urgent' ? 'If there is immediate danger, contact local emergency services or a trusted person nearby now. This app is not an emergency service.' : 'You can record a pastoral follow-up request instead of relying only on generated guidance.'}</p>
                            </div>
                            <button onClick={() => setCareRequestOpen(true)} className={`sacred-focus-ring rounded-full px-4 py-2.5 text-xs font-bold ${riskLevel === 'urgent' ? 'bg-rose-500 text-white' : isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950'}`}>Human follow-up</button>
                        </div>
                    </motion.section>
                )}

                <section className="mt-6 grid xl:grid-cols-[300px_minmax(0,1fr)] gap-5 items-start">
                    <aside className="space-y-3 xl:sticky xl:top-24">
                        <div className={`rounded-3xl border p-3 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.025]'}`}>
                            <p className={`px-2 pt-2 pb-3 sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Choose a support mode</p>
                            <div className="space-y-2">
                                {(Object.keys(MODES) as Persona[]).map((key) => {
                                    const mode = MODES[key];
                                    const Icon = mode.icon;
                                    const selected = activePersona === key;
                                    return (
                                        <button key={key} onClick={() => setActivePersona(key)} className={`sacred-focus-ring w-full rounded-2xl border p-4 text-left transition-all ${selected ? isLight ? 'border-sage-300 bg-sage-50' : 'border-amber-300/20 bg-amber-300/[0.055]' : isLight ? 'border-transparent hover:border-stone-200 hover:bg-[#fbf8f3]' : 'border-transparent hover:border-white/8 hover:bg-white/[0.035]'}`}>
                                            <div className="flex items-start gap-3">
                                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected ? isLight ? 'bg-white text-sage-700' : 'bg-amber-300/10 text-amber-300' : isLight ? 'bg-white text-stone-400' : 'bg-white/[0.035] text-slate-500'}`}><Icon className="h-4 w-4" /></span>
                                                <span>
                                                    <span className={`block text-xs font-semibold ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>{mode.title}</span>
                                                    <span className={`mt-1 block text-[9px] uppercase tracking-[0.13em] ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>{mode.eyebrow}</span>
                                                </span>
                                            </div>
                                            <p className={`mt-3 text-[10px] leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-600'}`}>{mode.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <Link href="/prayer-room" className="sacred-panel-dark group block p-5 text-white">
                            <Heart className="h-4 w-4 text-rose-300" />
                            <h3 className="mt-4 text-sm font-semibold">Prefer prayer instead?</h3>
                            <p className="mt-2 text-[10px] leading-relaxed text-slate-600">Move into the dedicated Prayer Room with privacy and community intercession options.</p>
                            <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold text-amber-300">Open Prayer Room <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" /></span>
                        </Link>
                    </aside>

                    <div className={`rounded-[2rem] border overflow-hidden ${isLight ? 'border-stone-200 bg-white/85 shadow-xl shadow-stone-200/20' : 'border-white/8 bg-white/[0.03]'}`}>
                        <div className={`border-b px-5 py-5 sm:px-6 ${isLight ? 'border-stone-100' : 'border-white/8'}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-amber-300'}`}>{currentMode.eyebrow}</p>
                                    <h2 className={`mt-2 text-xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>{currentMode.title}</h2>
                                </div>
                                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isLight ? 'bg-[#fbf8f3] text-sage-700' : 'bg-white/[0.04] text-amber-300'}`}><Bot className="h-4 w-4" /></span>
                            </div>
                            {triageNotice && <p className={`mt-4 rounded-2xl border px-4 py-3 text-[10px] leading-relaxed ${isLight ? 'border-sage-100 bg-sage-50 text-sage-800' : 'border-emerald-300/10 bg-emerald-300/[0.035] text-emerald-300'}`}>{triageNotice}</p>}
                        </div>

                        <div className="h-[500px] overflow-y-auto custom-scrollbar px-4 py-5 sm:px-6 space-y-4">
                            {messages.map((message) => {
                                const isUser = message.role === 'user';
                                const mode = MODES[message.persona];
                                return (
                                    <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isUser ? isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950' : isLight ? 'bg-sage-50 text-sage-700' : 'bg-emerald-300/8 text-emerald-300'}`}>
                                            {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                                        </span>
                                        <div className={`max-w-[85%] rounded-2xl p-4 ${isUser ? isLight ? 'bg-stone-900 text-white rounded-tr-md' : 'bg-amber-200 text-slate-950 rounded-tr-md' : isLight ? 'border border-stone-100 bg-[#fbf8f3] text-stone-700 rounded-tl-md' : 'border border-white/7 bg-black/16 text-slate-300 rounded-tl-md'}`}>
                                            {!isUser && <p className={`mb-3 text-[9px] font-bold uppercase tracking-[0.16em] ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>{mode.title}</p>}
                                            <div className="whitespace-pre-line text-xs sm:text-sm leading-6">{isUser ? message.content : <ScriptureText text={message.content} />}</div>
                                            {!isUser && message.verses?.length ? <div className="mt-4 flex flex-wrap gap-2">{message.verses.map((verse) => <ScriptureReference key={verse} reference={verse} />)}</div> : null}
                                            {!isUser && (
                                                <div className={`mt-4 flex flex-wrap items-center gap-4 border-t pt-3 ${isLight ? 'border-stone-200' : 'border-white/7'}`}>
                                                    <VoicePlayer text={message.content} context="pastoral" label="Listen" compact />
                                                    {message.persona === 'apologist' && <ShareButton kind="apologist" title="Faith reflection" text={message.content.slice(0, 200)} reference={message.verses?.[0]} author="Will · Apologetics Guide" compact />}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {loading && <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-stone-400' : 'text-slate-600'}`}><Loader2 className="h-4 w-4 animate-spin" /> Preparing a bounded response…</div>}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSend} className={`border-t p-4 sm:p-5 ${isLight ? 'border-stone-100 bg-[#fffdf9]' : 'border-white/8 bg-black/12'}`}>
                            <div className={`flex items-end gap-3 rounded-2xl border p-3 ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-black/18'}`}>
                                <MessageSquare className={`mb-2 h-4 w-4 shrink-0 ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                                <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Write to ${currentMode.title}…`} rows={2} className={`flex-1 resize-none bg-transparent py-1 text-sm leading-relaxed outline-none ${isLight ? 'text-stone-900 placeholder:text-stone-400' : 'text-white placeholder:text-slate-700'}`} />
                                <button type="submit" disabled={loading || !input.trim()} className={`sacred-focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl disabled:opacity-35 ${isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950'}`} aria-label="Send"><Send className="h-4 w-4" /></button>
                            </div>
                            <p className={`mt-3 flex items-start gap-2 text-[9px] leading-relaxed ${isLight ? 'text-stone-400' : 'text-slate-600'}`}><ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" /> AI responses are reflective assistance, not clergy, clinical care, prophecy, diagnosis, or emergency service.</p>
                        </form>
                    </div>
                </section>
            </div>

            {careRequestOpen && (
                <div className="fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto bg-black/75 px-4 py-16 backdrop-blur-xl">
                    <motion.div initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`w-full max-w-xl rounded-[2rem] border p-6 sm:p-8 shadow-2xl ${isLight ? 'border-stone-200 bg-[#fffdf9] text-stone-900' : 'border-white/10 bg-[#07110f] text-white'}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-amber-300'}`}>Human pastoral follow-up</p>
                                <h2 className="mt-3 text-2xl font-light">Record what you want a person to follow up on.</h2>
                            </div>
                            <button onClick={() => setCareRequestOpen(false)} className={`rounded-full px-3 py-2 text-xs ${isLight ? 'bg-stone-100 text-stone-600' : 'bg-white/[0.05] text-slate-400'}`}>Close</button>
                        </div>
                        <p className={`mt-4 text-xs leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>This records a request. Until a connected church workspace assigns it, the app will not claim that a particular pastor has accepted the case.</p>
                        <textarea value={careConcern} onChange={(event) => setCareConcern(event.target.value)} rows={6} placeholder="Describe the kind of pastoral follow-up you want…" className={`mt-5 w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-amber-300/15 ${isLight ? 'border-stone-200 bg-[#fbf8f3]' : 'border-white/8 bg-black/18'}`} />
                        {careStatus && <p className={`mt-4 rounded-2xl border p-3 text-xs leading-relaxed ${isLight ? 'border-sage-100 bg-sage-50 text-sage-800' : 'border-emerald-300/10 bg-emerald-300/[0.035] text-emerald-300'}`}>{careStatus}</p>}
                        <button onClick={submitCareRequest} disabled={careSubmitting || !careConcern.trim()} className={`mt-5 sacred-focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold disabled:opacity-40 ${isLight ? 'bg-stone-900 text-white' : 'bg-amber-200 text-slate-950'}`}>
                            {careSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Recording request…</> : <><UserCheck className="h-4 w-4" /> Record human follow-up request</>}
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
