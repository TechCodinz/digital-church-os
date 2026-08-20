'use client';

import Link from 'next/link';
import { AlertTriangle, BellRing, HeartHandshake, ShieldCheck, Users, ArrowRight, Rocket } from 'lucide-react';

const attentionItems = [
  {
    title: 'Care & follow-up',
    description: 'Review member care escalations, prayer follow-ups, and sensitive pastoral needs.',
    href: '/care',
    icon: HeartHandshake,
    tone: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  {
    title: 'Community moderation',
    description: 'Review pending posts, reports, and anything that could affect community safety.',
    href: '/admin/posts',
    icon: ShieldCheck,
    tone: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    title: 'People & ministry coverage',
    description: 'Check member growth, volunteer coverage, assignments, and upcoming ministry load.',
    href: '/command-center',
    icon: Users,
    tone: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    title: 'Church launch setup',
    description: 'Walk through identity, care, streaming, stewardship, team coverage, and launch preparation.',
    href: '/admin/onboarding',
    icon: Rocket,
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    title: 'Release readiness',
    description: 'See launch blockers, feature-flag posture, rights holds, and operational warnings.',
    href: '/release-readiness',
    icon: AlertTriangle,
    tone: 'bg-violet-50 text-violet-700 border-violet-100',
  },
];

export function LeaderAttentionPanel() {
  return (
    <section className="mb-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            <BellRing size={13} /> Leadership Attention
          </div>
          <h2 className="text-2xl font-light text-stone-900">What needs pastoral attention now?</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">
            A focused operating view for care, moderation, people coverage, launch setup, and release readiness. AI recommendations stay advisory and sensitive ministry actions remain human-led.
          </p>
        </div>
        <Link href="/intelligence" className="inline-flex items-center gap-2 text-sm font-medium text-sage-700 hover:text-sage-800">
          Open ministry intelligence <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {attentionItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href} className={`group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-sm ${item.tone}`}>
              <Icon size={22} className="mb-4" />
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 opacity-80">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
                Review <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
