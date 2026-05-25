import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

type Feature = {
  title: string;
  description: string;
};

type MinistryRoutePageProps = {
  badge: string;
  title: string;
  description: string;
  emoji: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  features: Feature[];
  intelligence: Feature[];
  safeguards: string[];
};

export function MinistryRoutePage({
  badge,
  title,
  description,
  emoji,
  primaryHref = '/dashboard',
  primaryLabel = 'Open dashboard',
  secondaryHref = '/community-wall',
  secondaryLabel = 'Visit community',
  features,
  intelligence,
  safeguards,
}: MinistryRoutePageProps) {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(120,155,100,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(210,180,140,0.24),_transparent_35%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              {badge}
            </div>
            <h1 className="max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-800 md:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">{description}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryHref} className="inline-flex items-center justify-center rounded-full bg-sage-600 px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-sage-200 transition hover:bg-sage-700">
                {primaryLabel} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href={secondaryHref} className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white/80 px-7 py-4 text-sm font-semibold text-stone-700 transition hover:border-sage-300 hover:text-sage-700">
                {secondaryLabel}
              </Link>
            </div>
          </div>

          <div className="sanctuary-card p-8 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-sage-600">Route intelligence</p>
                <h2 className="mt-2 text-2xl text-stone-800">{badge}</h2>
              </div>
              <div className="rounded-3xl bg-sage-100 p-4 text-4xl">{emoji}</div>
            </div>
            <div className="space-y-4">
              {intelligence.map((item) => (
                <div key={item.title} className="rounded-2xl border border-cream-200 bg-white/75 p-4">
                  <p className="font-medium text-stone-800">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-cream-200 bg-white/60 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-sage-600" />
            <h2 className="text-3xl font-light text-stone-800">Professional workflow</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="sanctuary-card p-6">
                <CheckCircle2 className="mb-4 h-6 w-6 text-sage-600" />
                <h3 className="text-xl font-medium text-stone-800">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-stone-900 p-8 text-white shadow-2xl md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sage-200">Trust and safety</p>
          <h2 className="mt-3 text-3xl font-light">Designed to serve people with dignity, not confusion.</h2>
          <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {safeguards.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-stone-100">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
