'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Heart, Star, ChevronRight, Check } from 'lucide-react';

export const FirstPrayerExperience = ({ onComplete }: { onComplete?: () => void }) => {
    const [step, setStep] = useState(0);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [responses, setResponses] = useState<string[]>([]);

    const prayerGuide = [
        {
            prompt: "What's on your heart today?",
            subtext: "Share a concern, a need, or a burden you're carrying.",
            icon: Heart,
            color: "text-rose-500",
            bg: "bg-rose-50"
        },
        {
            prompt: "Who else can we lift up together?",
            subtext: "Is there a friend or family member in need of prayer?",
            icon: UsersIcon, // Using a fallback local name if needed, but let's use Lucide
            iconName: "Users",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            prompt: "What are you thankful for?",
            subtext: "Take a moment to recognize the blessings in your life.",
            icon: Star,
            color: "text-amber-500",
            bg: "bg-amber-50"
        }
    ];

    const handleSubmit = async () => {
        if (!input.trim() || loading) return;
        setLoading(true);

        try {
            // Simulated AI processing for activation
            await new Promise(r => setTimeout(r, 1500));
            setResponses([...responses, input]);
            setInput('');

            if (step < prayerGuide.length - 1) {
                setStep(step + 1);
            } else {
                setStep(step + 1); // Move to completion
                if (onComplete) onComplete();
            }
        } catch (error) {
            console.error('Prayer Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (step >= prayerGuide.length) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto p-12 text-center sanctuary-card bg-white"
            >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} />
                </div>
                <h2 className="text-3xl font-light text-stone-800 mb-4">Your Prayers are Lifted</h2>
                <p className="text-stone-500 mb-8 leading-relaxed">
                    We've shared your heart with the prayer team and our AI Intercession engine.
                    Expect spiritual encouragement in your dashboard soon.
                </p>
                <div className="p-6 bg-sage-50 rounded-2xl border border-sage-100 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Star className="text-sage-600" size={24} />
                        <span className="text-sm font-medium text-stone-700">Achievement Unlocked: First Step</span>
                    </div>
                    <span className="text-xs font-bold text-sage-600 uppercase tracking-widest">+10 Points</span>
                </div>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full py-4 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-900 transition-all flex items-center justify-center gap-2"
                >
                    Go to Dashboard <ChevronRight size={18} />
                </button>
            </motion.div>
        );
    }

    const currentStep = prayerGuide[step];

    return (
        <div className="max-w-2xl mx-auto p-8 sanctuary-card bg-white min-h-[500px] flex flex-col justify-center">
            <div className="mb-12">
                <div className="flex justify-between items-end mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 ${currentStep.bg} ${currentStep.color} rounded-2xl flex items-center justify-center`}>
                            <currentStep.icon size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-light text-stone-800">{currentStep.prompt}</h2>
                            <p className="text-sm text-stone-400 mt-1">{currentStep.subtext}</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.2em]">
                        Step {step + 1} / {prayerGuide.length}
                    </div>
                </div>

                <div className="w-full h-1.5 bg-stone-50 rounded-full overflow-hidden mb-12">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((step + 1) / prayerGuide.length) * 100}%` }}
                        className="h-full bg-sage-500 rounded-full"
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex-1 flex flex-col"
                >
                    <div className="relative flex-1">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full h-40 bg-cream-50 border-none rounded-3xl p-8 outline-none focus:ring-2 focus:ring-sage-200 transition-all text-stone-700 placeholder:text-stone-300 resize-none text-lg leading-relaxed"
                            placeholder="Pour out your heart here..."
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!input.trim() || loading}
                            className={`absolute bottom-6 right-6 p-4 rounded-2xl transition-all shadow-xl ${loading
                                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                    : 'bg-stone-800 text-white hover:bg-stone-900 active:scale-95'
                                }`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send size={24} />
                            )}
                        </button>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-[10px] text-stone-400 uppercase tracking-widest font-bold justify-center">
                        <Sparkles size={12} className="text-sage-500" />
                        AI-Guided Spirit Experience
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// Local fallback for Users icon if not imported properly
const UsersIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
