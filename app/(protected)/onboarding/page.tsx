'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, BookOpen, Users, Sparkles, Map, Music,
    ChevronRight, Check, ArrowRight, Gift, Star
} from 'lucide-react';

const flows = {
    seeker: {
        label: 'New Here',
        icon: Heart,
        color: 'from-rose-500 to-pink-600',
        steps: [
            {
                id: 'welcome',
                title: 'Welcome Home 🏠',
                subtitle: 'We are so glad you are here.',
                content: "This is a safe place to explore faith, ask questions, and discover a community that loves you exactly as you are.",
                icon: Heart,
                color: 'bg-rose-50 text-rose-600',
            },
            {
                id: 'prayer',
                title: 'Start with Prayer ✨',
                subtitle: 'What is on your heart today?',
                content: "Our AI Prayer guides are available 24/7. Share what you are going through and receive a personalized prayer for your journey.",
                icon: Sparkles,
                color: 'bg-amber-50 text-amber-600',
                action: '/prayer-room',
                actionLabel: 'Visit Prayer Room',
            },
            {
                id: 'scripture',
                title: 'Ancient Living Words 📖',
                subtitle: 'Wisdom for every season.',
                content: "Dive into scripture with AI-powered depth — from surface reading to linguistic, cultural, and prophetic layers of meaning.",
                icon: BookOpen,
                color: 'bg-blue-50 text-blue-600',
            },
            {
                id: 'community',
                title: 'Say Hello 👋',
                subtitle: 'You are not alone.',
                content: "Join our Community Wall, share testimonies, post prayers, and encourage one another. A global family is waiting to meet you.",
                icon: Users,
                color: 'bg-green-50 text-green-600',
                action: '/community-wall',
                actionLabel: 'Meet the Community',
            },
        ],
        reward: 'Access to the AI Pastor — your 24/7 spiritual companion',
    },
    believer: {
        label: 'Deepening My Walk',
        icon: BookOpen,
        color: 'from-indigo-500 to-blue-600',
        steps: [
            {
                id: 'welcome',
                title: 'Welcome Back 🙏',
                subtitle: 'Ready to go deeper?',
                content: "You already know Him. Now let's sharpen your walk with AI-powered tools for spiritual growth, prayer, and community impact.",
                icon: Star,
                color: 'bg-indigo-50 text-indigo-600',
            },
            {
                id: 'journal',
                title: 'Spiritual Journal 📓',
                subtitle: 'Track your journey.',
                content: "Record reflections, set spiritual goals, track your mood, and watch God's faithfulness through your story over time.",
                icon: Map,
                color: 'bg-purple-50 text-purple-600',
                action: '/journal',
                actionLabel: 'Open My Journal',
            },
            {
                id: 'conference',
                title: 'Global Gatherings 🌍',
                subtitle: 'Join live encounters.',
                content: "Register for upcoming live conferences, worship experiences, and teaching sessions with believers from around the world.",
                icon: Music,
                color: 'bg-emerald-50 text-emerald-600',
                action: '/conferences',
                actionLabel: 'View Conferences',
            },
            {
                id: 'spiritual',
                title: 'Spiritual Growth Centers 🔥',
                subtitle: '9 AI-powered realms of growth.',
                content: "Explore divine guidance, spiritual warfare, prophetic gifts, healing, angelic encounters, and more — guided by scripture and AI.",
                icon: Sparkles,
                color: 'bg-amber-50 text-amber-600',
                action: '/spiritual',
                actionLabel: 'Enter the Sanctuary',
            },
        ],
        reward: 'Unlocked: Exclusive live sanctuary sessions & sermon archive',
    },
};

