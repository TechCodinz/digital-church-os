import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Activity, LockKeyhole } from 'lucide-react';

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
    <div className="min-h-screen bg-cream-50 pt-20 sm:pt-24">
      <section className="relative overflow-hidden px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(120,155,100,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(210,180,140,0.24),_transparent_35%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_0.8fr] lg:gap-10">
          <div>
            <div className="mb-5 inline-flex items-center rounded-full border border-sage-200 bg-white/80 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm backdrop-blur">
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              {badge}
            </div>
            <h1 className="max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-800 md:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">{description}</p>

            <div className="mt-7 flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500">
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white/80 px-3 py-1.5">
                <Activity className="mr-1.5 h-3.5 w-3.5 text-sage-600" aria-hidden="true" /> Live ministry workflow
              </span>
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white/80 px-3 py-1.5">
                <LockKeyhole className="mr-1.5 h-3.5 w-3.5 text-sage-600" aria-hidden="true" /> Guarded by role & policy
              </span>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryHref} className="inline-flex min-h-12 items-center justify-center rounded-full bg-sage-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-sage-200 transition hover:-translate-y-0.5 hover:bg-sage-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2">
                {primaryLabel} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href={secondaryHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-200 bg-white/85 px-7 py-3.5 text-sm font-semibold text-stone-700 transition hover:-translate-y-0.5 hover:border-sage-300 hover:text-sage-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2">
                {secondaryLabel}
              </Link>
            </div>
          </div>

          <div className="sanctuary-card overflow-hidden p-0 shadow-2xl">
            <div className="border-b border-cream-200 bg-gradient-to-br from-white to-sage-50/70 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-sage-600">Route intelligence</p>
                  <h2 className="mt-2 text-2xl text-stone-800">{badge}</h2>
                  <p className="mt-2 text-sm text-stone-500">Actionable ministry guidance for this workspace.</p>
                </div>
                <div className="rounded-3xl border border-sage-100 bg-white p-4 text-4xl shadow-sm" aria-hidden="true">{emoji}</div>
              </div>
            </div>
            <div className="space-y-3 p-5 sm:p-6">
              {intelligence.map((item, index) => (
                <div key={item.title} className="group rounded-2xl border border-cream-200 bg-white/80 p-4 transition hover:border-sage-200 hover:shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-100 text-xs font-bold text-sage-700">{index + 1}</span>
                    <div>
                      <p className="font-medium text-stone-800">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-cream-200 bg-white/65 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-sage-100 p-3 text-sage-700">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sage-600">Execution layer</p>
              <h2 className="mt-1 text-3xl font-light text-stone-800">Professional workflow</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="sanctuary-card group p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <CheckCircle2 className="mb-4 h-6 w-6 text-sage-600" aria-hidden="true" />
                <h3 className="text-xl font-medium text-stone-800">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-stone-900 p-7 text-white shadow-2xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sage-200">Trust and safety</p>
              <h2 className="mt-3 text-3xl font-light leading-tight">Designed to serve people with dignity, clarity, and accountable intelligence.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {safeguards.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-6 text-stone-100 backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}