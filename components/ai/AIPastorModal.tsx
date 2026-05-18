'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Bot, Sparkles, ChevronRight, MessageSquare } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const AIPastorModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Welcome, child of God. I am your AI Pastor companion, trained in scripture and spiritual guidance. How can I walk with you today?",
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

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai/pastor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input })
            });

            const data = await res.json();
            const response = data.response;

            // Extract the best human-readable content from the structured response
            let content = '';
            if (typeof response === 'string') {
                content = response;
            } else if (response) {
                // Build a rich but natural-feeling reply from structured fields
                const parts: string[] = [];
                if (response.reflection) parts.push(response.reflection);
                if (response.encouragement) parts.push(response.encouragement);
                if (response.guidance) parts.push(response.guidance);
                if (response.spiritualInsight) parts.push(response.spiritualInsight);
                if (response.compassionateResponse) parts.push(response.compassionateResponse);

                // Add a scripture reference if available
                const scriptures = response.scriptures || response.scriptureFoundations || [];
                const scripture = response.scripture || (Array.isArray(scriptures) && scriptures[0]) || '';
                if (scripture) parts.push(`📖 "${scripture}"`);

                // Append prayer invitation
                const prayer = response.prayer || response.closingPrayer;
                if (prayer && parts.length > 0) {
                    parts.push(`🙏 Let us pray: ${prayer}`);
                }

                content = parts.join('\n\n') || JSON.stringify(response);
            }

            const assistMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: content || 'Let us turn to the Word of God. He promises that those who seek Him will find Him (Jeremiah 29:13).',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistMsg]);
        } catch (error) {
            const errMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I am experiencing a momentary interruption. Please try again in a moment. Remember, God\'s word never fails: "I will not leave you nor forsake you" (Joshua 1:5).',
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
                        className="relative bg-white w-full max-w-2xl h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 bg-stone-800 text-white flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-sage-500 rounded-xl flex items-center justify-center">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-light">AI Pastor</h2>
                                    <div className="flex items-center text-[10px] text-sage-300 uppercase tracking-widest font-bold">
                                        <Sparkles size={10} className="mr-1" /> Spiritual Guidance Active
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 bg-cream-50 custom-scrollbar"
                        >
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-stone-200 text-stone-600 ml-3' : 'bg-sage-100 text-sage-600 mr-3'
                                            }`}>
                                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-stone-800 text-white rounded-tr-none'
                                            : 'bg-white text-stone-700 shadow-sm border border-stone-100 rounded-tl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-stone-100 flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-sage-300 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-sage-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-sage-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-stone-100">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Share your concern or ask for guidance..."
                                    className="w-full bg-cream-50 border-none rounded-2xl pl-6 pr-14 py-4 outline-none focus:ring-2 focus:ring-sage-200 transition-all text-stone-700"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    className="absolute right-2 p-3 bg-sage-500 text-white rounded-xl hover:bg-sage-600 transition-all disabled:opacity-50"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                            <p className="text-[10px] text-stone-400 mt-3 text-center uppercase tracking-widest italic">
                                AI assistance is a guide and does not replace human pastoral care.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
