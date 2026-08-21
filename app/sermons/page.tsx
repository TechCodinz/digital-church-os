import Link from 'next/link';
import { SermonGeneratorConsole } from '@/components/sermon/SermonGeneratorConsole';
import { SermonPackConsole } from '@/components/sermon/SermonPackConsole';
import { LiveSermonCommandCenter } from '@/components/sermon/LiveSermonCommandCenter';
import { LiveSermonCompanion } from '@/components/sermon/LiveSermonCompanion';
import { SermonIntelligenceWorkbench } from '@/components/sermon/SermonIntelligenceWorkbench';
import { JourneyContinuityComposer } from '@/components/journey/JourneyContinuityComposer';
import {
  ArrowRight,
  BookOpenText,
  HeartHandshake,
  Mic2,
  Radio,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const sermonFlow = [
  {
    title: 'Prepare in the Word',
    description: 'Build from Scripture, context, thesis, structure, and accountable interpretation before generation assists the draft.',
    icon: BookOpenText,
  },
  {
    title: 'Preach with presence',
    description: 'Keep live cues, presentation, response, and service awareness available without letting the interface compete with the message.',
    icon: Mic2,
  },
  {
    title: 'Carry it into life',
    description: 'Turn one reviewed message into private reflection, prayer, discipleship, children and youth material, outreach, and follow-through.',
    icon: HeartHandshake,
  },
];

export default function SermonsPage() {
  return (
    <main className="sanctuary-page-shell min-h-screen bg-[#06110f] pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div className="relative z-10 max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl">
                <BookOpenText className="mr-2 h-4 w-4" /> Sermon & teaching sanctuary
              </div>
              <h1 className="mt-6 text-4xl font-light leading-[1.03] text-white md:text-7xl">
                Prepare deeply. Preach clearly. Let one biblical message keep serving people after the service ends.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">
                Scripture, sermon preparation, live ministry cues, listener reflection, follow-up, and reviewed ministry packs now live in one continuous workflow—without presenting AI as spiritual authority or replacing the preacher, the biblical text, or accountable church leadership.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#sermon-workbench" className="sacred-primary-button"><Sparkles className="h-4 w-4" /> Enter sermon workbench</Link>
                <Link href="/scripture" className="sacred-secondary-button"><BookOpenText className="h-4 w-4" /> Begin with Scripture</Link>
                <Link href="/live-service" className="sacred-secondary-button"><Radio className="h-4 w-4" /> Open live service</Link>
              </div>
            </div>

            <div className="sacred-panel-dark relative z-10 p-6 sm:p-7">
              <p className="sanctuary-section-label text-emerald-200/60">Authority stays human</p>
              <h2 className="mt-2 text-2xl font-light text-white">The system can organize the room. It does not become the voice of God in it.</h2>
              <div className="mt-5 space-y-3 text-xs leading-6 text-white/48">
                <p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Scripture and accountable interpretation remain primary.</p>
                <p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Generated outlines, illustrations, packs, and applications require human theological review.</p>
                <p className="flex gap-3"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /> Listener notes and private Journey reflections are not turned into public spiritual rankings.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-3">
            {sermonFlow.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="sacred-panel-dark p-5">
                  <div className="flex items-center justify-between"><Icon className="h-5 w-5 text-amber-100" /><span className="text-[10px] font-bold tracking-[0.18em] text-white/25">0{index + 1}</span></div>
                  <h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-xs leading-6 text-white/45">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="sermon-workbench" className="relative bg-[#06110f] px-4 py-12 sm:px-6 lg:px-8">
        <div className="sanctuary-radiance absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="sanctuary-section-label text-amber-100/55">Message-to-ministry workbench</p>
              <h2 className="mt-2 max-w-3xl text-3xl font-light text-white sm:text-4xl">From exegesis to delivery to response—without breaking the ministry flow.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/42">Each console keeps its existing data and safety boundaries. V6 changes the surrounding experience so the tools feel like one coherent sanctuary rather than unrelated admin cards.</p>
          </div>

          <div className="space-y-10">
            <LiveSermonCommandCenter />
            <SermonIntelligenceWorkbench />
            <LiveSermonCompanion />
            <JourneyContinuityComposer
              source="Sermon"
              title="Carry the message into the week"
              prompt="Choose one biblical insight, question, prayer, conviction, or practical response you want to remember after listening or preparing. This is separate from the full sermon draft and timed note archive."
              nextHref="/service-response"
              nextLabel="Choose a Service Response"
              privacyNote="Full sermon drafts, generated packs, live cues, and other people’s ministry data are not copied automatically. Only the reflection and next step you intentionally enter here become a private Journey moment."
            />
            <SermonGeneratorConsole />
            <SermonPackConsole />
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/8 bg-[#030b09] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="sanctuary-section-label text-emerald-200/55">What makes this different</p>
            <h2 className="mt-2 text-3xl font-light text-white sm:text-4xl">A sermon should not disappear when the microphone goes quiet.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Scripture before generation', 'References, context, and accountable interpretation stay primary; AI assists drafting rather than becoming spiritual authority.'],
              ['Sermon-to-everything', 'One reviewed teaching theme can become Bible study, children/youth material, worship direction, prayer points, outreach content, slides, and follow-up devotionals.'],
              ['Message-to-life continuity', 'Timed notes, private reflection, response pathways, and journey tools help people carry a sermon beyond the service instead of losing it after Sunday.'],
            ].map(([title, description]) => (
              <div key={title} className="sacred-panel-dark p-6">
                <ShieldCheck className="mb-4 h-6 w-6 text-emerald-200" />
                <h3 className="text-xl font-medium text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/45">{description}</p>
                <span className="mt-5 inline-flex items-center text-xs font-semibold text-amber-100/70">Ministry continuity <ArrowRight className="ml-2 h-3.5 w-3.5" /></span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
