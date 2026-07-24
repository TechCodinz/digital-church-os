'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Volume2, Sparkles, RefreshCw, Radio, BookOpen, Languages } from 'lucide-react';
import { VoicePlayer } from '@/components/ai/VoicePlayer';

const LANGUAGES = [
    'Spanish', 'French', 'Japanese', 'Swahili', 'Tagalog', 'Mandarin', 'Portuguese', 'Yoruba', 'German'
];

interface TranslationChunk {
    timestamp: string;
    english: string;
    translated: string;
    scripture?: string;
}

export default function MultilingualServicePage() {
    const [targetLang, setTargetLang] = useState('Spanish');
    const [loading, setLoading] = useState(false);
    const [chunks, setChunks] = useState<TranslationChunk[]>([
        {
            timestamp: '10:15 AM',
            english: 'Welcome everyone to today’s service. God’s peace will guard your mind.',
            translated: 'Bienvenidos a todos al servicio de hoy. La paz de Dios guardará vuestra mente.',
            scripture: 'Philippians 4:7'
        },
        {
            timestamp: '10:28 AM',
            english: 'Peace I leave with you; my peace I give to you. Not as the world gives.',
            translated: 'La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da.',
            scripture: 'John 14:27'
        }
    ]);

    const handleTranslateNewChunk = async (text: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/translate/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, targetLanguage: targetLang })
            });

            const data = await res.json();
            if (data.translatedText) {
                setChunks(prev => [
                    {
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        english: text,
                        translated: data.translatedText
                    },
                    ...prev
                ]);
            }
        } catch (err) {
            console.error('Translation error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-xl">
                        <Languages className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Multilingual Live Sermon Translator</h1>
                    <p className="text-slate-400 text-sm">Real-time live preaching subtitle translation & native speech broadcast</p>
                </div>

                {/* Language Selector */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <span className="text-xs font-bold text-slate-300">Select Target Language:</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang}
                                onClick={() => setTargetLang(lang)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    targetLang === lang
                                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                                }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Real-Time Live Feed */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                            <Radio className="w-4 h-4 text-rose-500 animate-pulse" /> Live Subtitle Stream ({targetLang})
                        </span>
                        <button
                            onClick={() => handleTranslateNewChunk('Blessed are the peacemakers, for they shall be called sons of God.')}
                            disabled={loading}
                            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-xl flex items-center gap-1.5 transition-all"
                        >
                            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                            <span>Simulate Live Chunk</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {chunks.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl transition-all space-y-3 shadow-xl"
                            >
                                <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-800 pb-2">
                                    <span className="font-mono text-cyan-400 font-bold">{item.timestamp}</span>
                                    {item.scripture && <span className="text-amber-400 font-semibold">📖 {item.scripture}</span>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Spoken English</span>
                                        <p className="text-xs text-slate-300 italic">"{item.english}"</p>
                                    </div>

                                    <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl space-y-1">
                                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">{targetLang} Translation</span>
                                        <p className="text-sm font-semibold text-white">"{item.translated}"</p>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <VoicePlayer text={item.translated} context="pastoral" label={`Listen in ${targetLang}`} compact />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
