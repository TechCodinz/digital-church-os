'use client';

import Link from 'next/link';
import {
  Activity,
  BookOpenText,
  Church,
  HandHeart,
  HeartHandshake,
  Home,
  Music2,
  Radio,
  School,
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

const ministryMap = [
  {
    label: 'Spiritual growth',
    items: [
      { title: 'Family Altar', href: '/family-altar', description: 'Shared Scripture, prayer, reflection, and daily household rhythm.', icon: Home },
      { title: 'Fasting Companion', href: '/fasting-companion', description: 'Scripture-led fasting plans, intentions, reflections, and responsible safeguards.', icon: HeartHandshake },
      { title: 'Dream Discernment', href: '/dream-discernment', description: 'Record and reflect without treating AI interpretation as revelation or prophecy.', icon: Sparkles },
      { title: 'Growth DNA', href: '/growth-dna', description: 'Private discipleship pathway, habits, formation goals, and next-step planning.', icon: Activity },
      { title: 'Scripture Immersion', href: '/scripture-immersion', description: 'Translation-aware study, insight lab, auto-jot notes, prayer, and daily alignment.', icon: BookOpenText },
    ],
  },
  {
    label: 'Ministry & worship',
    items: [
      { title: 'Minister Portal', href: '/minister-portal', description: 'Operational command surface for teams, services, follow-up, events, and ministry work.', icon: UsersRound },
      { title: 'Pastoral Hub', href: '/pastoral-hub', description: 'Pastoral care pathways with protected follow-up and human-led sensitive decisions.', icon: HandHeart },
      { title: 'Sunday School', href: '/sunday-school', description: 'Age-aware Bible learning, family oversight, trusted-adult boundaries, and formation.', icon: School },
      { title: 'Denominations', href: '/denominations', description: 'Church discovery and network context without flattening doctrinal differences.', icon: Church },
      { title: 'Choir Studio', href: '/choir-studio', description: 'Hymns, gospel, praise, worship, SATB parts, rehearsal recording, metronome, and song drafting.', icon: Music2 },
    ],
  },
  {
    label: 'Global community',
    items: [
      { title: 'Global Network', href: '/global-network', description: 'Discover churches, gatherings, resources, and ministry relationships across communities.', icon: Church },
      { title: 'Prayer Watch', href: '/prayer-watch', description: 'Private prayer rhythm, Scripture prompts, recording, reflection, and answered-prayer notes.', icon: HeartHandshake },
      { title: 'Give & Offering', href: '/give-offering', description: 'Purpose-aware giving with transparent ministry pathways and protected financial actions.', icon: WalletCards },
      { title: 'Community Wall', href: '/community-wall', description: 'Moderated testimonies, encouragement, Scripture references, search, sharing, and care handoffs.', icon: UsersRound },
    ],
  },
];

export function LivingSanctuaryMissionControl() {
  return (
    <section className="mb-12 space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
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
              <Link href="/sanctuary-host" className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-sage-200 bg-sage-50 px-5 py-3 text-sm font-semibold text-sage-700 transition hover:bg-sage-100">
                Ask Sanctuary Host
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {primaryActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.title} href={action.href} className="group rounded-3xl border border-stone-100 bg-stone-50 p-5 transition hover:-translate-y-0.5 hover:border-sage-200 hover:bg-sage-50/50 hover:shadow-sm">
                    <div className="mb-4 inline-flex rounded-2xl bg-white p-3 text-sage-700 shadow-sm transition group-hover:bg-sage-600 group-hover:text-white"><Icon className="h-5 w-5" /></div>
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
                  <Link key={tool.href} href={tool.href} className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-stone-200 transition hover:border-sage-400/50 hover:bg-white/5 hover:text-white">
                    <span className="rounded-xl bg-white/10 p-2 text-sage-300"><Icon className="h-4 w-4" /></span>
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
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 bg-gradient-to-r from-sage-50 to-cream-50 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage-700">All ministry destinations</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-2xl font-light text-stone-900 sm:text-3xl">Every destination opens the actual ministry workspace.</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">The sanctuary map and mobile navigation now share the same dedicated destinations. Mature engines such as fasting, Scripture, choir, and offering keep their specialized implementations behind their named entry routes.</p>
            </div>
            <Link href="/command-center" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-sage-200 bg-white px-5 text-sm font-semibold text-sage-700 transition hover:bg-sage-50">Church command center</Link>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-3">
          {ministryMap.map((group, groupIndex) => (
            <div key={group.label} className={`p-5 sm:p-6 ${groupIndex > 0 ? 'border-t border-stone-100 lg:border-l lg:border-t-0' : ''}`}>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-sage-700">{group.label}</p>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={`${group.label}-${item.title}`} href={item.href} className="group flex min-h-[5.25rem] items-start gap-3 rounded-2xl border border-transparent p-3 transition hover:border-sage-100 hover:bg-sage-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500">
                      <span className="mt-0.5 rounded-xl bg-stone-50 p-2 text-sage-700 transition group-hover:bg-white"><Icon className="h-4 w-4" /></span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-stone-800">{item.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-stone-500">{item.description}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
