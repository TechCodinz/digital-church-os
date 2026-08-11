import Link from 'next/link';
import { ChoirStudioCommandCenter } from '@/components/worship/ChoirStudioCommandCenter';
import { WorshipCompositionWorkbench } from '@/components/worship/WorshipCompositionWorkbench';
import { OriginalHymnStudio } from '@/components/worship/OriginalHymnStudio';
import { JourneyContinuityComposer } from '@/components/journey/JourneyContinuityComposer';
import { BookOpenText, Copyright, Music2, Radio, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';

export default function ChoirPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-20 pt-10">
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-purple-700 shadow-sm">
                <Music2 className="mr-2 h-4 w-4" /> Choir, hymn & worship creation studio
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-900 md:text-6xl">Create original hymns, gospel songs, praise, worship, psalm settings, choir anthems, and rehearsal-ready arrangements.</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg">Digital Church OS now brings Scripture foundation, lyric drafting, arrangement planning, SATB and other voice parts, metronome, reference pitch, browser recording, rehearsal takes, rights posture, service slides, and worship-media handoff into one connected ministry workflow.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: BookOpenText, title: 'Scripture first', body: 'Songs begin from biblical references and a ministry purpose rather than generic generation.' },
                { icon: UsersRound, title: 'Choir ready', body: 'Plan voice parts, sections, key, tempo, meter, rehearsal notes, and real browser-recorded takes.' },
                { icon: Copyright, title: 'Rights aware', body: 'Original, public-domain, licensed, and review-required postures stay explicit before distribution.' },
                { icon: ShieldCheck, title: 'Technology honest', body: 'No fake claims of pitch correction, mastering, stem separation, or engraving without a real provider.' },
              ].map((item) => {
                const Icon = item.icon;
                return <div key={item.title} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><Icon className="h-5 w-5 text-purple-600" /><p className="mt-3 font-semibold text-stone-900">{item.title}</p><p className="mt-1 text-xs leading-5 text-stone-500">{item.body}</p></div>;
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <ChoirStudioCommandCenter />
          <WorshipCompositionWorkbench />
          <OriginalHymnStudio />
          <JourneyContinuityComposer
            source="Choir"
            title="Carry this worship-creation session forward"
            prompt="Save the Scripture foundation, ministry lesson, rehearsal insight, or next musical step you intentionally want to remember after this creation session."
            nextHref="/service-planner"
            nextLabel="Continue to Service Planner"
            privacyNote="Lyrics, recordings, stems, and full compositions are not copied into Journey automatically. Save only the reflection or next step you intentionally enter here; rights-sensitive creative material stays in its proper workflow."
          />
        </div>
      </section>

      <section className="mt-12 border-y border-stone-200 bg-white/70 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center text-xs font-bold uppercase tracking-[0.18em] text-sage-700"><Sparkles className="mr-2 h-4 w-4" /> From rehearsal to the worship service</div>
              <h2 className="mt-3 text-3xl font-light text-stone-900">Keep the song connected to Scripture, media rights, service presentation, and the live worship flow.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">A completed worship project should move through theological review, musical rehearsal, rights clearance, lyric/slides preparation, media approval, and service planning before public distribution.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
              <Link href="/worship-media" className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white"><Radio className="mr-2 h-4 w-4" /> Worship media</Link>
              <Link href="/presentation" className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700">Service slides →</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
