import Link from 'next/link';
import {
  BookOpenText,
  Church,
  Gift,
  HandHeart,
  HeartHandshake,
  Radio,
  UsersRound,
} from 'lucide-react';

const pathways = [
  {
    title: 'Worship now',
    description: 'Join a live service, enter worship media, or participate in an active gathering.',
    href: '/live-service',
    icon: Radio,
    accent: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  {
    title: 'I need prayer or care',
    description: 'Share a prayer request, receive support, or ask for human pastoral follow-up.',
    href: '/prayer-room',
    icon: HeartHandshake,
    accent: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    title: 'Find a church connection',
    description: 'Explore churches, ministries, shared resources, gatherings, and trusted connections.',
    href: '/church-network',
    icon: Church,
    accent: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    title: 'Grow in Scripture',
    description: 'Read, study, compare passages, and continue a deeper discipleship journey.',
    href: '/scripture',
    icon: BookOpenText,
    accent: 'bg-violet-50 text-violet-700 border-violet-100',
  },
  {
    title: 'Serve someone',
    description: 'Join ministry activities, practical service, outreach, and community support.',
    href: '/activities',
    icon: HandHeart,
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    title: 'See giving impact',
    description: 'Give with purpose and follow the transparent impact of ministry support.',
    href: '/impact',
    icon: Gift,
    accent: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
  },
];

export function GospelAccessPathways() {
  return (
    <section className="border-y border-stone-200 bg-white px-4 py-18 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-16">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700">
              <UsersRound size={14} /> Gospel access pathways
            </div>
            <h2 className="max-w-3xl text-3xl font-light leading-tight text-stone-900 md:text-4xl">
              Start with what you need right now—not with a menu of software features.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 sm:text-base">
              Digital Church OS organizes ministry around real human moments: worship, care, Scripture, church connection, service, and trusted generosity.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Open my sanctuary
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pathways.map((pathway) => {
            const Icon = pathway.icon;
            return (
              <Link
                key={pathway.title}
                href={pathway.href}
                className={`group rounded-3xl border p-6 transition hover:-translate-y-0.5 hover:shadow-sm ${pathway.accent}`}
              >
                <div className="mb-5 inline-flex rounded-2xl bg-white/80 p-3 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900">{pathway.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{pathway.description}</p>
                <span className="mt-5 inline-flex text-sm font-semibold transition group-hover:translate-x-0.5">Continue →</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
