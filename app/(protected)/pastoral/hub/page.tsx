'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ShieldCheck, HeartHandshake, BookOpen, Send,
    User, Bot, AlertTriangle, ArrowRight, RefreshCw, Volume2, UserCheck
} from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

type Persona = 'pastor' | 'prayer_warrior' | 'counselor';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    persona: Persona;
    timestamp: Date;
    verses?: string[];
}

const PERSONA_CONFIGS: Record<Persona, { title: string; badge: string; icon: any; color: string; desc: string }> = {
    pastor: {
        title: 'AI Lead Pastor',
        badge: '📖 Exegesis & Theology',
        icon: BookOpen,
        color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
        desc: 'Shepherding your heart with biblical wisdom, leadership guidance, and sound doctrine.'
    },
    prayer_warrior: {
        title: 'AI Prayer Warrior',
        badge: '⚔️ Intercession & Deliverance',
        icon: HeartHandshake,
        color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
        desc: 'Standing with you in fervent prayer, spiritual warfare, and physical healing.'
    },
    counselor: {
        title: 'AI Biblical Counselor',
        badge: '🛡️ Heart & Mental Wellbeing',
        icon: ShieldCheck,
        color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10',
        desc: 'Compassionate Christian care for anxiety, grief, relationships, and emotional restoration.'
    }
};

export default function PastoralCareHubPage() {
    const [activePersona, setActivePersona] = useState<Persona>('pastor');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Peace be with you. How can we walk with you today? Describe what you are experiencing, and our AI Triage engine will route you to the best spiritual companion.',
            persona: 'pastor',
            timestamp: new Date(),
            verses: ['Psalm 23:1']
        }
    ]);

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [triageNotice, setTriageNotice] = useState<string | null>(null);
    const [humanEscalationNeeded, setHumanEscalationNeeded] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userText = input.trim();
        setInput('');

        const userMsg: Message = {
            id: `u-${Date.now()}`,
            role: 'user',
            content: userText,
            persona: activePersona,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        setTriageNotice(null);

        try {
            // Call Intelligent Triage API
            const res = await fetch('/api/ai/triage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userText, requestedPersona: activePersona })
            });

            const data = await res.json();

            if (data.recommendedPersona && data.recommendedPersona !== activePersona) {
                setActivePersona(data.recommendedPersona);
                setTriageNotice(`✨ Auto-Triaged: ${data.triageReason}`);
            }

            if (data.escalateToHumanPastor) {
                setHumanEscalationNeeded(true);
            }

            const aiMsg: Message = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: data.initialResponse || 'I am standing with you in faith.',
                persona: data.recommendedPersona || activePersona,
                timestamp: new Date(),
                verses: data.suggestedVerses || []
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [
                ...prev,
                {
                    id: `err-${Date.now()}`,
                    role: 'assistant',
                    content: 'The Lord is close to all who call on Him in truth. Let us lift your request in prayer right now.',
                    persona: activePersona,
                    timestamp: new Date(),
                    verses: ['Psalm 145:18']
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const currentConfig = PERSONA_CONFIGS[activePersona];
    const ActiveIcon = currentConfig.icon;

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-950 text-slate-100">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 mb-3">
                        <Sparkles className="w-4 h-4 animate-pulse" /> Intelligent Dynamic Spiritual Companion Studio
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Pastoral Care & Dynamic Triage Hub</h1>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto">
                        Speak freely. Our AI Triage engine automatically pairs you with your ideal companion — Pastor, Prayer Warrior, or Biblical Counselor.
                    </p>
                </div>

                {/* Persona Switcher Tabs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    {(Object.keys(PERSONA_CONFIGS) as Persona[]).map(pKey => {
                        const conf = PERSONA_CONFIGS[pKey];
                        const IconComp = conf.icon;
                        const isSelected = activePersona === pKey;
                        return (
                            <button
                                key={pKey}
                                onClick={() => setActivePersona(pKey)}
                                className={`p-4 rounded-2xl border text-left transition-all ${
                                    isSelected
                                        ? `${conf.color} bg-slate-900 shadow-xl ring-1 ring-amber-500/30`
                                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 font-bold text-sm text-white">
                                        <IconComp className="w-4 h-4" /> {conf.title}
                                    </div>
                                    {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                                </div>
                                <p className="text-xs opacity-80 leading-relaxed">{conf.desc}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Triage Auto-Notification Banner */}
                {triageNotice && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4 text-xs text-amber-300 font-semibold flex items-center justify-between">
                        <span>{triageNotice}</span>
                        <button onClick={() => setTriageNotice(null)} className="text-slate-400 hover:text-white">✕</button>
                    </motion.div>
                )}

                {/* Human Pastor Escalation Banner */}
                {humanEscalationNeeded && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-200 shadow-xl">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                            <span>This situation calls for personal human care. Would you like us to dispatch a request to a local human Pastor?</span>
                        </div>
                        <a href="/aid-request/emergency" className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl flex items-center gap-1">
                            <UserCheck className="w-4 h-4" /> Request Human Pastor Call
                        </a>
                    </motion.div>
                )}

                {/* Chat Container */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[520px]">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {messages.map(m => {
                            const isUser = m.role === 'user';
                            const conf = PERSONA_CONFIGS[m.persona];
                            return (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                                        isUser ? 'bg-slate-800 text-slate-200' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    }`}>
                                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>

                                    <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                                        isUser
                                            ? 'bg-amber-500 text-slate-950 font-semibold rounded-tr-none'
                                            : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none space-y-3'
                                    }`}>
                                        {!isUser && (
                                            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-[10px]">
                                                <span className="font-bold text-amber-400">{conf.title}</span>
                                                <span className="text-slate-500">{conf.badge}</span>
                                            </div>
                                        )}

                                        <div>{m.content}</div>

                                        {!isUser && m.verses && m.verses.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-2">
                                                {m.verses.map(v => (
                                                    <span key={v} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded text-[10px]">
                                                        📖 {v}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {!isUser && (
                                            <div className="pt-2 border-t border-slate-900">
                                                <VoicePlayer text={m.content} context="pastoral" label="Listen Audio" compact />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Bar */}
                    <form onSubmit={handleSend} className="pt-4 border-t border-slate-800 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={`Message your ${currentConfig.title} or describe any spiritual need...`}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span>Send</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
