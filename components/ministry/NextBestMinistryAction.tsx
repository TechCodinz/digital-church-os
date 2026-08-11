'use client';

import Link from 'next/link';
import { ArrowRight, HeartHandshake, BookOpenText, UsersRound, Radio } from 'lucide-react';

type Props = {
  prayers: number;
  goals: number;
  activityCount: number;
};

type Recommendation = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  label: string;
  icon: typeof HeartHandshake;
};

function chooseRecommendation({ prayers, goals, activityCount }: Props): Recommendation {
  if (prayers === 0) {
    return {
      eyebrow: 'A prayer pathway is available',
      title: 'Bring one real need, gratitude, or person before God today.',
      description: 'Start with a private prayer, pray for someone else, or request human pastoral follow-up if the need is sensitive. A zero count here may simply mean you have not used this app for prayer before.',
      href: '/prayer-room',
      label: 'Open prayer room',
      icon: HeartHandshake,
    };
  }

  if (goals === 0) {
    return {
      eyebrow: 'Choose a formation focus',
      title: 'Name one practice or relationship you want to tend this season.',
      description: 'You can create a simple focus around Scripture, prayer, service, forgiveness, rest, community, or another meaningful discipleship practice. This is an invitation, not a measure of maturity.',
      href: '/journey',
      label: 'Continue your journey',
      icon: BookOpenText,
    };
  }

  if (activityCount < 2) {
    return {
      eyebrow: 'A service pathway is available',
      title: 'Consider encouraging or serving one person today.',
      description: 'Choose a practical ministry activity or community action if it fits your capacity. The app does not treat activity volume as a spiritual score.',
      href: '/activities',
      label: 'Explore ways to serve',
      icon: UsersRound,
    };
  }

  return {
    eyebrow: 'Stay connected',
    title: 'Join worship, community, or return to a private journey moment.',
    description: 'A useful next step may be shared worship, encouragement, Scripture, or revisiting something you intentionally saved. Choose what fits your real context and responsible human discernment.',
    href: '/journey',
    label: 'Open private Journey',
    icon: Radio,
  };
}

export function NextBestMinistryAction(props: Props) {
  const recommendation = chooseRecommendation(props);
  const Icon = recommendation.icon;

  return (
    <section className="mb-12 overflow-hidden rounded-[2rem] border border-sage-200 bg-gradient-to-br from-sage-50 via-white to-amber-50 shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="p-6 sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-600 text-white shadow-lg shadow-sage-200">
            <Icon className="h-6 w-6" />
          </div>
        </div>

        <div className="px-6 pb-2 sm:px-8 lg:px-0 lg:pb-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-700">{recommendation.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-light text-stone-900 sm:text-3xl">{recommendation.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 sm:text-base">{recommendation.description}</p>
          <p className="mt-3 text-xs text-stone-500">Private and advisory only. Giving amounts, wallet activity, pastoral case data, child activity, and other sensitive signals are not used to choose this recommendation.</p>
        </div>

        <div className="p-6 sm:p-8">
          <Link href={recommendation.href} className="inline-flex w-full items-center justify-center rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 lg:w-auto">
            {recommendation.label} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
