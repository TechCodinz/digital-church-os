import Link from 'next/link';
import { WorshipAtmosphereDirector } from '@/components/worship/WorshipAtmosphereDirector';
import { WorshipMediaLibrary } from '@/components/worship/WorshipMediaLibrary';
import { WorshipServicePlanner } from '@/components/worship/WorshipServicePlanner';
import { ArrowRight, Copyright, Music2, Radio, ShieldCheck, Sparkles } from 'lucide-react';

export default function WorshipMediaPage() {
  return (
    <main className="sanctuary-page-shell min-h-screen bg-[#06110f] pb-16 pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-violet-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-violet-100 backdrop-blur-xl"><Music2 className="mr-2 h-4 w-4" /> Worship, praise & atmosphere</div>
            <h1 className="mt-6 text-4xl font-light leading-[1.03] text-white md:text-7xl">Shape the service flow so music, silence, Scripture, prayer, response, and sending breathe as one experience.</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">Prepare rights-aware worship media for gatherings, prayer rooms, broadcasts, conferences, children and youth ministry, and personal devotion—while accountable leaders remain responsible for theology, pastoral judgment, licensing, and the actual worship moment.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#worship-workbench" className="sacred-primary-button"><Sparkles className="h-4 w-4" /> Enter worship workbench</Link>
              <Link href="/live-service" className="sacred-secondary-button"><Radio className="h-4 w-4" /> Open live service</Link>
              <Link href="/choir-studio" className="sacred-secondary-button"><Music2 className="h-4 w-4" /> Choir studio</Link>
            </div>
          </div>

          <div className="relative z-10 grid gap-3">
            {[
              { icon: Radio, title: 'Service flow', body: 'Gather → praise → worship → Word → response → sending.' },
              { icon: Copyright, title: 'Rights first', body: 'Original, public-domain, licensed, or provider-cleared posture stays visible.' },
              { icon: ShieldCheck, title: 'Human-led', body: 'Worship and response choices remain with accountable ministry leaders.' },
            ].map((item, index) => { const Icon = item.icon; return <div key={item.title} className="sacred-panel-dark p-5"><div className="flex items-center justify-between"><Icon className="h-5 w-5 text-violet-100" /><span className="text-[10px] font-bold tracking-[0.18em] text-white/20">0{index + 1}</span></div><p className="mt-4 font-semibold text-white">{item.title}</p><p className="mt-2 text-xs leading-6 text-white/42">{item.body}</p></div>; })}
          </div>
        </div>
      </section>

      <section id="worship-workbench" className="relative px-4 py-12 sm:px-6 lg:px-8">
        <div className="sanctuary-radiance absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl"><p className="sanctuary-section-label text-violet-200/55">Atmosphere without manipulation</p><h2 className="mt-2 text-3xl font-light text-white sm:text-4xl">Prepare the room carefully, then let technology disappear under the ministry.</h2><p className="mt-3 text-sm leading-6 text-white/43">The director and planner remain practical preparation tools. They do not claim to manufacture spiritual presence, predict divine movement, or replace the worship team’s discernment.</p></div>
          <div className="space-y-10">
            <WorshipAtmosphereDirector />
            <WorshipServicePlanner />
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/8 bg-[#04100d] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-6"><div><p className="sanctuary-section-label text-amber-100/55">Approved media library</p><h2 className="mt-2 text-3xl font-light text-white">Build sequences from media the church can actually use.</h2></div><Copyright className="hidden h-7 w-7 text-amber-100/50 sm:block" /></div>
        </div>
        <WorshipMediaLibrary />
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Music2, title: 'Media library & playlists', body: 'Approved audio, video, choir clips, instrumentals, and atmosphere media can be organized into ministry-specific sequences.' },
              { icon: Radio, title: 'Broadcast & devotional use', body: 'Prepare worship sequences for live broadcasts, personal devotion, prayer gatherings, conferences, and services with clear transitions.' },
              { icon: Copyright, title: 'Licensed distribution', body: 'Public catalog visibility stays gated by media terms, provider configuration, rights declarations, review, and takedown controls.' },
            ].map((item) => { const Icon = item.icon; return <div key={item.title} className="sacred-panel-dark p-6"><Icon className="h-6 w-6 text-violet-100" /><h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3><p className="mt-3 text-sm leading-6 text-white/43">{item.body}</p><span className="mt-5 inline-flex items-center text-xs font-semibold text-amber-100/65">Rights-aware workflow <ArrowRight className="ml-2 h-3.5 w-3.5" /></span></div>; })}
          </div>
        </div>
      </section>
    </main>
  );
}
