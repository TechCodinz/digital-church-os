'use client';

import Link from 'next/link';
import { ArrowRight, HeartHandshake, BookOpenText, Sparkles, UsersRound, Radio } from 'lucide-react';

type Props = {
  prayers: number;
  goals: number;
  offerings: number;
  activityCount: number;
};

type Recommendation = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  label: string;
  icon: typeof Sparkles;
};

function chooseRecommendation({ prayers, goals, offerings, activityCount }: Props): Recommendation {
  if (prayers === 0) {
    return {
      eyebrow: 'Begin with prayer',
      title: 'Bring one real need before God today.',
      description: 'Start with a private prayer, pray for someone else, or request human pastoral follow-up if the need is sensitive.',
      href: '/prayer-room',
      label: 'Open prayer room',
      icon: HeartHandshake,
    };
  }

  if (goals === 0) {
    return {
      eyebrow: 'Turn prayer into formation',
      title: 'Choose one spiritual growth focus for this season.',
      description: 'Create a simple goal around Scripture, prayer, service, forgiveness, generosity, or another meaningful discipleship practice.',
      href: '/journey',
      label: 'Continue your journey',
      icon: BookOpenText,
    };
  }

  if (activityCount < 2) {
    return {
      eyebrow: 'Move from reflection to service',
      title: 'Encourage or serve one person today.',
      description: 'Faith becomes tangible through service. Choose a ministry activity, practical need, or community action you can complete with care.',
      href: '/activities',
      label: 'Find a way to serve',
      icon: UsersRound,
    };
  }

  if (offerings === 0) {
    return {
      eyebrow: 'Practice transparent generosity',
      title: 'Explore where giving can create visible impact.',
      description: 'Review giving and aid pathways before contributing. Generosity should be voluntary, transparent, and never pressured.',
      href: '/transparency',
      label: 'View giving impact',
      icon: Sparkles,
    };
  }

  return {
    eyebrow: 'Stay connected',
    title: 'Join worship or community and carry your growth into fellowship.',
    description: 'Your current rhythm is active. The next useful step is shared worship, encouragement, or participation with the wider church community.',
    href: '/live-service',
    label: 'Join live worship',
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
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 sm:text-base">
            {recommendation.description}
          </p>
          <p className="mt-3 text-xs text-stone-500">
            This recommendation is private and advisory. It is based only on your current in-app activity signals and does not replace pastoral discernment.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <Link
            href={recommendation.href}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 lg:w-auto"
          >
            {recommendation.label} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
