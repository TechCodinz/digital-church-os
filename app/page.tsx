import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  Heart,
  HeartHandshake,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';
import { GospelAccessPathways } from '@/components/ministry/GospelAccessPathways';

const intents = [
  {
    eyebrow: 'I need prayer',
    title: 'Enter the Prayer Room',
    description: 'Private, public, or anonymous prayer with follow-up pathways and accountable care boundaries.',
    href: '/prayer-room',
    icon: Heart,
  },
  {
    eyebrow: 'I need the Word',
    title: 'Open Scripture',
    description: 'Read, study, take notes, and move into deeper Scripture immersion without turning commentary into revelation.',
    href: '/scripture',
    icon: BookOpen,
  },
  {
    eyebrow: 'I want to worship',
    title: 'Enter Live Service',
    description: 'Join a configured church broadcast and move naturally into Scripture, notes, prayer, and service response.',
    href: '/live-service',
    icon: Radio,
  },
  {
    eyebrow: 'I need care',
    title: 'Pastoral Care',
    description: 'Use bounded guidance when useful and move into church-scoped human care when the situation deserves people.',
    href: '/care',
    icon: HeartHandshake,
  },
  {
    eyebrow: 'I need community',
    title: 'Church Network',
    description: 'Discover public churches and enter the right tenant workspace only through validated membership and visibility rules.',
    href: '/church-network',
    icon: Building2,
  },
  {
    eyebrow: 'I want continuity',
    title: 'Continue My Journey',
    description: 'Carry prayer, Scripture, service response, reflection, and formation forward without a holiness leaderboard.',
    href: '/journey',
    icon: Compass,
  },
];

const tenantPromises = [
  ['Church-scoped authority', 'Operational actions remain inside the active church workspace instead of relying on a global admin identity.'],
  ['Truthful public state', 'Live service, conferences, church discovery, and giving surfaces are only as “live” or “verified” as their real data supports.'],
  ['AI with boundaries', 'Intelligence assists Scripture, prayer, preparation, and routing without claiming divine, pastoral, or clinical authority.'],
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f8f3eb]">
      <section className="sanctuary-cinematic-hero relative flex min-h-[92vh] items-center pb-20 pt-28 text-white">
        <div className="sanctuary-light-column" aria-hidden="true" />
        <div className="sanctuary-nave" aria-hidden="true" />
        <div className="sanctuary-vignette" aria-hidden="true" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.16fr_0.84fr] lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-black/20 px-4 py-2 text-[11px] uppercase tracking-[0.23em] text-amber-100/90 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Living Sanctuary · Tenant-Safe Phase 11
            </div>
            <p className="mt-8 text-sm font-medium text-amber-200/85 md:text-base">Enter as you are. Choose the need before the feature.</p>
            <h1 className="mt-4 text-5xl font-light leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-8xl">
              A digital church experience with cinematic presence and <span className="font-normal text-amber-200">real ministry architecture underneath.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-base font-light leading-relaxed text-slate-200/90 sm:text-lg lg:text-xl">
              Prayer, Scripture, worship, pastoral care, community, giving, discipleship, and church operations woven into one reverent journey — while church authority remains tenant-scoped and accountable.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/dashboard" className="sacred-primary-button group">Enter My Sanctuary <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              <Link href="/prayer-room" className="sacred-secondary-button"><Heart className="h-4 w-4" /> I need prayer</Link>
            </div>

            <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
              {tenantPromises.map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
                  <ShieldCheck className="mb-3 h-4 w-4 text-emerald-300" />
                  <p className="text-xs font-semibold text-white">{title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="presence-orbit" aria-hidden="true" />
            <div className="sacred-panel-dark relative overflow-hidden p-6 sm:p-7">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-amber-300/80">Presence Compass</p>
                  <h2 className="mt-2 text-2xl font-light text-white">What do you need right now?</h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">The same sanctuary entry now routes into Phase 11’s real member and church systems.</p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10">
                  <Compass className="h-5 w-5 text-amber-300" />
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                {intents.slice(0, 4).map((intent) => {
                  const Icon = intent.icon;
                  return (
                    <Link key={intent.href} href={intent.href} className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4 transition-all hover:border-amber-300/20 hover:bg-white/[0.08]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-amber-200 transition-transform group-hover:scale-105"><Icon className="h-4 w-4" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{intent.eyebrow}</p>
                        <p className="mt-1 text-sm font-medium text-slate-100">{intent.title}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-600 transition-all group-hover:translate-x-1 group-hover:text-amber-300" />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/8 pt-5">
                <p className="text-[11px] text-slate-500">The Phase 11 Sanctuary Guide remains available globally.</p>
                <Sparkles className="h-4 w-4 text-amber-300/70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#f8f3eb] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="sanctuary-section-label text-sage-700">Start with the person, not the module</p>
            <h2 className="mt-4 text-4xl font-light tracking-tight text-stone-900 sm:text-5xl">One front door. Tenant-safe journeys underneath.</h2>
            <p className="mt-5 text-base leading-relaxed text-stone-600">The cinematic layer does not replace Phase 11’s church workspace model. It makes that architecture feel coherent to members instead of exposing the underlying system map.</p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {intents.map((intent) => {
              const Icon = intent.icon;
              return (
                <Link key={intent.href} href={intent.href} className="group block h-full rounded-3xl border border-stone-200/80 bg-white/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sage-300 hover:shadow-2xl hover:shadow-stone-300/20">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sage-100 bg-sage-50 text-sage-700"><Icon className="h-5 w-5" /></div>
                  <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-stone-400">{intent.eyebrow}</p>
                  <h3 className="mt-2 text-xl font-medium text-stone-900">{intent.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{intent.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-sage-700">Enter experience <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <GospelAccessPathways />

      <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
        <div className="absolute inset-0 sanctuary-radiance" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="sanctuary-section-label text-amber-300">Church life underneath the experience</p>
            <h2 className="mt-4 text-4xl font-light tracking-tight sm:text-5xl">Beautiful for a member. Serious enough for ministry operations.</h2>
            <p className="mt-5 leading-relaxed text-slate-400">Members should feel a sanctuary. Leaders still need workspaces, roles, service plans, care coordination, attendance, communications, conferences, and operational truth.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [Building2, 'Church Workspace', 'Tenant-scoped church identity, membership, and operational authority.', '/church-life'],
              [Users, 'Command Center', 'Leadership workflows, departments, requests, service planning, and ministry attention.', '/command-center'],
              [WalletCards, 'Giving & Transparency', 'Purpose-based giving and recorded financial transparency without spiritual scoring.', '/offering'],
              [HeartHandshake, 'Care Coordination', 'Human follow-up pathways with restricted-case boundaries and accountable access.', '/care'],
            ].map(([IconValue, title, copy, href]) => {
              const Icon = IconValue as typeof Building2;
              return (
                <Link key={String(href)} href={String(href)} className="sacred-panel-dark group block p-6">
                  <Icon className="h-5 w-5 text-emerald-300" />
                  <h3 className="mt-5 text-lg font-medium text-white">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{String(copy)}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-amber-300">Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
