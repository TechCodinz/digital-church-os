'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, Sparkles, MessageSquare } from 'lucide-react';

interface Activity {
    id: string;
    text: string;
    icon: any;
    color: string;
}

export const LiveActivity = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [stats, setStats] = useState({
        online: 124,
        prayers: 842
    });

    // Simulated real-time updates for Demo Mode
    useEffect(() => {
        const activityPool = [
            { text: "Sarah joined the Prayer Room", icon: Users, color: "text-blue-500" },
            { text: "Michael requested prayer for healing", icon: Heart, color: "text-rose-500" },
            { text: "New testimony shared: 'Grace found'", icon: Sparkles, color: "text-amber-500" },
            { text: "AI Pastor providing guidance to David", icon: MessageSquare, color: "text-sage-500" },
            { text: "Someone just gave to Community Aid", icon: Heart, color: "text-emerald-500" },
        ];

        const interval = setInterval(() => {
            const randomActivity = activityPool[Math.floor(Math.random() * activityPool.length)];
            const newActivity = {
                ...randomActivity,
                id: Math.random().toString(36).substr(2, 9)
            };

            setActivities(prev => [newActivity, ...prev].slice(0, 3));
            setStats(prev => ({
                online: prev.online + (Math.random() > 0.5 ? 1 : -1),
                prayers: prev.prayers + (Math.random() > 0.7 ? 1 : 0)
            }));
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-24 right-6 z-50 pointer-events-none sm:pointer-events-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl border border-stone-100 shadow-2xl rounded-[32px] p-6 w-72 overflow-hidden"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                            {stats.online} Souls Online
                        </span>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sage-50 rounded-xl flex items-center justify-center text-sage-600">
                            <Heart size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-stone-800">{stats.prayers.toLocaleString()}</p>
                            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Prayers This Hour</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-stone-50 pt-6 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {activities.map((activity) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-3"
                            >
                                <div className={`w-2 h-2 rounded-full ${activity.color.replace('text', 'bg')}`} />
                                <p className="text-[11px] text-stone-600 font-medium leading-tight">
                                    {activity.text}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 pt-4 border-t border-stone-50"
                >
                    <button className="w-full py-3 bg-stone-800 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-stone-900 transition-all flex items-center justify-center gap-2 shadow-xl shadow-stone-200">
                        Join the Movement
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};
