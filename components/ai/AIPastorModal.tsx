'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Bot, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const quickPrompts = [
    'Help me reflect on a difficult decision',
    'Give me scripture for hope and patience',
    'Help me prepare a prayer for my family',
];

export const AIPastorModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Welcome. I am an AI ministry companion designed to offer scripture-grounded reflection, prayer support, and a pathway to human pastoral care when you need it. How can I support your walk today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (override?: string) => {
        const value = (override ?? input).trim();
        if (!value || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: value,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai/pastor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: value })
            });

            const data = await res.json();
            const response = data.response;

            let content = '';
            if (typeof response === 'string') {
                content = response;
            } else if (response) {
                const parts: string[] = [];
                if (response.reflection) parts.push(response.reflection);
                if (response.encouragement) parts.push(response.encouragement);
                if (response.guidance) parts.push(response.guidance);
                if (response.spiritualInsight) parts.push(response.spiritualInsight);
                if (response.compassionateResponse) parts.push(response.compassionateResponse);

                const scriptures = response.scriptures || response.scriptureFoundations || [];
                const scripture = response.scripture || (Array.isArray(scriptures) && scriptures[0]) || '';
                if (scripture) parts.push(`📖 ${scripture}`);

                const prayer = response.prayer || response.closingPrayer;
                if (prayer && parts.length > 0) parts.push(`🙏 Prayer: ${prayer}`);

                content = parts.join('\n\n') || JSON.stringify(response);
            }

            const assistMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: content || 'Let us slow down, reflect on Scripture, and consider a faithful next step together.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistMsg]);
        } catch {
            const errMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'The AI guidance service is temporarily unavailable. You can try again shortly, continue in prayer or Scripture, or reach the human care team if you need personal support.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative flex h-[84vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between bg-stone-800 p-6 text-white">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-500">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-light">AI Ministry Companion</h2>
                                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-sage-300">
                                        <Sparkles size={10} className="mr-1" /> Scripture-grounded guidance
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-white/10" aria-label="Close AI ministry companion">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="border-b border-sage-100 bg-sage-50 px-5 py-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-2 text-xs leading-5 text-sage-800">
                                    <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                                    <span>AI suggestions are advisory. Sensitive care remains human-led and your church care team can take over when needed.</span>
                                </div>
                                <Link href="/care" onClick={onClose} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-sage-700 shadow-sm transition hover:bg-sage-100">
                                    <HeartHandshake size={14} /> Human care
                                </Link>
                            </div>
                        </div>

                        <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-6 overflow-y-auto bg-cream-50 p-6">
                            {messages.map((msg) => (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${msg.role === 'user' ? 'ml-3 bg-stone-200 text-stone-600' : 'mr-3 bg-sage-100 text-sage-600'}`}>
                                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={`whitespace-pre-wrap rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-tr-none bg-stone-800 text-white' : 'rounded-tl-none border border-stone-100 bg-white text-stone-700 shadow-sm'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {messages.length === 1 && (
                                <div className="grid gap-2 sm:grid-cols-3">
                                    {quickPrompts.map((prompt) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            onClick={() => handleSend(prompt)}
                                            className="rounded-2xl border border-stone-200 bg-white p-3 text-left text-xs leading-5 text-stone-600 transition hover:border-sage-200 hover:bg-sage-50 hover:text-sage-800"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="flex space-x-1 rounded-2xl rounded-tl-none border border-stone-100 bg-white p-4">
                                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage-300" />
                                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage-300 [animation-delay:0.2s]" />
                                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage-300 [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-stone-100 bg-white p-6">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Share a concern, question, prayer need, or Scripture topic..."
                                    className="w-full rounded-2xl border-none bg-cream-50 py-4 pl-6 pr-14 text-stone-700 outline-none transition-all focus:ring-2 focus:ring-sage-200"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || loading}
                                    className="absolute right-2 rounded-xl bg-sage-500 p-3 text-white transition-all hover:bg-sage-600 disabled:opacity-50"
                                    aria-label="Send message"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                            <p className="mt-3 text-center text-[10px] uppercase tracking-widest text-stone-400">
                                AI ministry guidance does not replace pastors, counselors, medical care, or emergency services.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
