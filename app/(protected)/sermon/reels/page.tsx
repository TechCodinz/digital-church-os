'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Video, Share2, Copy, Check, RefreshCw, BookOpen, Quote } from 'lucide-react';

export default function SermonReelsGeneratorPage() {
    const [copied, setCopied] = useState(false);
    const [reels] = useState([
        {
            title: '30-Sec Reel: Unshakeable Peace in the Storm',
            hook: 'When life hits you with chaos, peace isn’t the absence of trouble—it’s the presence of Christ.',
            script: '[0:00 - 0:05] Close-up shot on Pastor: "Are you trying to fight your anxiety in your own strength?"\n[0:05 - 0:20] Motion Graphic of Storm: "Philippians 4 says the peace of God guards your heart."\n[0:20 - 0:30] Call to Action: "Tap the link in bio to join Digital Church OS!"',
            hashtags: '#FaithOverFear #UnshakeablePeace #SundaySermon #DigitalChurch'
        },
        {
            title: 'Quote Card: Original Greek Eirene Exegesis',
            hook: 'Original Greek "Eirene" implies wholeness where nothing is missing and nothing is broken.',
            script: 'Design Prompt: Minimalist dark charcoal background with gold typography quoting John 14:27.',
            hashtags: '#GreekExegesis #DeepTheology #DailyWord'
        }
    ]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-slate-950 text-slate-100">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-xl">
                        <Video className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Pastoral Sermon Short Reel Studio</h1>
                    <p className="text-slate-400 text-sm">Auto-extract 30-second social reel scripts & devotional graphics from Sunday preaching</p>
                </div>

                {/* Reels List */}
                <div className="space-y-6">
                    {reels.map((reel, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-3xl p-6 transition-all space-y-4 shadow-xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Video className="w-5 h-5 text-rose-400" /> {reel.title}
                                </h3>
                                <button
                                    onClick={() => copyToClipboard(`${reel.hook}\n\n${reel.script}\n\n${reel.hashtags}`)}
                                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-xl flex items-center gap-1 transition-all"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copied ? 'Copied Reel Script' : 'Copy Script'}</span>
                                </button>
                            </div>

                            <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-1">
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Opening Hook</span>
                                <p className="text-sm font-semibold text-white">"{reel.hook}"</p>
                            </div>

                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1 font-mono text-xs text-slate-300">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-sans">Video Script & Visual Directions</span>
                                <pre className="whitespace-pre-wrap leading-relaxed font-sans">{reel.script}</pre>
                            </div>

                            <div className="text-xs text-rose-400 font-mono">
                                {reel.hashtags}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
