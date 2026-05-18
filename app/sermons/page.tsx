import { SermonGeneratorConsole } from '@/components/sermon/SermonGeneratorConsole';
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
            <h1 className="text-4xl font-light leading-tight text-stone-800 md:text-6xl">Prepare sermons with scripture structure, practical application, and safety guardrails.</h1>
            <p className="mt-6 text-lg leading-8 text-stone-600">The sermon engine helps leaders create a first draft, not a final authority. It supports expository, topical, and narrative styles with safe fallback mode when external AI services are not configured.</p>
          </div>
          <SermonGeneratorConsole />
        </div>
      </section>

      <section className="border-y border-cream-200 bg-white/60 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            ['Theological humility', 'The engine avoids prophecy claims, guaranteed outcomes, and divine-revelation language.'],
            ['Structured preparation', 'Every sermon can include introduction, main points, scripture references, applications, and discussion questions.'],
            ['Operational memory', 'When database services are available, interactions are logged for audit and improvement.'],
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
