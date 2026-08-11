import { SermonGeneratorConsole } from '@/components/sermon/SermonGeneratorConsole';
import { SermonPackConsole } from '@/components/sermon/SermonPackConsole';
import { LiveSermonCommandCenter } from '@/components/sermon/LiveSermonCommandCenter';
import { LiveSermonCompanion } from '@/components/sermon/LiveSermonCompanion';
import { SermonIntelligenceWorkbench } from '@/components/sermon/SermonIntelligenceWorkbench';
import { BookOpenText, ShieldCheck } from 'lucide-react';

export default function SermonsPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <BookOpenText className="mr-2 h-4 w-4" /> Sermon and teaching studio
            </div>
            <h1 className="text-4xl font-light leading-tight text-stone-800 md:text-6xl">Prepare, preach, listen deeply, present clearly, and turn one biblical message into an entire ministry follow-through.</h1>
            <p className="mt-6 text-lg leading-8 text-stone-600">Leaders can organize Scripture, thesis, live cues and response; listeners can privately capture timed insights, verses, questions, prayer and one faithful action; then the sermon engines can build reviewed ministry packs across children, youth, worship, outreach and discipleship.</p>
          </div>

          <div className="space-y-10">
            <LiveSermonCommandCenter />
            <SermonIntelligenceWorkbench />
            <LiveSermonCompanion />
            <SermonGeneratorConsole />
            <SermonPackConsole />
          </div>
        </div>
      </section>

      <section className="border-y border-cream-200 bg-white/60 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            ['Scripture before generation', 'References, context, and accountable interpretation stay primary; AI assists drafting rather than becoming spiritual authority.'],
            ['Sermon-to-everything', 'One reviewed teaching theme can become Bible study, children/youth material, worship direction, prayer points, outreach content, slides, and follow-up devotionals.'],
            ['Message-to-life continuity', 'Timed notes, private reflection, response pathways, and journey tools help people carry a sermon beyond the service instead of losing it after Sunday.'],
          ].map(([title, description]) => (
            <div key={title} className="sanctuary-card p-6">
              <ShieldCheck className="mb-4 h-6 w-6 text-sage-600" />
              <h3 className="text-xl font-medium text-stone-800">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
