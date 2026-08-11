import { WorshipAtmosphereDirector } from '@/components/worship/WorshipAtmosphereDirector';
import { WorshipMediaLibrary } from '@/components/worship/WorshipMediaLibrary';
import { Copyright, Music2, Radio, ShieldCheck } from 'lucide-react';

export default function WorshipMediaPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-16 pt-24">
      <section className="px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-purple-700 shadow-sm">
                <Music2 className="mr-2 h-4 w-4" /> Worship, praise & atmosphere media
              </div>
              <h1 className="max-w-4xl text-4xl font-light leading-tight text-stone-900 md:text-6xl">Plan worship as a living service flow—with music, prayer, Scripture, response, rights, and follow-up working together.</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg">Use approved music and media to serve gatherings, devotions, prayer rooms, broadcasts, children/youth ministry, and conferences. Public playback and distribution remain rights-aware and review-gated.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { icon: Radio, title: 'Service flow', body: 'Gather → praise → worship → Word → response → sending.' },
                { icon: Copyright, title: 'Rights first', body: 'Original, public-domain, licensed, or provider-cleared posture stays visible.' },
                { icon: ShieldCheck, title: 'Human-led', body: 'Worship and response choices remain with accountable ministry leaders.' },
              ].map((item) => { const Icon = item.icon; return <div key={item.title} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><Icon className="h-5 w-5 text-purple-600" /><p className="mt-3 font-semibold text-stone-900">{item.title}</p><p className="mt-1 text-xs leading-5 text-stone-500">{item.body}</p></div>; })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <WorshipAtmosphereDirector />
        </div>
      </section>

      <div className="mt-10">
        <WorshipMediaLibrary />
      </div>

      <section className="mt-10 border-y border-stone-200 bg-white/70 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-stone-200 bg-white p-6"><Music2 className="h-6 w-6 text-purple-600" /><h2 className="mt-4 text-xl font-semibold text-stone-900">Media library & playlists</h2><p className="mt-2 text-sm leading-6 text-stone-600">Approved audio, video, choir clips, instrumentals, and atmosphere media can be organized into ministry-specific sequences.</p></div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6"><Radio className="h-6 w-6 text-purple-600" /><h2 className="mt-4 text-xl font-semibold text-stone-900">Broadcast & devotional use</h2><p className="mt-2 text-sm leading-6 text-stone-600">Prepare worship sequences for live broadcasts, personal devotion, prayer gatherings, conferences, and services with clear transitions.</p></div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6"><Copyright className="h-6 w-6 text-purple-600" /><h2 className="mt-4 text-xl font-semibold text-stone-900">Licensed distribution</h2><p className="mt-2 text-sm leading-6 text-stone-600">Public catalog visibility stays gated by media terms, provider configuration, rights declarations, review, and takedown controls.</p></div>
        </div>
      </section>
    </main>
  );
}
