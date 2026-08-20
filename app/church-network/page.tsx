import Link from 'next/link';
import {
  ArrowRight,
  Church,
  Globe2,
  Handshake,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ChurchNetworkIntelligence } from '@/components/ministry/ChurchNetworkIntelligence';

const networkPaths = [
  {
    title: 'Discover',
    description: 'Find public church profiles by place, tradition, language, and ministry focus without inventing trust or affiliation.',
    icon: Globe2,
  },
  {
    title: 'Discern collaboration',
    description: 'Prepare purpose, dates, safeguarding considerations, responsible contacts, and shared expectations before inviting anyone.',
    icon: Sparkles,
  },
  {
    title: 'Connect accountably',
    description: 'Real partnership remains opt-in and must pass through the church-owned relationship workflow.',
    icon: Handshake,
  },
];

export default function ChurchNetworkPage() {
  return (
    <main className="sanctuary-page-shell min-h-screen bg-[#06110f] pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-emerald-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-100 backdrop-blur-xl">
                <Church className="mr-2 h-4 w-4" /> Verified church network
              </div>
              <h1 className="mt-6 text-4xl font-light leading-[1.04] text-white md:text-7xl">Let churches find one another without surrendering local governance.</h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">Discovery, prayer mobilization, conferences, outreach, resource exchange, and partnership can become one intelligent network—while each congregation keeps authority over its people, records, invitations, and public identity.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#network-directory" className="sacred-primary-button"><Globe2 className="h-4 w-4" /> Explore real churches</Link>
                <Link href="/conferences" className="sacred-secondary-button"><Handshake className="h-4 w-4" /> Explore joint gatherings</Link>
              </div>
            </div>

            <div className="sacred-panel-dark relative z-10 p-6 sm:p-7">
              <p className="sanctuary-section-label text-amber-100/60">Trust architecture</p>
              <h2 className="mt-2 text-2xl font-light text-white">A network is not permission to mix church data.</h2>
              <div className="mt-5 space-y-3 text-xs leading-6 text-white/48">
                <p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Verification badges reflect stored status only. AI cannot confer verification.</p>
                <p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Private member, pastoral, child, safeguarding, and finance records remain outside public discovery.</p>
                <p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Cross-church relationships remain explicit and church-approved rather than inferred from proximity or shared doctrine.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-3">
            {networkPaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <div key={path.title} className="sacred-panel-dark p-5">
                  <div className="flex items-center justify-between"><Icon className="h-5 w-5 text-amber-100" /><span className="text-[10px] font-bold tracking-[0.18em] text-white/25">0{index + 1}</span></div>
                  <h2 className="mt-4 text-lg font-semibold text-white">{path.title}</h2>
                  <p className="mt-2 text-xs leading-6 text-white/45">{path.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div id="network-directory" className="bg-[#f7f5ef] text-stone-900">
        <ChurchNetworkIntelligence />

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            <Link href="/church-life" className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200">
              <Church className="h-5 w-5 text-emerald-600" />
              <h3 className="mt-4 font-semibold text-stone-800">Your church workspace</h3>
              <p className="mt-2 text-xs leading-6 text-stone-500">Open tenant-scoped operations when your membership role grants access.</p>
              <span className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700">Open workspace <ArrowRight className="ml-2 h-3.5 w-3.5" /></span>
            </Link>
            <Link href="/conferences" className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200">
              <Handshake className="h-5 w-5 text-emerald-600" />
              <h3 className="mt-4 font-semibold text-stone-800">Church-owned gatherings</h3>
              <p className="mt-2 text-xs leading-6 text-stone-500">Move from discovery into an explicitly selected church calendar.</p>
              <span className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700">Explore gatherings <ArrowRight className="ml-2 h-3.5 w-3.5" /></span>
            </Link>
            <Link href="/prayer-room" className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <h3 className="mt-4 font-semibold text-stone-800">Prayer before partnership</h3>
              <p className="mt-2 text-xs leading-6 text-stone-500">Keep prayer available without presenting AI or network matching as divine direction.</p>
              <span className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700">Enter Prayer Room <ArrowRight className="ml-2 h-3.5 w-3.5" /></span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
