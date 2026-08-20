'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Calendar,
  Church,
  ExternalLink,
  Heart,
  HeartHandshake,
  MessageSquare,
  Play,
  PlusCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';
import { AIPastorModal } from '@/components/ai/AIPastorModal';
import { ScriptureDepthExperience } from '@/components/scripture/ScriptureDepthExperience';
import { LivingSanctuaryMissionControl } from '@/components/ministry/LivingSanctuaryMissionControl';
import { DailyMinistryFlow } from '@/components/ministry/DailyMinistryFlow';
import { NextBestMinistryAction } from '@/components/ministry/NextBestMinistryAction';
import { DashboardJourneyResume } from '@/components/journey/DashboardJourneyResume';

const CONFERENCE_CALENDAR_KEY = 'digital-church-conference-calendar:v1';

type ChurchCalendar = {
  id: string;
  name: string;
  role?: string | null;
  conferenceCount?: number;
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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ prayers: 0, goals: 0, offerings: 0, recentActivity: 0 });
  const [upcomingConference, setUpcomingConference] = useState<any>(null);
  const [conferenceChurch, setConferenceChurch] = useState<ChurchCalendar | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isAiPastorOpen, setIsAiPastorOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      const [prayers, offerings, goals, activityLog, publicCalendars, workspaceData] = await Promise.all([
        safeJson('/api/user/prayers'),
        safeJson('/api/user/offerings'),
        safeJson('/api/user/goals'),
        safeJson('/api/user/activity'),
        safeJson('/api/conferences/churches'),
        session?.user?.id ? safeJson('/api/church-ops/workspaces') : Promise.resolve(null),
      ]);

      if (cancelled) return;

      const prayerCount = Array.isArray(prayers) ? prayers.length : 0;
      const goalCount = Array.isArray(goals) ? goals.length : 0;
      const offeringTotal = Array.isArray(offerings)
        ? offerings.reduce((sum: number, offering: any) => sum + (Number(offering.amount) || 0), 0)
        : 0;
      const recentActivity = Array.isArray(activityLog) ? activityLog.length : 0;

      setStats({ prayers: prayerCount, goals: goalCount, offerings: offeringTotal, recentActivity });
      setActivities(Array.isArray(activityLog) ? activityLog : []);

      const calendarMap = new Map<string, ChurchCalendar>();
      if (Array.isArray(publicCalendars?.churches)) {
        publicCalendars.churches.forEach((church: ChurchCalendar) => calendarMap.set(church.id, church));
      }
      if (Array.isArray(workspaceData?.workspaces)) {
        workspaceData.workspaces.forEach((church: ChurchCalendar) => {
          calendarMap.set(church.id, { ...calendarMap.get(church.id), ...church });
        });
      }

      const calendars = Array.from(calendarMap.values());
      let remembered = '';
      try {
        remembered = window.localStorage.getItem(CONFERENCE_CALENDAR_KEY) || '';
      } catch {
        // The preference is optional.
      }

      const workspaceCalendars = calendars.filter((calendar) => Boolean(calendar.role));
      const selected = calendars.find((calendar) => calendar.id === remembered)
        || (workspaceCalendars.length === 1 ? workspaceCalendars[0] : null)
        || calendars[0]
        || null;

      if (!selected) {
        setUpcomingConference(null);
        setConferenceChurch(null);
        return;
      }

      setConferenceChurch(selected);
      try {
        window.localStorage.setItem(CONFERENCE_CALENDAR_KEY, selected.id);
      } catch {
        // The preference is optional.
      }

      const conferenceData = await safeJson(`/api/conferences?churchId=${encodeURIComponent(selected.id)}&upcoming=true`);
      if (cancelled) return;
      setUpcomingConference(Array.isArray(conferenceData) && conferenceData.length > 0 ? conferenceData[0] : null);
    };

    void loadDashboard();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || 'friend';
  const descriptiveStats = useMemo(() => [
    { label: 'Prayer records', value: stats.prayers, icon: Heart, note: 'Requests or prayer moments stored in this account.' },
    { label: 'Formation focuses', value: stats.goals, icon: Activity, note: 'Chosen goals or practices—not a maturity score.' },
    { label: 'Recorded giving', value: `$${stats.offerings.toLocaleString()}`, icon: WalletCards, note: 'Your recorded giving history, visible only in your account experience.' },
    { label: 'Recent moments', value: stats.recentActivity, icon: Users, note: 'Recent in-app actions, not a measure of faithfulness.' },
  ], [stats]);

  const quickActions = [
    { title: 'Enter prayer', description: 'Pray privately, share intentionally, or request human care.', icon: HeartHandshake, href: '/prayer-room' },
    { title: 'Open the Word', description: 'Return to Scripture before commentary or application.', icon: BookOpen, href: '/scripture' },
    { title: 'Join worship', description: 'Open the configured worship sanctuary and service response.', icon: Radio, href: '/live-service' },
    { title: 'Share fellowship', description: 'Encourage the moderated community without exposing private care.', icon: MessageSquare, href: '/community-wall' },
  ];

  return (
    <main className="sanctuary-page-shell min-h-screen bg-[#06110f] pb-20 pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl">
                <Sparkles className="mr-2 h-4 w-4" /> Personal Sanctuary
              </div>
              <h1 className="mt-6 text-4xl font-light leading-[1.04] text-white md:text-7xl">Welcome back, {firstName}. Return to what matters without being ranked by the app.</h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">Prayer, Scripture, worship, formation, giving history, and saved moments can remain connected here. The dashboard describes your records; it does not score holiness, divine favor, or spiritual maturity.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/prayer-room" className="sacred-primary-button"><HeartHandshake className="h-4 w-4" /> Enter prayer</Link>
                <Link href="/journey" className="sacred-secondary-button"><Sparkles className="h-4 w-4" /> Resume Journey</Link>
                <Link href="/live-service" className="sacred-secondary-button"><Play className="h-4 w-4" /> Worship sanctuary</Link>
              </div>
            </motion.div>

            <motion.aside initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="sacred-panel-dark relative z-10 p-6">
              <p className="sanctuary-section-label text-emerald-200/60">No spiritual score</p>
              <h2 className="mt-2 text-2xl font-light text-white">Counts provide continuity, not a verdict.</h2>
              <div className="mt-5 space-y-3 text-xs leading-6 text-white/48">
                <p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Prayer frequency, giving amount, attendance, and activity volume are not used to rank your faith.</p>
                <p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Sensitive pastoral case data and child records stay outside the recommendation layer.</p>
                <p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Human care and Scripture remain available even when AI services are unavailable.</p>
              </div>
            </motion.aside>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {descriptiveStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + index * 0.04 }} className="sacred-panel-dark p-5">
                  <Icon className="h-5 w-5 text-amber-100" />
                  <p className="mt-4 text-3xl font-light text-white">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold text-white/72">{stat.label}</p>
                  <p className="mt-2 text-[10px] leading-5 text-white/36">{stat.note}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] px-4 py-12 text-stone-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <LivingSanctuaryMissionControl />
          <DailyMinistryFlow />
          <NextBestMinistryAction prayers={stats.prayers} goals={stats.goals} activityCount={activities.length} />
          <DashboardJourneyResume />

          <div className="mb-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="group rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></div>
                  <h2 className="mt-4 font-semibold text-stone-800">{action.title}</h2>
                  <p className="mt-2 text-xs leading-6 text-stone-500">{action.description}</p>
                  <ArrowRight className="mt-4 h-4 w-4 text-emerald-700 transition group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>

          <div className="mb-12 grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="sanctuary-section-label text-emerald-700">Church gathering continuity</p>
                  <h2 className="mt-2 text-3xl font-light text-stone-800">{conferenceChurch?.name || 'Choose a church calendar'}</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-500">The dashboard resolves an explicit accessible church calendar before requesting an upcoming conference. It never falls back to a shadow global event feed.</p>
                </div>
                <Church className="h-6 w-6 text-emerald-600" />
              </div>

              {upcomingConference ? (
                <div className="mt-6 rounded-[1.75rem] bg-[#081713] p-6 text-white">
                  <span className="rounded-full border border-emerald-200/15 bg-emerald-200/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-200">Upcoming</span>
                  <h3 className="mt-4 text-2xl font-light">{upcomingConference.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">{upcomingConference.theme}</p>
                  <p className="mt-5 flex items-center text-xs text-white/55"><Calendar className="mr-2 h-4 w-4 text-amber-100" /> {new Date(upcomingConference.startDate).toLocaleString()}</p>
                  <Link href="/conferences" className="sacred-secondary-button mt-5">Open church calendar <ArrowRight className="h-4 w-4" /></Link>
                </div>
              ) : (
                <div className="mt-6 rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
                  <Calendar className="mx-auto h-7 w-7 text-stone-300" />
                  <p className="mt-3 font-medium text-stone-700">No upcoming gathering was found in the selected accessible calendar.</p>
                  <Link href="/conferences" className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700">Choose or inspect a church calendar <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="sanctuary-section-label text-emerald-700">Quiet intelligence</p>
              <h2 className="mt-2 text-3xl font-light text-stone-800">Ask for reflection, then keep a person within reach.</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">The AI Ministry Companion can help organize Scripture-grounded reflection or prayer language. It does not become a pastor, counselor, prophet, clinician, or emergency service.</p>
              <div className="mt-6 flex flex-col gap-3">
                <button type="button" onClick={() => setIsAiPastorOpen(true)} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-semibold text-white"><Sparkles className="mr-2 h-4 w-4" /> Open AI Ministry Companion</button>
                <Link href="/care" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700"><HeartHandshake className="mr-2 h-4 w-4 text-rose-500" /> Request human care</Link>
              </div>
            </section>
          </div>

          <section className="mb-12">
            <div className="mb-7 max-w-3xl">
              <p className="sanctuary-section-label text-emerald-700">Scripture excavation</p>
              <h2 className="mt-2 text-4xl font-light text-stone-800">Open the text before the interpretation</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">Use the existing Scripture Depth experience for observation, context, notes, and study support.</p>
            </div>
            <ScriptureDepthExperience />
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="sanctuary-section-label text-emerald-700">Recent account moments</p>
                <h2 className="mt-2 text-3xl font-light text-stone-800">History, not holiness</h2>
                <p className="mt-2 text-xs leading-5 text-stone-500">A factual list of recent in-app actions. It is never presented as spiritual rank.</p>
              </div>
              <Link href="/journal" className="inline-flex items-center text-sm font-semibold text-emerald-700"><ExternalLink className="mr-2 h-4 w-4" /> Open journal</Link>
            </div>

            <div className="space-y-3">
              {activities.length > 0 ? activities.slice(0, 12).map((item, index) => (
                <div key={`${item?.time || index}-${index}`} className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-stone-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                    {item.type === 'goal' ? <Activity className="h-4 w-4" /> : item.type === 'prayer' ? <Heart className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-800">{item.title || 'Account activity'}</p>
                    <p className="mt-1 text-xs text-stone-400">{item.time ? new Date(item.time).toLocaleString() : 'Time unavailable'}</p>
                  </div>
                  {item.status && <span className="hidden rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-stone-500 sm:inline-flex">{String(item.status)}</span>}
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500">Recent in-app activity will appear here when available.</div>
              )}
              <Link href="/journal" className="flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 text-sm font-semibold text-stone-500 transition hover:border-emerald-200 hover:text-emerald-700"><PlusCircle className="mr-2 h-4 w-4" /> Add a journal entry</Link>
            </div>
          </section>
        </div>
      </section>

      <AIPastorModal isOpen={isAiPastorOpen} onClose={() => setIsAiPastorOpen(false)} />
    </main>
  );
}
