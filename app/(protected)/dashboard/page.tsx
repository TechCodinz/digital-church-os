'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Activity,
  BookOpen,
  Calendar,
  ChevronRight,
  Church,
  Compass,
  ExternalLink,
  Globe2,
  Heart,
  HeartHandshake,
  MessageSquare,
  Music2,
  Play,
  PlusCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react';
import { AIPastorModal } from '@/components/ai/AIPastorModal';
import { ScriptureDepthExperience } from '@/components/scripture/ScriptureDepthExperience';

type DashboardStats = {
  prayers: number;
  goals: number;
  offerings: number;
  engagement: number;
};

type Conference = {
  title?: string;
  startDate?: string;
};

type ActivityItem = {
  type?: string;
  title?: string;
  time?: string;
  status?: string;
};

async function safeJson(url: string) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

const ministrySpaces = [
  { title: 'Live Broadcast', description: 'Join live prayer, worship, devotion, and church gatherings.', href: '/live-broadcast', icon: Radio },
  { title: 'Worship Media', description: 'Praise playlists, worship media, and prayer atmosphere.', href: '/worship-media', icon: Music2 },
  { title: 'Spiritual Journey', description: 'Follow private growth, milestones, notes, and next steps.', href: '/journey', icon: Compass },
  { title: 'Human Care', description: 'Request support and connect sensitive needs to real leaders.', href: '/care', icon: HeartHandshake },
  { title: 'Church Network', description: 'Discover connected churches, ministry resources, and outreach.', href: '/church-network', icon: Globe2 },
  { title: 'Rewards & Gifts', description: 'Track meaningful participation, service rewards, and support.', href: '/rewards', icon: WalletCards },
  { title: 'AI Ministry Council', description: 'Coordinate ministry intelligence across specialized AI roles.', href: '/council', icon: Users },
  { title: 'Command Center', description: 'See ministry health, risks, opportunities, and weekly priorities.', href: '/command-center', icon: ShieldCheck },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({ prayers: 0, goals: 0, offerings: 0, engagement: 5 });
  const [upcomingConference, setUpcomingConference] = useState<Conference | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isAiPastorOpen, setIsAiPastorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const [prayers, offerings, conferences, goals, activityLog] = await Promise.all([
        safeJson('/api/user/prayers'),
        safeJson('/api/user/offerings'),
        safeJson('/api/conferences?upcoming=true'),
        safeJson('/api/user/goals'),
        safeJson('/api/user/activity'),
      ]);

      if (!active) return;

      const prayerList = Array.isArray(prayers) ? prayers : [];
      const offeringList = Array.isArray(offerings) ? offerings : [];
      const goalList = Array.isArray(goals) ? goals : [];
      const activityList = Array.isArray(activityLog) ? activityLog : [];
      const conferenceList = Array.isArray(conferences) ? conferences : [];

      const offeringTotal = offeringList.reduce((sum: number, item: { amount?: number }) => sum + Number(item?.amount || 0), 0);
      const engagement = Math.min(
        100,
        Math.max(
          5,
          Math.round(prayerList.length * 10 + goalList.length * 15 + (offeringList.length ? 25 : 0) + Math.min(activityList.length * 5, 50)),
        ),
      );

      setStats({ prayers: prayerList.length, goals: goalList.length, offerings: offeringTotal, engagement });
      setUpcomingConference(conferenceList[0] || null);
      setActivities(activityList.slice(0, 6));
      setLoading(false);
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const firstName = session?.user?.name?.split(' ')[0] || 'Friend';
  const nextAction = useMemo(() => {
    if (stats.prayers === 0) return { label: 'Begin with prayer', href: '/prayer-room', detail: 'Start today by recording a prayer or joining intercession.' };
    if (stats.goals === 0) return { label: 'Set a spiritual goal', href: '/journey', detail: 'Turn today’s conviction into a simple next milestone.' };
    if (stats.engagement < 40) return { label: 'Continue your journey', href: '/journey', detail: 'One meaningful action can strengthen your weekly rhythm.' };
    return { label: 'Serve or encourage someone', href: '/activities', detail: 'Your rhythm is active—turn growth into service and encouragement.' };
  }, [stats]);

  const quickActions = [
    { title: 'Share Prayer', icon: Heart, href: '/prayer-room' },
    { title: 'New Testimony', icon: MessageSquare, href: '/impact' },
    { title: 'Give Offering', icon: Zap, href: '/offering' },
    { title: 'Join Live', icon: Play, href: '/live-service' },
  ];

  return (
    <main className="min-h-screen bg-cream-50 pb-14 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-[2rem] border border-sage-100 bg-gradient-to-br from-white via-white to-sage-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-3 inline-flex items-center rounded-full border border-sage-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sage-700">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Living Sanctuary
              </div>
              <h1 className="text-4xl font-light tracking-tight text-stone-800 sm:text-5xl">Welcome back, {firstName}</h1>
              <p className="mt-3 max-w-2xl text-stone-500">One place for prayer, scripture, worship, care, service, community, and ministry intelligence.</p>
            </motion.div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setIsAiPastorOpen(true)} className="inline-flex min-h-12 items-center justify-center rounded-full border border-sage-200 bg-white px-6 py-3 font-medium text-sage-700 transition hover:border-sage-300 hover:bg-sage-50">
                <Sparkles className="mr-2 h-4 w-4" /> Ask AI Pastor
              </button>
              <Link href="/live-service" className="inline-flex min-h-12 items-center justify-center rounded-full bg-sage-600 px-6 py-3 font-medium text-white shadow-lg shadow-sage-200 transition hover:bg-sage-700">
                <Play className="mr-2 h-4 w-4 fill-current" /> Join Live Service
              </Link>
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Active Prayers', value: stats.prayers, icon: Heart },
            { label: 'Spiritual Goals', value: stats.goals, icon: Activity },
            { label: 'Total Giving', value: `$${stats.offerings.toLocaleString()}`, icon: WalletCards },
            { label: 'Engagement', value: `${stats.engagement}%`, icon: Users },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="sanctuary-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-sage-600" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">{loading ? 'Syncing' : 'Live'}</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{stat.label}</p>
              <h2 className="mt-1 text-3xl font-light text-stone-800">{loading ? '—' : stat.value}</h2>
            </motion.div>
          ))}
        </section>

        <section className="mb-10 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[2rem] bg-stone-900 p-7 text-white shadow-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage-200">Recommended next step</p>
            <h2 className="mt-3 text-3xl font-light">{nextAction.label}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-300">{nextAction.detail}</p>
            <Link href={nextAction.href} className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-sage-100">
              Continue <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>

          <div className="sanctuary-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-sage-600">Quick actions</p>
                <h2 className="mt-1 text-xl font-medium text-stone-800">Do something meaningful now</h2>
              </div>
              <Church className="h-6 w-6 text-sage-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href} className="rounded-2xl border border-stone-100 bg-cream-50 p-4 text-sm font-medium text-stone-700 transition hover:border-sage-200 hover:bg-sage-50">
                  <action.icon className="mb-2 h-5 w-5 text-sage-600" />
                  {action.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-600">Ministry spaces</p>
              <h2 className="mt-2 text-3xl font-light text-stone-800">Everything you need, without the clutter</h2>
            </div>
            <Link href="/command-center" className="inline-flex items-center text-sm font-medium text-sage-700 hover:underline">Open command center <ExternalLink className="ml-1.5 h-3.5 w-3.5" /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ministrySpaces.map((space) => (
              <Link key={space.title} href={space.href} className="sanctuary-card group p-5 transition hover:-translate-y-1 hover:border-sage-200 hover:shadow-lg">
                <space.icon className="mb-4 h-6 w-6 text-sage-600 transition group-hover:scale-110" />
                <h3 className="font-medium text-stone-800">{space.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-500">{space.description}</p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-sage-700">Open <ChevronRight className="ml-1 h-3.5 w-3.5" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-600">Scripture intelligence</p>
            <h2 className="mt-2 text-3xl font-light text-stone-800">Go deeper, not just faster</h2>
          </div>
          <ScriptureDepthExperience />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="sanctuary-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-sage-600">Upcoming</p>
                <h3 className="mt-1 text-xl font-medium text-stone-800">Next Conference</h3>
              </div>
              <Calendar className="h-5 w-5 text-sage-500" />
            </div>
            {upcomingConference ? (
              <div className="rounded-2xl border border-sage-100 bg-sage-50 p-5">
                <h4 className="font-medium text-stone-800">{upcomingConference.title || 'Upcoming gathering'}</h4>
                <p className="mt-2 text-sm text-stone-600">{upcomingConference.startDate ? new Date(upcomingConference.startDate).toLocaleDateString() : 'Date to be announced'}</p>
                <Link href="/conferences" className="mt-4 inline-flex items-center text-sm font-semibold text-sage-700">View details <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-200 p-6 text-sm text-stone-500">No upcoming conference yet. Explore current church activities instead.</div>
            )}
          </div>

          <div className="sanctuary-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-sage-600">Spiritual pulse</p>
                <h3 className="mt-1 text-xl font-medium text-stone-800">Recent activity</h3>
              </div>
              <BookOpen className="h-5 w-5 text-sage-500" />
            </div>
            <div className="space-y-3">
              {activities.length ? activities.map((item, index) => (
                <div key={`${item.title || 'activity'}-${index}`} className="flex items-center gap-3 rounded-2xl border border-stone-100 p-4">
                  <div className="rounded-xl bg-sage-50 p-2 text-sage-600">{item.type === 'prayer' ? <Heart className="h-4 w-4" /> : <Activity className="h-4 w-4" />}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-800">{item.title || 'Ministry activity'}</p>
                    <p className="mt-0.5 text-xs text-stone-400">{item.time ? new Date(item.time).toLocaleDateString() : 'Recently'}</p>
                  </div>
                  {item.status && <span className="rounded-full bg-stone-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-500">{item.status}</span>}
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-stone-200 p-6 text-sm text-stone-500">Your recent prayer, goals, giving, and service activity will appear here.</div>
              )}
              <Link href="/journal" className="inline-flex w-full items-center justify-center rounded-2xl border border-dashed border-sage-200 py-3 text-sm font-medium text-sage-700 transition hover:bg-sage-50">
                <PlusCircle className="mr-2 h-4 w-4" /> Add journal entry
              </Link>
            </div>
          </div>
        </section>
      </div>

      <AIPastorModal isOpen={isAiPastorOpen} onClose={() => setIsAiPastorOpen(false)} />
    </main>
  );
}
