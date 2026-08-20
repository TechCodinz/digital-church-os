import Link from 'next/link';
import { ArrowRight, BookOpenText, HeartHandshake, Home, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { FamilyAltarPlanner } from '@/components/ministry/FamilyAltarPlanner';
import { JourneyContinuityComposer } from '@/components/journey/JourneyContinuityComposer';

const rhythms = [
  { title: 'Gather', description: 'Settle together without performance or pressure.', icon: Home },
  { title: 'Open the Word', description: 'Begin with Scripture before activity or application.', icon: BookOpenText },
  { title: 'Respond together', description: 'Pray, give thanks, reconcile, worship, or choose one act of love.', icon: HeartHandshake },
];

export default function FamilyAltarPage() {
  return (
    <main className="sanctuary-page-shell min-h-screen bg-[#06110f] pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl"><Home className="mr-2 h-4 w-4" /> Family altar</div>
              <h1 className="mt-6 text-4xl font-light leading-[1.04] text-white md:text-7xl">Turn an ordinary room into a gentle rhythm of Scripture, prayer, gratitude, and love.</h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">Build a household worship flow around the people actually present, the time you truly have, and the passage you choose—without scores, spiritual competition, or AI claims about God’s private message for your family.</p>
              <div className="mt-8 flex flex-wrap gap-3"><Link href="#family-planner" className="sacred-primary-button"><Sparkles className="h-4 w-4" /> Build tonight’s flow</Link><Link href="/scripture" className="sacred-secondary-button"><BookOpenText className="h-4 w-4" /> Choose Scripture first</Link></div>
            </div>

            <div className="sacred-panel-dark relative z-10 p-6">
              <p className="sanctuary-section-label text-emerald-200/60">Family-first boundary</p>
              <h2 className="mt-2 text-2xl font-light text-white">Technology can prepare the table. Trusted adults still lead the household.</h2>
              <div className="mt-5 space-y-3 text-xs leading-6 text-white/48"><p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Child participation stays parent or guardian guided.</p><p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Private conflict, safeguarding concerns, and counseling details stay out of shared formation memory.</p><p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Marking a prayer answered remains the family’s own reflection—not an AI determination.</p></div>
            </div>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-3">{rhythms.map((rhythm, index) => { const Icon = rhythm.icon; return <div key={rhythm.title} className="sacred-panel-dark p-5"><div className="flex items-center justify-between"><Icon className="h-5 w-5 text-amber-100" /><span className="text-[10px] font-bold tracking-[0.18em] text-white/25">0{index + 1}</span></div><h2 className="mt-4 text-lg font-semibold text-white">{rhythm.title}</h2><p className="mt-2 text-xs leading-6 text-white/45">{rhythm.description}</p></div>; })}</div>
        </div>
      </section>

      <div id="family-planner" className="bg-[#f7f5ef] text-stone-900">
        <FamilyAltarPlanner />
        <section className="px-4 pb-8 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3"><Link href="/children" className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><UsersRound className="h-5 w-5 text-emerald-600" /><h3 className="mt-4 font-semibold text-stone-800">Children’s Sanctuary</h3><p className="mt-2 text-xs leading-6 text-stone-500">Continue in guardian-controlled, age-aware Bible learning.</p><span className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700">Open children’s space <ArrowRight className="ml-2 h-3.5 w-3.5" /></span></Link><Link href="/prayer-room" className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><HeartHandshake className="h-5 w-5 text-rose-500" /><h3 className="mt-4 font-semibold text-stone-800">Family prayer</h3><p className="mt-2 text-xs leading-6 text-stone-500">Carry a household theme into prayer without exposing it publicly.</p><span className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700">Enter Prayer Room <ArrowRight className="ml-2 h-3.5 w-3.5" /></span></Link><Link href="/daily-guide" className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><Sparkles className="h-5 w-5 text-amber-600" /><h3 className="mt-4 font-semibold text-stone-800">Continue tomorrow</h3><p className="mt-2 text-xs leading-6 text-stone-500">Carry the theme into a personal morning, midday, or evening rhythm.</p><span className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-700">Open Daily Guide <ArrowRight className="ml-2 h-3.5 w-3.5" /></span></Link></div></section>
        <div className="px-4 pb-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><JourneyContinuityComposer source="Family Altar" title="Carry one family worship moment forward" prompt="Save only the household insight you intentionally want to remember: a Scripture reference, gratitude, shared prayer theme, act of service, or one next step for the family." nextHref="/daily-guide" nextLabel="Continue in Daily Guide" privacyNote="Do not place child activity records, private family conflict, safeguarding concerns, counseling details, or sensitive pastoral information in this formation timeline. Those belong in appropriate guardian-led or human-care workflows." /></div></div>
      </div>
    </main>
  );
}
