'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Clock, Flame, CheckCircle2, ChevronRight } from 'lucide-react';

export const CommunityChallenge = () => {
    const [completedToday, setCompletedToday] = useState(false);

    const challenge = {
        title: "30 Days of Intercession",
        subtitle: "Uniting the global body in prayer",
        participants: 1247,
        daysLeft: 23,
        dailyTask: "Pray for 3 community members in the Prayer Room",
        goal: 10000,
        currentProgress: 3840
    };

    const progressPercentage = (challenge.currentProgress / challenge.goal) * 100;

    return (
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-sage-600 to-sage-800 p-8 text-white shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={160} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                            <Flame size={12} className="mr-2 text-amber-400" /> Community Challenge
                        </div>
                        <h3 className="text-3xl font-light leading-tight">{challenge.title}</h3>
                        <p className="text-sage-200 text-sm mt-2">{challenge.subtitle}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center min-w-[100px]">
                        <div className="text-2xl font-light">{challenge.daysLeft}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-sage-300">Days Left</div>
                    </div>
                </div>

                <div className="space-y-6 mb-10">
                    <div>
                        <div className="flex justify-between text-sm mb-3 font-medium">
                            <span className="flex items-center gap-2">
                                <Users size={16} className="text-sage-300" />
                                {challenge.participants.toLocaleString()} Souls Participating
                            </span>
                            <span>{Math.round(progressPercentage)}% Complete</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                            />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-6 border border-white/5">
                        <p className="text-xs text-sage-300 font-bold uppercase tracking-widest mb-2">Today's Faith Task</p>
                        <p className="text-lg font-medium leading-snug">{challenge.dailyTask}</p>
                    </div>
                </div>

                <button
                    onClick={() => setCompletedToday(true)}
                    disabled={completedToday}
                    className={`w-full py-5 rounded-[22px] font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${completedToday
                        ? 'bg-white/20 text-white/50 cursor-default'
                        : 'bg-white text-sage-800 hover:bg-sage-50 shadow-xl'
                        }`}
                >
                    {completedToday ? (
                        <>
                            <CheckCircle2 size={24} /> Faithfully Completed
                        </>
                    ) : (
                        <>
                            Mark Task Complete <ChevronRight size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
