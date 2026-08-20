'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    Activity,
    ArrowRight,
    BookOpen,
    Calendar,
    Heart,
    HeartHandshake,
    MessageSquare,
    Music,
    Play,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AIPastorModal } from '@/components/ai/AIPastorModal';
import { ScriptureDepthExperience } from '@/components/scripture/ScriptureDepthExperience';
import { useSanctuaryTheme } from '@/components/theme/ThemeContext';

type DashboardStats = {
    prayers: number;
    goals: number;
    givingRecords: number;
    recentMoments: number;
};

export default function DashboardPage() {
    const { data: session } = useSession();
    const { theme } = useSanctuaryTheme();
    const [mounted, setMounted] = useState(false);
    const [daypart, setDaypart] = useState('Welcome back');
    const [stats, setStats] = useState<DashboardStats>({ prayers: 0, goals: 0, givingRecords: 0, recentMoments: 0 });
    const [upcomingConference, setUpcomingConference] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [isAiPastorOpen, setIsAiPastorOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const hour = new Date().getHours();
        setDaypart(hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');
    }, []);

    useEffect(() => {
        const readJson = (url: string) => fetch(url).then(async (response) => response.ok ? response.json() : []);

        Promise.all([
            readJson('/api/user/prayers'),
            readJson('/api/user/offerings'),
            readJson('/api/conferences?upcoming=true'),
            readJson('/api/user/goals'),
            readJson('/api/user/activity'),
        ])
            .then(([prayers, offerings, conferences, goals, activityLog]) => {
                const safeActivities = Array.isArray(activityLog) ? activityLog : [];
                setStats({
                    prayers: Array.isArray(prayers) ? prayers.length : 0,
                    goals: Array.isArray(goals) ? goals.length : 0,
                    givingRecords: Array.isArray(offerings) ? offerings.length : 0,
                    recentMoments: safeActivities.length,
                });
                setActivities(safeActivities.slice(0, 6));
                if (Array.isArray(conferences) && conferences.length > 0) setUpcomingConference(conferences[0]);
            })
            .catch(() => {
                setActivities([]);
            });
    }, []);

    const activeTheme = mounted ? theme : 'emerald';
    const isLight = activeTheme === 'light';
    const firstName = session?.user?.name?.split(' ')[0] || 'friend';

    const dailyFlow = [
        { title: 'Pray', copy: 'Bring what is real, privately or with others.', icon: Heart, href: '/prayer-room' },
        { title: 'Open the Word', copy: 'Continue Scripture immersion and reflection.', icon: BookOpen, href: '/scripture/immersion' },
        { title: 'Worship', copy: 'Enter the live-service and worship experience.', icon: Music, href: '/live-service' },
        { title: 'Journal', copy: 'Capture what you noticed before it disappears.', icon: MessageSquare, href: '/journal' },
    ];

    const statCards = [
        { label: 'Prayer threads', value: stats.prayers, icon: Heart },
        { label: 'Active goals', value: stats.goals, icon: Activity },
        { label: 'Giving records', value: stats.givingRecords, icon: HeartHandshake },
        { label: 'Recent moments', value: stats.recentMoments, icon: Sparkles },
    ];

    return (
        <div className={`sanctuary-page-shell pt-24 pb-24 ${isLight ? 'bg-[#f8f3eb]/92 text-stone-900' : 'bg-[#020807]/88 text-white'}`}>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#07110f] px-6 py-10 sm:px-10 sm:py-12 text-white shadow-2xl shadow-black/20">
                    <div className="absolute inset-0 sanctuary-radiance opacity-90" aria-hidden="true" />
                    <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-amber-300/10" aria-hidden="true" />
                    <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-end">
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                            <p className="sanctuary-section-label text-amber-300/75">Your private sanctuary</p>
                            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
                                {daypart}, {firstName}.
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300">
                                Continue your prayer, Scripture, worship, reflection, and community journey without turning faith into a leaderboard.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Link href="/prayer-room" className="sacred-primary-button group">
                                    <Heart className="w-4 h-4" /> Pray now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/live-service" className="sacred-secondary-button">
                                    <Play className="w-4 h-4" /> Enter worship
                                </Link>
                            </div>
                        </motion.div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 sm:p-6 backdrop-blur-xl">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                                <div>
                                    <p className="text-sm font-semibold text-white">No spiritual score</p>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                                        Prayer, giving, attendance, and activity are not used to rank holiness or maturity. This space is for continuity, not comparison.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`rounded-3xl border p-5 sm:p-6 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.035]'}`}
                            >
                                <Icon className={`h-4 w-4 ${isLight ? 'text-sage-700' : 'text-emerald-300'}`} />
                                <p className={`mt-5 text-3xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>{stat.value}</p>
                                <p className={`mt-1 text-[10px] uppercase tracking-[0.16em] ${isLight ? 'text-stone-400' : 'text-slate-500'}`}>{stat.label}</p>
                            </motion.div>
                        );
                    })}
                </section>

                <section className="mt-12">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Today</p>
                            <h2 className={`mt-3 text-3xl sm:text-4xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>A simple rhythm</h2>
                        </div>
                        <p className={`max-w-xl text-sm leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Choose one meaningful next step. The intelligence stays in the background instead of demanding attention.</p>
                    </div>

                    <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {dailyFlow.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.title} href={item.href} className={`group rounded-3xl border p-6 transition-all ${isLight ? 'border-stone-200 bg-white/80 hover:border-sage-300 hover:shadow-xl' : 'border-white/8 bg-white/[0.035] hover:bg-white/[0.06] hover:border-emerald-300/18'}`}>
                                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isLight ? 'border-sage-100 bg-sage-50 text-sage-700' : 'border-emerald-300/12 bg-emerald-300/8 text-emerald-300'}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className={`mt-5 text-lg font-semibold ${isLight ? 'text-stone-900' : 'text-white'}`}>{item.title}</h3>
                                    <p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>{item.copy}</p>
                                    <ArrowRight className={`mt-5 h-4 w-4 transition-transform group-hover:translate-x-1 ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-12 grid lg:grid-cols-[0.8fr_1.2fr] gap-6">
                    <div className="space-y-6">
                        <div className="sacred-panel-dark p-6 sm:p-7 text-white">
                            <p className="sanctuary-section-label text-amber-300/75">Guidance</p>
                            <h3 className="mt-3 text-2xl font-light">Need help making sense of something?</h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-400">Use AI-assisted reflection for Scripture and questions, or move directly to accountable human care.</p>
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <button onClick={() => setIsAiPastorOpen(true)} className="sacred-primary-button">Open AI-assisted guide</button>
                                <Link href="/pastoral/hub" className="sacred-secondary-button"><HeartHandshake className="w-4 h-4" /> Human care</Link>
                            </div>
                        </div>

                        <div className={`rounded-3xl border p-6 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.035]'}`}>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Next gathering</p>
                                    <h3 className={`mt-3 text-xl font-semibold ${isLight ? 'text-stone-900' : 'text-white'}`}>{upcomingConference ? upcomingConference.title : 'No upcoming conference yet'}</h3>
                                </div>
                                <Calendar className={`h-5 w-5 ${isLight ? 'text-sage-700' : 'text-amber-300'}`} />
                            </div>
                            {upcomingConference ? (
                                <>
                                    <p className={`mt-3 text-sm ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>
                                        {new Date(upcomingConference.startDate).toLocaleDateString()}
                                    </p>
                                    <Link href="/conferences" className={`mt-5 inline-flex items-center gap-2 text-xs font-semibold ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>View gathering <ArrowRight className="h-3.5 w-3.5" /></Link>
                                </>
                            ) : (
                                <Link href="/churches" className={`mt-5 inline-flex items-center gap-2 text-xs font-semibold ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Discover church life <ArrowRight className="h-3.5 w-3.5" /></Link>
                            )}
                        </div>
                    </div>

                    <div className={`rounded-3xl border p-6 sm:p-7 ${isLight ? 'border-stone-200 bg-white/80' : 'border-white/8 bg-white/[0.035]'}`}>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Continuity</p>
                                <h3 className={`mt-3 text-2xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Recent moments</h3>
                            </div>
                            <Link href="/journal" className={`text-xs font-semibold ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Open journal</Link>
                        </div>

                        <div className="mt-6 space-y-3">
                            {activities.length > 0 ? activities.map((item, index) => (
                                <div key={item.id || index} className={`flex items-center gap-4 rounded-2xl border p-4 ${isLight ? 'border-stone-100 bg-[#fbf8f3]' : 'border-white/7 bg-black/15'}`}>
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isLight ? 'bg-sage-50 text-sage-700' : 'bg-emerald-300/8 text-emerald-300'}`}>
                                        {item.type === 'prayer' ? <Heart className="h-4 w-4" /> : item.type === 'goal' ? <Activity className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className={`truncate text-sm font-medium ${isLight ? 'text-stone-800' : 'text-slate-200'}`}>{item.title || 'A moment in your journey'}</p>
                                        {item.time && <p className={`mt-1 text-[10px] ${isLight ? 'text-stone-400' : 'text-slate-600'}`}>{new Date(item.time).toLocaleDateString()}</p>}
                                    </div>
                                </div>
                            )) : (
                                <div className={`rounded-2xl border border-dashed p-8 text-center text-sm ${isLight ? 'border-stone-200 text-stone-400' : 'border-white/10 text-slate-600'}`}>
                                    Your private journey will begin to gather here as you pray, study, worship, and reflect.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mt-12">
                    <div className="mb-6">
                        <p className={`sanctuary-section-label ${isLight ? 'text-sage-700' : 'text-emerald-300'}`}>Deep study</p>
                        <h2 className={`mt-3 text-3xl sm:text-4xl font-light ${isLight ? 'text-stone-900' : 'text-white'}`}>Scripture Excavation</h2>
                        <p className={`mt-2 text-sm ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>Observation first. Context next. Reflection after.</p>
                    </div>
                    <ScriptureDepthExperience />
                </section>
            </div>

            <AIPastorModal isOpen={isAiPastorOpen} onClose={() => setIsAiPastorOpen(false)} />
        </div>
    );
}
