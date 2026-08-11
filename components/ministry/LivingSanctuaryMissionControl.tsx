'use client';

import Link from 'next/link';
import {
  Activity,
  BookOpenText,
  Church,
  HandHeart,
  HeartHandshake,
  Music2,
  Radio,
  Sparkles,
  UsersRound,
  WalletCards,
  WandSparkles,
} from 'lucide-react';

const primaryActions = [
  {
    title: 'Join Live Worship',
    description: 'Enter the live sanctuary, participate in worship, and stay connected to the service flow.',
    href: '/live-service',
    icon: Radio,
  },
  {
    title: 'Respond to the Service',
    description: 'Move directly into prayer, pastoral care, discipleship, church connection, service, or transparent support.',
    href: '/service-response',
    icon: HandHeart,
  },
  {
    title: 'Pray & Receive Care',
    description: 'Share a prayer request privately or ask for human pastoral follow-up when needed.',
    href: '/prayer-room',
    icon: HeartHandshake,
  },
  {
    title: 'Continue Your Journey',
    description: 'Review your private spiritual rhythm, milestones, notes, and recommended next steps.',
    href: '/journey',
    icon: Activity,
  },
  {
    title: 'Discover Churches',
    description: 'Find church communities, gatherings, resources, and ministry connections across the network.',
    href: '/church-network',
    icon: Church,
  },
];

const ministryTools = [
  { title: 'Scripture Study', href: '/scripture', icon: BookOpenText },
  { title: 'Fasting & Prayer', href: '/fasting-prayer', icon: HeartHandshake },
  { title: 'Sermon Studio', href: '/sermons', icon: BookOpenText },
  { title: 'Choir & Hymn Studio', href: '/choir', icon: Music2 },
  { title: 'Worship Media', href: '/worship-media', icon: Sparkles },
  { title: 'Presentation Studio', href: '/presentation', icon: WandSparkles },
  { title: 'Sanctuary Activities', href: '/activities', icon: UsersRound },
  { title: 'Rewards & Gifts', href: '/rewards', icon: WalletCards },
  { title: 'Ministry Intelligence', href: '/intelligence', icon: Sparkles },
];

export function LivingSanctuaryMissionControl() {
  return (
    <section className="mb-12 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
      <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Living Sanctuary Mission Control
              </div>
              <h2 className="max-w-2xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">
                One place to worship, respond, grow, serve, connect, and move ministry forward.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                Digital Church OS organizes meaningful spiritual and ministry actions into one focused daily flow instead of making people search through disconnected modules.
              </p>
            </div>
            <Link
              href="/sanctuary-host"
              className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-sage-200 bg-sage-50 px-5 py-3 text-sm font-semibold text-sage-700 transition hover:bg-sage-100"
            >
              Ask Sanctuary Host
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {primaryActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group rounded-3xl border border-stone-100 bg-stone-50 p-5 transition hover:-translate-y-0.5 hover:border-sage-200 hover:bg-sage-50/50 hover:shadow-sm"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-white p-3 text-sage-700 shadow-sm transition group-hover:bg-sage-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="border-t border-stone-100 bg-stone-950 p-6 text-white sm:p-8 lg:p-10 xl:border-l xl:border-t-0">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-300">Ministry toolkit</p>
            <h3 className="mt-2 text-2xl font-light">Create, lead, study, worship, and serve without losing momentum.</h3>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {ministryTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-stone-200 transition hover:border-sage-400/50 hover:bg-white/5 hover:text-white"
                >
                  <span className="rounded-xl bg-white/10 p-2 text-sage-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{tool.title}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-sage-400/20 bg-sage-400/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-sage-300">Daily guidance</p>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              Start with prayer and Scripture, continue one spiritual growth action, then serve or encourage someone. Ministry intelligence remains advisory and should strengthen—not replace—human pastoral leadership.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
