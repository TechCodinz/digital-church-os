'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Heart,
  Loader2,
  MessageCircleHeart,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';

type Snapshot = {
  prayers: number;
  goals: number;
  giving: number;
  activity: number;
  conferenceTitle?: string;
  conferenceDate?: string;
};

type ActionCard = {
  title: string;
  description: string;
  href: string;
  label: string;
  icon: typeof Heart;
  priority: 'Now' | 'Today' | 'This week';
};

const fallbackSnapshot: Snapshot = {
  prayers: 0,
  goals: 0,
  giving: 0,
  activity: 0,
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

export function MinistryCommandCenter() {
  const [snapshot, setSnapshot] = useState<Snapshot>(fallbackSnapshot);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const [prayers, goals, offerings, activity, conferences] = await Promise.all([
      safeJson('/api/user/prayers'),
      safeJson('/api/user/goals'),
      safeJson('/api/user/offerings'),
      safeJson('/api/user/activity'),
      safeJson('/api/conferences?upcoming=true'),
    ]);

    const prayerList = Array.isArray(prayers) ? prayers : [];
    const goalList = Array.isArray(goals) ? goals : [];
    const offeringList = Array.isArray(offerings) ? offerings : [];
    const activityList = Array.isArray(activity) ? activity : [];
    const conferenceList = Array.isArray(conferences) ? conferences : [];
    const nextConference = conferenceList[0];

    setSnapshot({
      prayers: prayerList.length,
      goals: goalList.length,
      giving: offeringList.reduce((sum: number, item: any) => sum + Number(item?.amount || 0), 0),
      activity: activityList.length,
      conferenceTitle: nextConference?.title,
      conferenceDate: nextConference?.startDate,
    });

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const growthScore = useMemo(() => {
    return Math.min(
      100,
      Math.max(8, snapshot.prayers * 10 + snapshot.goals * 12 + Math.min(snapshot.activity * 5, 45) + (snapshot.giving > 0 ? 15 : 0)),
    );
  }, [snapshot]);

  const actions = useMemo<ActionCard[]>(() => {
    const next: ActionCard[] = [];

    if (snapshot.prayers === 0) {
      next.push({
        title: 'Begin with prayer',
        description: 'Create a private or shared prayer request and let the platform help you keep the request active through follow-up.',
        href: '/prayer-room',
        label: 'Open prayer room',
        icon: Heart,
        priority: 'Now',
      });
    } else {
      next.push({
        title: 'Continue your prayer rhythm',
        description: `You have ${snapshot.prayers} prayer ${snapshot.prayers === 1 ? 'entry' : 'entries'}. Revisit one and record what has changed.`,
        href: '/prayer-room',
        label: 'Review prayers',
        icon: MessageCircleHeart,
        priority: 'Today',
      });
    }

    if (snapshot.goals === 0) {
      next.push({
        title: 'Set one spiritual goal',
        description: 'Choose a simple next milestone around scripture, prayer, service, family worship, or outreach.',
        href: '/journey',
        label: 'Plan my journey',
        icon: Activity,
        priority: 'Today',
      });
    } else {
      next.push({
        title: 'Advance your current milestone',
        description: `You currently have ${snapshot.goals} tracked spiritual ${snapshot.goals === 1 ? 'goal' : 'goals'}. Choose the one that needs action today.`,
        href: '/journey',
        label: 'Open spiritual journey',
        icon: BookOpen,
        priority: 'Today',
      });
    }

    if (snapshot.conferenceTitle) {
      next.push({
        title: snapshot.conferenceTitle,
        description: snapshot.conferenceDate
          ? `Your next gathering is scheduled for ${new Date(snapshot.conferenceDate).toLocaleDateString()}. Prepare, share, or invite someone.`
          : 'An upcoming gathering is available. Review the program and prepare to participate.',
        href: '/conferences',
        label: 'View gathering',
        icon: CalendarDays,
        priority: 'This week',
      });
    } else {
      next.push({
        title: 'Join a live gathering',
        description: 'Explore current services, prayer rooms, worship gatherings, and conferences available across the platform.',
        href: '/live-broadcast',
        label: 'Explore live worship',
        icon: Play,
        priority: 'This week',
      });
    }

    return next.slice(0, 3);
  }, [snapshot]);

  if (loading) {
    return (
      <div className="sanctuary-card flex min-h-[320px] items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-sage-600" />
          <p className="mt-3 text-sm text-stone-500">Preparing your ministry pulse…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-stone-900 p-7 text-white shadow-2xl md:p-9">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sage-200">
              <Sparkles className="mr-2 h-4 w-4" /> Living ministry pulse
            </div>
            <h2 className="mt-5 text-3xl font-light md:text-4xl">One place to know what matters next.</h2>
            <p className="mt-3 leading-7 text-stone-300">
              Your prayer, growth, participation, and giving signals are summarized privately to suggest practical next actions—not to rank your faith.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-stone-400">Private growth pulse</p>
            <p className="mt-2 text-5xl font-light text-white">{growthScore}%</p>
            <button
              type="button"
              onClick={() => void load(true)}
              disabled={refreshing}
              className="mt-4 inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-stone-900 transition hover:bg-sage-100 disabled:opacity-60"
            >
              {refreshing && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Refresh pulse
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Prayer rhythm', value: snapshot.prayers, icon: Heart },
          { label: 'Active goals', value: snapshot.goals, icon: Activity },
          { label: 'Recent activity', value: snapshot.activity, icon: Users },
          { label: 'Giving recorded', value: `$${snapshot.giving.toFixed(2)}`, icon: WalletCards },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="sanctuary-card p-5">
              <Icon className="h-5 w-5 text-sage-600" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{item.label}</p>
              <p className="mt-2 text-3xl font-light text-stone-800">{item.value}</p>
            </div>
          );
        })}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sage-600">Next best ministry actions</p>
            <h3 className="mt-2 text-2xl font-light text-stone-800">Move forward without feeling overwhelmed.</h3>
          </div>
          <ShieldCheck className="hidden h-7 w-7 text-sage-600 sm:block" />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.title} className="sanctuary-card flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-2xl bg-sage-100 p-3 text-sage-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-cream-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {action.priority}
                  </span>
                </div>
                <h4 className="mt-5 text-xl font-medium text-stone-800">{action.title}</h4>
                <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">{action.description}</p>
                <Link href={action.href} className="mt-6 inline-flex items-center text-sm font-semibold text-sage-700 hover:text-sage-800">
                  {action.label} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
