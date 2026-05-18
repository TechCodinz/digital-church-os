'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    Activity,
    MessageSquare,
    Heart,
    Calendar,
    Users,
    Zap,
    ChevronRight,
    Play,
    PlusCircle,
    BookOpen,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AIPastorModal } from '@/components/ai/AIPastorModal';
import { ScriptureDepthExperience } from '@/components/scripture/ScriptureDepthExperience';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        prayers: 0,
        goals: 0,
        offerings: 0,
        engagement: 0
    });

    const [upcomingConference, setUpcomingConference] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [isAiPastorOpen, setIsAiPastorOpen] = useState(false);

    useEffect(() => {
        // Fetch real status
        Promise.all([
            fetch('/api/user/prayers').then(res => res.json()),
            fetch('/api/user/offerings').then(res => res.json()),
            fetch('/api/conferences?upcoming=true').then(res => res.json()),
            fetch('/api/user/goals').then(res => res.json()),
            fetch('/api/user/activity').then(res => res.json()),
        ]).then(([prayers, offerings, conferences, goals, activityLog]) => {
            const prayerCount = Array.isArray(prayers) ? prayers.length : 0;
            const goalCount = Array.isArray(goals) ? goals.length : 0;
            const offeringTotal = Array.isArray(offerings) ? offerings.reduce((sum: number, o: any) => sum + o.amount, 0) : 0;
            // Calculate engagement score from real activity metrics
            const engagementScore = Math.min(100, Math.round(
                (prayerCount * 10) + (goalCount * 15) + (Array.isArray(offerings) && offerings.length > 0 ? 25 : 0) + (Array.isArray(activityLog) ? Math.min(activityLog.length * 5, 50) : 0)
            ));
            setStats({
                prayers: prayerCount,
                goals: goalCount,
                offerings: offeringTotal,
                engagement: engagementScore || 5  // minimum of 5% for new users
            });
            if (Array.isArray(conferences) && conferences.length > 0) {
                setUpcomingConference(conferences[0]);
            }
            if (Array.isArray(activityLog)) {
                setActivities(activityLog);
            }
        }).catch(err => console.error('Dashboard fetch error:', err));
    }, []);

    const quickActions = [
        { title: 'Share Prayer', icon: Heart, href: '/prayer-room', color: 'bg-rose-500' },
        { title: 'New Testimony', icon: MessageSquare, href: '/community-wall', color: 'bg-amber-500' },
        { title: 'Give Offering', icon: Zap, href: '/offering', color: 'bg-emerald-500' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 bg-cream-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Welcome Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-light text-stone-800">
                            Welcome back, {session?.user?.name?.split(' ')[0]}
                        </h1>
                        <p className="text-stone-500 mt-1 italic">"The Lord is my shepherd; I shall not want."</p>
                    </motion.div>

                    <div className="flex gap-4">
                        <Link href="/live-service" className="px-6 py-3 bg-sage-500 text-white rounded-2xl hover:bg-sage-600 transition-all flex items-center shadow-lg shadow-sage-200">
                            <Play size={18} className="mr-2 fill-current" /> Join Live Service
                        </Link>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Active Prayers', value: stats.prayers, icon: Heart, color: 'text-rose-500' },
                        { label: 'Spiritual Goals', value: stats.goals, icon: Activity, color: 'text-blue-500' },
                        { label: 'Total Giving', value: `$${stats.offerings}`, icon: Zap, color: 'text-emerald-500' },
                        { label: 'Engagement', value: `${stats.engagement}%`, icon: Users, color: 'text-purple-500' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="sanctuary-card"
                        >
                            <stat.icon className={`${stat.color} mb-3`} size={24} />
                            <p className="text-sm text-stone-500 uppercase tracking-wider">{stat.label}</p>
                            <h2 className="text-3xl font-light text-stone-800 mt-1">{stat.value}</h2>
                        </motion.div>
                    ))}
                </div>

                {/* Revolutionary Scripture Depth Experience */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-8 px-4">
                        <div>
                            <h2 className="text-3xl font-light text-stone-800">Scripture Excavation</h2>
                            <p className="text-stone-500 italic mt-1">"Open my eyes, that I may behold wondrous things out of your law." — Psalm 119:18</p>
                        </div>
                    </div>
                    <ScriptureDepthExperience />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Quick Actions & Upcoming */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="sanctuary-card">
                            <h3 className="text-xl font-light text-stone-800 mb-6">Quick Actions</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {quickActions.map((action) => (
                                    <Link key={action.title} href={action.href}>
                                        <div className="flex items-center p-4 bg-cream-50 rounded-2xl hover:bg-cream-100 transition-all border border-transparent hover:border-sage-100 cursor-pointer group">
                                            <div className={`${action.color} p-3 rounded-xl text-white mr-4 shadow-sm group-hover:scale-110 transition-transform`}>
                                                <action.icon size={20} />
                                            </div>
                                            <span className="font-medium text-stone-700">{action.title}</span>
                                            <ChevronRight className="ml-auto text-stone-400" size={18} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <section className="sanctuary-card">
                            <h3 className="text-xl font-light text-stone-800 mb-6">Next Conference</h3>
                            {upcomingConference ? (
                                <div className="bg-sage-50 rounded-2xl p-6 border border-sage-100">
                                    <span className="px-2 py-1 bg-white text-sage-600 text-[10px] font-bold rounded uppercase tracking-widest mb-3 inline-block">
                                        Starting Soon
                                    </span>
                                    <h4 className="text-lg font-medium text-stone-800 mb-2">{upcomingConference.title}</h4>
                                    <p className="text-sm text-stone-600 mb-4 flex items-center">
                                        <Calendar size={14} className="mr-2" />
                                        {new Date(upcomingConference.startDate).toLocaleDateString()}
                                    </p>
                                    <Link
                                        href="/conferences"
                                        className="block w-full py-3 bg-white text-stone-700 rounded-xl hover:bg-sage-500 hover:text-white transition-all font-medium border border-sage-200 text-center"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            ) : (
                                <div className="p-6 text-center text-stone-400 italic border border-dashed rounded-2xl">
                                    No upcoming conferences scheduled.
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: AI Assistant & Recent Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="sanctuary-card bg-stone-800 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <Zap size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-light mb-4">How can I assist your walk today?</h3>
                                <p className="text-stone-400 mb-8 max-w-md">Your AI Pastor is ready to provide guidance, scripture context, or just listen.</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsAiPastorOpen(true)}
                                        className="px-8 py-3 bg-sage-500 rounded-xl hover:bg-sage-600 transition-all flex items-center font-medium"
                                    >
                                        Ask AI Pastor <ChevronRight size={18} className="ml-2" />
                                    </button>
                                    <Link href="/journal" className="px-8 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all font-medium flex items-center gap-2">
                                        <BookOpen size={16} /> View Journal
                                    </Link>
                                </div>
                            </div>
                        </section>

                        <section className="sanctuary-card">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-light text-stone-800">Your Spiritual Pulse</h3>
                                <Link href="/journal" className="text-sm text-sage-600 hover:underline flex items-center gap-1">
                                    <ExternalLink size={13} /> View Journal
                                </Link>
                            </div>

                            <div className="space-y-6">
                                {activities.length > 0 ? activities.map((item, i) => (
                                    <div key={i} className="flex items-center p-4 bg-white border border-stone-100 rounded-2xl hover:shadow-sm transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-cream-50 flex items-center justify-center text-sage-500 mr-4 group-hover:bg-sage-50 transition-colors">
                                            {item.type === 'goal' ? <Activity size={18} /> : item.type === 'prayer' ? <Heart size={18} /> : <Zap size={18} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-stone-800">{item.title}</p>
                                            <p className="text-xs text-stone-400">{new Date(item.time).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${item.status.includes('!') ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-500'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-stone-400 italic">
                                        Your spiritual activity will appear here.
                                    </div>
                                )}
                                <Link href="/journal" className="w-full py-4 border-2 border-dashed border-stone-100 rounded-2xl text-stone-400 hover:text-sage-500 hover:border-sage-200 transition-all flex items-center justify-center font-medium">
                                    <PlusCircle size={18} className="mr-2" /> Add a new journal entry
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <AIPastorModal
                isOpen={isAiPastorOpen}
                onClose={() => setIsAiPastorOpen(false)}
            />
        </div>
    );
}
