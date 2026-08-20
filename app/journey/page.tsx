import Link from 'next/link';
import {
  ArrowRight,
  BookOpenText,
  Footprints,
  HeartHandshake,
  LockKeyhole,
  Radio,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { JourneyContinuityPanel } from '@/components/journey/JourneyContinuityPanel';
import { QuickContinuityCapture } from '@/components/journey/QuickContinuityCapture';
import { WeeklyFormationSynthesis } from '@/components/journey/WeeklyFormationSynthesis';
import { SpiritualJourneyPanel } from '@/components/journey/SpiritualJourneyPanel';
import { JourneyMemoryControls } from '@/components/journey/JourneyMemoryControls';

const continuityDoors = [
  { title: 'Return to Scripture', description: 'Open the Word, then save only what you intentionally want to carry forward.', href: '/scripture', icon: BookOpenText },
  { title: 'Return to prayer', description: 'Bring a need into prayer without turning prayer activity into a maturity score.', href: '/prayer-room', icon: HeartHandshake },
  { title: 'Return to worship', description: 'Enter the worship sanctuary and respond through Scripture, prayer, or service response.', href: '/live-service', icon: Radio },
];

export default function JourneyPage() {
  return (
    <div className="sanctuary-page-shell min-h-screen bg-[#06110f] pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl">
                <Footprints className="mr-2 h-4 w-4" /> Private formation journey
              </div>
              <h1 className="mt-6 text-4xl font-light leading-[1.04] text-white md:text-7xl">Remember what mattered. Notice patterns. Choose the next faithful practice.</h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">Journey connects only the ministry moments you intentionally save across Scripture, prayer, worship, sermons, family formation, and daily reflection. It is continuity—not a spiritual leaderboard.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/journey/library" className="sacred-primary-button"><BookOpenText className="h-4 w-4" /> Search saved references</Link>
                <Link href="/daily-guide" className="sacred-secondary-button"><Sparkles className="h-4 w-4" /> Open today’s guide</Link>
              </div>
            </div>

            <div className="sacred-panel-dark relative z-10 p-6 sm:p-7">
              <p className="sanctuary-section-label text-emerald-200/60">Memory boundary</p>
              <h2 className="mt-2 text-2xl font-light text-white">Your journey is not your holiness score.</h2>
              <div className="mt-5 space-y-3 text-xs leading-6 text-white/48">
                <p className="flex gap-3"><LockKeyhole className="mt-1 h-4 w-4 shrink-0 text-amber-100" /> Sensitive care, financial details, and child data should not be pulled into formation summaries just because they exist elsewhere.</p>
                <p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Saved continuity can help you remember and reflect; it does not measure divine favor, spiritual rank, or closeness to God.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-3">
            {continuityDoors.map((door) => {
              const Icon = door.icon;
              return (
                <Link key={door.href} href={door.href} className="sacred-panel-dark group p-5 transition hover:-translate-y-1">
                  <Icon className="h-5 w-5 text-amber-100" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{door.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-white/45">{door.description}</p>
                  <ArrowRight className="mt-4 h-4 w-4 text-emerald-200 transition group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5ef] px-4 py-14 text-stone-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="sanctuary-section-label text-emerald-700">Carry the thread forward</p>
            <h2 className="mt-3 text-4xl font-light leading-tight text-stone-800">Capture → remember → reflect → practice</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">The intelligence should feel quiet: it helps organize what you chose to save, then returns agency to you.</p>
          </div>

          <div className="space-y-8">
            <QuickContinuityCapture />
            <JourneyContinuityPanel />
            <WeeklyFormationSynthesis />
            <SpiritualJourneyPanel />
            <JourneyMemoryControls />
          </div>
        </div>
      </section>
    </div>
  );
}
