import { ScriptureStudyWorkspace } from '@/components/scripture/ScriptureStudyWorkspace';
import { ScriptureInsightLab } from '@/components/scripture/ScriptureInsightLab';
import { JourneyContinuityComposer } from '@/components/journey/JourneyContinuityComposer';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpenText,
  HeartHandshake,
  Languages,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const wordDoors = [
  {
    icon: Languages,
    title: 'Translation aware',
    body: 'Licensed text stays provider-controlled while references, context and your own notes remain clear.',
  },
  {
    icon: Sparkles,
    title: 'Study before synthesis',
    body: 'Observation, context and the passage itself come before generated insight or application.',
  },
  {
    icon: ShieldCheck,
    title: 'Private reflection',
    body: 'Your notes are not turned into a spiritual score or shared unless you intentionally choose to share them.',
  },
];

export default function ScripturePage() {
  return (
    <div className="sanctuary-page-shell min-h-screen bg-[#06110f] pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" aria-hidden="true" />
        <div className="sanctuary-nave" aria-hidden="true" />
        <div className="sanctuary-vignette" aria-hidden="true" />

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.76fr] lg:items-end">
            <div className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl">
                <BookOpenText className="mr-2 h-4 w-4" /> Scripture sanctuary
              </div>
              <h1 className="mt-6 text-4xl font-light leading-[1.03] text-white md:text-7xl">
                Open the Word slowly. See the context. Carry only what you truly learned forward.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">
                Search, compare, listen and reflect without letting AI become the authority over Scripture. Digital Church OS keeps the Bible text, study context, generated commentary and your private response visibly separate.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#study-workspace" className="sacred-primary-button">
                  <BookOpenText className="h-4 w-4" /> Enter study workspace
                </Link>
                <Link href="/prayer-room" className="sacred-secondary-button">
                  <HeartHandshake className="h-4 w-4" /> Carry a passage into prayer
                </Link>
              </div>
            </div>

            <div className="sacred-panel-dark relative z-10 p-6 sm:p-7">
              <p className="sanctuary-section-label text-emerald-200/60">Reading covenant</p>
              <h2 className="mt-2 text-2xl font-light text-white">The text remains primary.</h2>
              <div className="mt-5 space-y-3 text-xs leading-6 text-white/48">
                <p className="flex gap-3"><BookOpenText className="mt-1 h-4 w-4 shrink-0 text-amber-100" /> Generated study help should point you back to the passage rather than speak as though it were Scripture.</p>
                <p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Notes and formation memory remain under your control; reading frequency is never treated as holiness or divine favor.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-3">
            {wordDoors.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="sacred-panel-dark p-5">
                  <Icon className="h-5 w-5 text-amber-100" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-white/45">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="study-workspace" className="relative bg-[#f7f5ef] px-4 py-14 text-stone-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 border-b border-stone-200 pb-7 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="sanctuary-section-label text-emerald-700">Word workspace</p>
              <h2 className="mt-3 text-4xl font-light leading-tight text-stone-800">Read → observe → understand → respond</h2>
              <p className="mt-4 text-sm leading-7 text-stone-600">Use the tools below as study instruments. Any generated insight should remain reviewable, contextual and subordinate to the passage itself.</p>
            </div>
            <Link href="/journey" className="inline-flex items-center text-sm font-semibold text-emerald-700">
              Open formation journey <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-8">
            <ScriptureStudyWorkspace />
            <JourneyContinuityComposer
              source="Scripture"
              title="Carry one Scripture insight forward"
              prompt="After reading the passage itself, save only the insight, question, prayer, or application you intentionally want to remember. Passage text is not copied into Journey automatically."
              nextHref="/daily-guide"
              nextLabel="Carry into Daily Guide"
              privacyNote="Only your chosen reflection and next step are saved. Licensed Bible text, search results, and voice recordings are not copied into Journey automatically."
            />
            <ScriptureInsightLab />
          </div>
        </div>
      </section>
    </div>
  );
}
