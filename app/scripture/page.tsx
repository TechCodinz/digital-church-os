import { ScriptureStudyWorkspace } from '@/components/scripture/ScriptureStudyWorkspace';
import { BookOpenText, Languages, ShieldCheck, Sparkles } from 'lucide-react';

export default function ScripturePage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-16 pt-24">
      <section className="px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
                <BookOpenText className="mr-2 h-4 w-4" /> Bible translation & Scripture intelligence
              </div>
              <h1 className="max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-900 md:text-6xl">
                Read with context, compare responsibly, remember what you learn, and carry Scripture into daily life.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg">
                Search and translation providers can supply Bible text where licensed. Digital Church OS focuses the experience around references, study context, private notes, voice reflections, teaching preparation, and faithful next actions.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { icon: Languages, title: 'Translation aware', body: 'Modern copyrighted versions stay provider-controlled.' },
                { icon: Sparkles, title: 'Study before AI', body: 'Observation and context come before generated insight.' },
                { icon: ShieldCheck, title: 'Private reflection', body: 'Notes stay local unless you intentionally share them.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                    <Icon className="h-5 w-5 text-sage-600" />
                    <p className="mt-3 font-semibold text-stone-900">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScriptureStudyWorkspace />
        </div>
      </section>
    </main>
  );
}
