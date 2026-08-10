import Link from 'next/link';
import { ArrowRight, HeartHandshake, Mic2, ShieldCheck, Sparkles, Users, WalletCards } from 'lucide-react';
import { GospelAccessPathways } from '@/components/ministry/GospelAccessPathways';

const pillars = [
  {
    title: 'AI Pastoral Care',
    description: 'Guided spiritual support with pastoral guardrails, crisis awareness, and clear handoff to human leaders.',
    href: '/spiritual',
    icon: Sparkles,
  },
  {
    title: 'Prayer & Intercession',
    description: 'Private, public, and anonymous prayer requests with offline resilience and follow-up workflows.',
    href: '/prayer-room',
    icon: HeartHandshake,
  },
  {
    title: 'Live Service OS',
    description: 'Conference, worship, choir, live chat, reflections, and sermon support for modern church services.',
    href: '/live-service',
    icon: Mic2,
  },
  {
    title: 'Transparent Giving',
    description: 'Purpose-based offerings, aid allocation, audit trails, and member-facing transparency reporting.',
    href: '/offering',
    icon: WalletCards,
  },
];

const trustMetrics = [
  'Role-protected admin routes',
  'Auditable AI and aid actions',
  'Mobile-first sanctuary PWA',
  'Multi-community ready schema',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(120,155,100,0.20),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(210,180,140,0.22),_transparent_34%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm text-sage-700 shadow-sm">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Production-grade digital ministry platform
            </div>
            <h1 className="max-w-4xl text-5xl font-light leading-tight tracking-tight text-stone-800 md:text-7xl">
              A living digital sanctuary for worship, care, discipleship, service, and church connection.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
              Digital Church OS brings pastoral care, prayer rooms, live services, Scripture, worship, transparent aid, giving, and community engagement into one trusted ministry experience.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-sage-600 px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-sage-200 transition hover:bg-sage-700">
                Enter Sanctuary <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/live-service" className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white/80 px-7 py-4 text-sm font-semibold text-stone-700 transition hover:border-sage-300 hover:text-sage-700">
                Join Live Worship
              </Link>
            </div>
          </div>

          <div className="sanctuary-card relative p-8 shadow-2xl">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sage-200/40 blur-2xl" />
            <div className="relative">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-sage-600">Sanctuary Command</p>
                  <h2 className="mt-2 text-2xl text-stone-800">Professional ministry workflow</h2>
                </div>
                <div className="rounded-2xl bg-sage-100 p-3 text-sage-700">✝</div>
              </div>
              <div className="space-y-4">
                {trustMetrics.map((item) => (
                  <div key={item} className="flex items-center rounded-2xl border border-cream-200 bg-white/70 p-4 text-sm text-stone-700">
                    <span className="mr-3 h-2.5 w-2.5 rounded-full bg-sage-500" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-3xl bg-stone-900 p-6 text-white">
                <p className="text-sm uppercase tracking-[0.25em] text-sage-200">Right now</p>
                <h3 className="mt-2 text-2xl font-light">Worship, teaching, care, and action can move together in one flow.</h3>
                <Link href="/church-network" className="mt-5 inline-flex items-center text-sm font-semibold text-sage-200 hover:text-white">
                  Explore church connections <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GospelAccessPathways />

      <section className="border-y border-cream-200 bg-white/60 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sage-600">Core ministry systems</p>
              <h2 className="mt-3 text-3xl font-light text-stone-800 md:text-4xl">Built around the real work of ministry.</h2>
            </div>
            <Link href="/aid-request" className="inline-flex items-center text-sm font-semibold text-sage-700 hover:text-sage-900">
              Request assistance <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Link key={pillar.title} href={pillar.href} className="sanctuary-card group block h-full p-6 hover:-translate-y-1">
                  <div className="mb-5 inline-flex rounded-2xl bg-sage-100 p-3 text-sage-700 transition group-hover:bg-sage-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-medium text-stone-800">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{pillar.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          <div className="rounded-[2rem] bg-stone-900 p-8 text-white shadow-2xl md:p-12 lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sage-200">Serves all professionally</p>
            <h2 className="mt-4 text-4xl font-light leading-tight md:text-5xl">One platform for pastors, admins, members, families, volunteers, and guests.</h2>
            <p className="mt-5 max-w-2xl text-stone-300">
              The system is structured for multiple communities, transparent operations, protected member journeys, AI-assisted workflows, and scalable ministry deployment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['Pastor dashboard', 'Member care', 'Children profiles', 'Offerings', 'Aid review', 'Live chat'].map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-4 py-2 text-sm text-stone-100">{tag}</span>
              ))}
            </div>
          </div>
          <div className="sanctuary-card flex flex-col justify-between p-8">
            <Users className="h-10 w-10 text-sage-600" />
            <div>
              <h3 className="mt-8 text-2xl font-light text-stone-800">Trust-first ministry posture</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Hardened routing, authenticated sensitive workflows, human escalation, and transparency-first design make the platform easier to deploy and trust.
              </p>
              <Link href="/auth/signin" className="mt-6 inline-flex items-center text-sm font-semibold text-sage-700 hover:text-sage-900">
                Sign in <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