export default function OnboardingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [flowType, setFlowType] = useState<keyof typeof flows | null>(null);
    const [step, setStep] = useState(0);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/auth/signin');
    }, [status, router]);

    const flow = flowType ? flows[flowType] : null;
    const currentStep = flow?.steps[step];
    const isLastStep = flow ? step === flow.steps.length - 1 : false;
    const progress = flow ? ((step + 1) / flow.steps.length) * 100 : 0;

    const handleNext = async () => {
        if (!flow || !flowType) return;

        // Persist step to server
        await fetch('/api/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step: currentStep?.id, type: flowType }),
        });

        if (isLastStep) {
            setCompleting(true);
            await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ step: 'complete', type: flowType }),
            });
            setTimeout(() => router.push('/dashboard'), 2000);
        } else {
            setStep(s => s + 1);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="w-10 h-10 border-4 border-sage-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Completion screen
    if (completing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 to-stone-800">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center text-white space-y-6 px-6"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-24 h-24 bg-sage-500 rounded-full flex items-center justify-center mx-auto shadow-2xl"
                    >
                        <Check size={48} />
                    </motion.div>
                    <h1 className="text-4xl font-bold">You're all set! 🎉</h1>
                    <p className="text-stone-300 text-lg">
                        Your Digital Church OS journey begins now.<br />
                        <span className="text-sage-400 font-semibold">{flow?.reward}</span>
                    </p>
                    <p className="text-stone-500 text-sm animate-pulse">Taking you to your dashboard…</p>
                </motion.div>
            </div>
        );
    }

    // Flow selection screen
    if (!flowType) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-50 to-white flex items-center justify-center px-4">
                <div className="max-w-2xl w-full space-y-10">
                    <div className="text-center space-y-3">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-sage-50 border border-sage-200 rounded-full text-sage-700 text-sm font-semibold"
                        >
                            <Sparkles size={14} />
                            Welcome, {session?.user?.name?.split(' ')[0] || 'Friend'}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-bold text-stone-900"
                        >
                            Where are you on your journey?
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-stone-500 text-lg"
                        >
                            We'll personalise your experience to match your spiritual season.
                        </motion.p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {(Object.entries(flows) as [keyof typeof flows, typeof flows[keyof typeof flows]][]).map(([key, f], i) => (
                            <motion.button
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                onClick={() => setFlowType(key)}
                                className="group relative p-8 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                <div className="relative z-10 space-y-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg`}>
                                        <f.icon size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-stone-900">{f.label}</h3>
                                        <p className="text-stone-500 text-sm mt-1">{f.steps.length} personalised steps</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sage-600 text-sm font-semibold">
                                        Start my journey <ChevronRight size={16} />
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    <p className="text-center text-stone-400 text-sm">
                        You can update your preferences anytime in your profile.
                    </p>
                </div>
            </div>
        );
    }

    // Step screen
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-12">
            <div className="max-w-xl w-full space-y-8">

                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-stone-400 font-medium">
                        <span>Step {step + 1} of {flow!.steps.length}</span>
                        <button onClick={() => router.push('/dashboard')} className="text-stone-300 hover:text-stone-500">
                            Skip for now
                        </button>
                    </div>
                    <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full bg-gradient-to-r ${flow!.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                        />
                    </div>
                </div>

                {/* Step card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-3xl p-10 shadow-xl border border-stone-100 space-y-8"
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${currentStep?.color}`}>
                            {currentStep && <currentStep.icon size={32} />}
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-stone-900">{currentStep?.title}</h2>
                            <p className="text-sage-600 font-semibold">{currentStep?.subtitle}</p>
                        </div>
                        <p className="text-stone-600 text-lg leading-relaxed">{currentStep?.content}</p>

                        {currentStep?.action && (
                            <button
                                onClick={() => router.push(currentStep.action!)}
                                className="flex items-center gap-2 text-sm font-semibold text-sage-600 hover:text-sage-800 transition-colors"
                            >
                                <Gift size={16} />
                                {currentStep.actionLabel}
                            </button>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Reward preview (last step) */}
                {isLastStep && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-2xl p-6 text-white flex items-start gap-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
                            <Gift size={20} className="text-stone-900" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Your Reward</p>
                            <p className="font-semibold text-white">{flow?.reward}</p>
                        </div>
                    </motion.div>
                )}

                {/* Action button */}
                <button
                    onClick={handleNext}
                    className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-3 bg-gradient-to-r ${flow!.color} hover:opacity-90 active:scale-95 transition-all shadow-lg`}
                >
                    {isLastStep ? (
                        <><Check size={20} /> Complete Setup</>
                    ) : (
                        <>Next <ArrowRight size={20} /></>
                    )}
                </button>
            </div>
        </div>
    );
}
