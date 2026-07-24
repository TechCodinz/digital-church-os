'use client';

import { motion } from 'framer-motion';
import { Compass, CheckCircle2, Heart, Award, BookOpen } from 'lucide-react';

interface JourneyMilestone {
    date: string;
    title: string;
    description: string;
    type: 'prayer' | 'sermon' | 'aid' | 'badge';
    icon: any;
    color: string;
}

export default function SpiritualJourneyPage() {

    const milestones: JourneyMilestone[] = [
        {
            date: 'July 24, 2026',
            title: 'Mastered Level 5 Exegesis',
            description: 'Explored multi-depth Greek etymology for John 3:16 on Depth Sermon Generator.',
            type: 'sermon',
            icon: BookOpen,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        },
        {
            date: 'July 20, 2026',
            title: 'Answered Prayer Milestone',
            description: 'Marked prayer request "Family Healing & Peace" as answered!',
            type: 'prayer',
            icon: CheckCircle2,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        },
        {
            date: 'July 15, 2026',
            title: 'Earned Badge: Sword of Spirit',
            description: 'Achieved 7-day scripture memory streak in Gamified Memory Studio.',
            type: 'badge',
            icon: Award,
            color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
        },
        {
            date: 'July 01, 2026',
            title: 'Community Aid Partner',
            description: 'Contributed offering to Community Emergency Aid Fund.',
            type: 'aid',
            icon: Heart,
            color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
        }
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-950 text-slate-100">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-xl">
                        <Compass className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Spiritual Growth Journey</h1>
                    <p className="text-slate-400 text-sm">Visual timeline of your faith milestones, prayers, and community impact</p>
                </div>

                {/* Timeline Container */}
                <div className="relative border-l-2 border-slate-800 ml-4 md:ml-32 space-y-8 pl-6 md:pl-8">
                    {milestones.map((m, idx) => {
                        const Icon = m.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative group"
                            >
                                {/* Timeline Node Indicator */}
                                <div className="absolute -left-[35px] md:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-slate-950 border-2 border-amber-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                </div>

                                {/* Desktop Date Column */}
                                <div className="hidden md:block absolute -left-36 top-1 text-xs font-mono text-slate-500 text-right w-28">
                                    {m.date}
                                </div>

                                <div className="p-6 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all space-y-2">
                                    <div className="md:hidden text-[10px] font-mono text-amber-400">{m.date}</div>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl border ${m.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-base font-bold text-white">{m.title}</h3>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">{m.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
