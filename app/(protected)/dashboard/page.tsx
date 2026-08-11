'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    Activity, MessageSquare, Heart, Calendar, Users, Zap, ChevronRight,
    Play, PlusCircle, BookOpen, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AIPastorModal } from '@/components/ai/AIPastorModal';
import { ScriptureDepthExperience } from '@/components/scripture/ScriptureDepthExperience';
import { LivingSanctuaryMissionControl } from '@/components/ministry/LivingSanctuaryMissionControl';
import { DailyMinistryFlow } from '@/components/ministry/DailyMinistryFlow';
import { NextBestMinistryAction } from '@/components/ministry/NextBestMinistryAction';
import { DashboardJourneyResume } from '@/components/journey/DashboardJourneyResume';

async function safeJson(url: string) {
    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({ prayers: 0, goals: 0, offerings: 0, recentActivity: 0 });
    const [upcomingConference, setUpcomingConference] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [isAiPastorOpen, setIsAiPastorOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            const [prayers, offerings, conferences, goals, activityLog] = await Promise.all([
                safeJson('/api/user/prayers'),
                safeJson('/api/user/offerings'),
                safeJson('/api/conferences?upcoming=true'),
                safeJson('/api/user/goals'),
                safeJson('/api/user/activity'),
            ]);

            if (cancelled) return;

            const prayerCount = Array.isArray(prayers) ? prayers.length : 0;
            const goalCount = Array.isArray(goals) ? goals.length : 0;
            const offeringTotal = Array.isArray(offerings)
                ? offerings.reduce((sum: number, offering: any) => sum + (Number(offering.amount) || 0), 0)
                : 0;
            const recentActivity = Array.isArray(activityLog) ? activityLog.length : 0;

            setStats({ prayers: prayerCount, goals: goalCount, offerings: offeringTotal, recentActivity });
            setUpcomingConference(Array.isArray(conferences) && conferences.length > 0 ? conferences[0] : null);
            setActivities(Array.isArray(activityLog) ? activityLog : []);
        };

        loadDashboard();
        return () => { cancelled = true; };
    }, []);

    const quickActions = [
        { title: 'Share Prayer', icon: Heart, href: '/prayer-room', color: 'bg-rose-500' },
        { title: 'New Testimony', icon: MessageSquare, href: '/community-wall', color: 'bg-amber-500' },
        { title: 'Give Offering', icon: Zap, href: '/offering', color: 'bg-emerald-500' },
    ];

    return (
        <div className="min-h-screen bg-cream-50 pb-12 pt-24">
            <div className="mx-auto max-w-7xl px-4">
                <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl font-light text-stone-800">Welcome back, {session?.user?.name?.split(' ')[0] || 'friend'}</h1>
                        <p className="mt-1 italic text-stone-500">“The Lord is my shepherd; I shall not want.”</p>
                    </motion.div>
                    <Link href="/live-service" className="flex items-center rounded-2xl bg-sage-500 px-6 py-3 text-white shadow-lg shadow-sage-200 transition-all hover:bg-sage-600">
                        <Play size={18} className="mr-2 fill-current" /> Join Live Service
                    </Link>
                </header>

                <LivingSanctuaryMissionControl />
                <DailyMinistryFlow />
                <NextBestMinistryAction prayers={stats.prayers} goals={stats.goals} activityCount={activities.length} />
                <DashboardJourneyResume />

                <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Active Prayers', value: stats.prayers, icon: Heart, color: 'text-rose-500' },
                        { label: 'Spiritual Goals', value: stats.goals, icon: Activity, color: 'text-blue-500' },
                        { label: 'Total Giving', value: `$${stats.offerings}`, icon: Zap, color: 'text-emerald-500' },
                        { label: 'Recent Activity', value: stats.recentActivity, icon: Users, color: 'text-purple-500' },
                    ].map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="sanctuary-card">
                            <stat.icon className={`${stat.color} mb-3`} size={24} />
                            <p className="text-sm uppercase tracking-wider text-stone-500">{stat.label}</p>
                            <h2 className="mt-1 text-3xl font-light text-stone-800">{stat.value}</h2>
                        </motion.div>
                    ))}
                </div>

                <section className="mb-12">
                    <div className="mb-8 flex items-center justify-between px-4">
                        <div>
                            <h2 className="text-3xl font-light text-stone-800">Scripture Excavation</h2>
                            <p className="mt-1 italic text-stone-500">“Open my eyes, that I may behold wondrous things out of your law.” — Psalm 119:18</p>
                        </div>
                    </div>
                    <ScriptureDepthExperience />
                </section>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="space-y-8 lg:col-span-1">
                        <section className="sanctuary-card">
                            <h3 className="mb-6 text-xl font-light text-stone-800">Quick Actions</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {quickActions.map((action) => (
                                    <Link key={action.title} href={action.href}>
                                        <div className="group flex cursor-pointer items-center rounded-2xl border border-transparent bg-cream-50 p-4 transition-all hover:border-sage-100 hover:bg-cream-100">
                                            <div className={`${action.color} mr-4 rounded-xl p-3 text-white shadow-sm transition-transform group-hover:scale-110`}><action.icon size={20} /></div>
                                            <span className="font-medium text-stone-700">{action.title}</span>
                                            <ChevronRight className="ml-auto text-stone-400" size={18} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <section className="sanctuary-card">
                            <h3 className="mb-6 text-xl font-light text-stone-800">Next Conference</h3>
                            {upcomingConference ? (
                                <div className="rounded-2xl border border-sage-100 bg-sage-50 p-6">
                                    <span className="mb-3 inline-block rounded bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-sage-600">Starting Soon</span>
                                    <h4 className="mb-2 text-lg font-medium text-stone-800">{upcomingConference.title}</h4>
                                    <p className="mb-4 flex items-center text-sm text-stone-600"><Calendar size={14} className="mr-2" /> {new Date(upcomingConference.startDate).toLocaleDateString()}</p>
                                    <Link href="/conferences" className="block w-full rounded-xl border border-sage-200 bg-white py-3 text-center font-medium text-stone-700 transition-all hover:bg-sage-500 hover:text-white">View Details</Link>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed p-6 text-center italic text-stone-400">No upcoming conferences scheduled.</div>
                            )}
                        </section>
                    </div>

                    <div className="space-y-8 lg:col-span-2">
                        <section className="sanctuary-card group relative overflow-hidden bg-stone-800 text-white">
                            <div className="absolute right-0 top-0 p-8 opacity-10 transition-transform duration-700 group-hover:scale-125"><Zap size={120} /></div>
                            <div className="relative z-10">
                                <h3 className="mb-4 text-2xl font-light">How can I assist your walk today?</h3>
                                <p className="mb-8 max-w-md text-stone-400">Your AI Ministry Companion can offer scripture-grounded reflection and a pathway to human care when needed.</p>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => setIsAiPastorOpen(true)} className="flex items-center rounded-xl bg-sage-500 px-8 py-3 font-medium transition-all hover:bg-sage-600">Ask AI Companion <ChevronRight size={18} className="ml-2" /></button>
                                    <Link href="/journal" className="flex items-center gap-2 rounded-xl bg-white/10 px-8 py-3 font-medium transition-all hover:bg-white/20"><BookOpen size={16} /> View Journal</Link>
                                </div>
                            </div>
                        </section>

                        <section className="sanctuary-card">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-light text-stone-800">Recent account activity</h3>
                                    <p className="mt-1 text-xs text-stone-400">A factual history of recent in-app actions—not a spiritual score.</p>
                                </div>
                                <Link href="/journal" className="flex items-center gap-1 text-sm text-sage-600 hover:underline"><ExternalLink size={13} /> View Journal</Link>
                            </div>
                            <div className="space-y-6">
                                {activities.length > 0 ? activities.map((item, i) => (
                                    <div key={i} className="group flex items-center rounded-2xl border border-stone-100 bg-white p-4 transition-all hover:shadow-sm">
                                        <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cream-50 text-sage-500 transition-colors group-hover:bg-sage-50">
                                            {item.type === 'goal' ? <Activity size={18} /> : item.type === 'prayer' ? <Heart size={18} /> : <Zap size={18} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-stone-800">{item.title}</p>
                                            <p className="text-xs text-stone-400">{new Date(item.time).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tighter ${String(item.status).includes('!') ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-500'}`}>{item.status}</span>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center italic text-stone-400">Recent in-app activity will appear here when available.</div>
                                )}
                                <Link href="/journal" className="flex w-full items-center justify-center rounded-2xl border-2 border-dashed border-stone-100 py-4 font-medium text-stone-400 transition-all hover:border-sage-200 hover:text-sage-500"><PlusCircle size={18} className="mr-2" /> Add a new journal entry</Link>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <AIPastorModal isOpen={isAiPastorOpen} onClose={() => setIsAiPastorOpen(false)} />
        </div>
    );
}
