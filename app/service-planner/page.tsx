import Link from 'next/link';
import { ServiceOperationsPlanner } from '@/components/ministry/ServiceOperationsPlanner';
import { ChurchWorkspaceSelector } from '@/components/ministry/ChurchWorkspaceSelector';
import { WorshipServicePlanner } from '@/components/worship/WorshipServicePlanner';
import { CalendarDays, Radio, ShieldCheck, UsersRound } from 'lucide-react';
import { requireChurchWorkspace } from '@/lib/church-ops/server';

export default async function ServicePlannerPage() {
  await requireChurchWorkspace(['OWNER', 'ADMIN', 'PASTOR', 'STAFF']);

  return (
    <main className="min-h-screen bg-cream-50 pb-20 pt-24">
      <section className="px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ChurchWorkspaceSelector
            allowedRoles={['OWNER', 'ADMIN', 'PASTOR', 'STAFF']}
            emptyMessage="No church workspace with service-planning access is attached to this account."
          />
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm"><CalendarDays className="mr-2 h-4 w-4" /> Service planning & production</div>
              <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-900 md:text-6xl">Plan the worship gathering, people, production, care response, accessibility, and fallback before the room goes live.</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg">The service planner separates whole-service operations from the worship-team arrangement workflow, while keeping them connected. The whole-service plan is now tenant-scoped to the active church workspace.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { icon: Radio, title: 'Production ready', body: 'Stream, audio, slides, cues, timing, and fallback become explicit.' },
                { icon: UsersRound, title: 'People owned', body: 'Every service moment can have a named human owner and backup.' },
                { icon: ShieldCheck, title: 'Care aware', body: 'Accessibility, children, response, rights, and pastoral care are part of readiness.' },
              ].map((item) => { const Icon = item.icon; return <div key={item.title} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><Icon className="h-5 w-5 text-blue-600" /><p className="mt-3 font-semibold text-stone-900">{item.title}</p><p className="mt-1 text-xs leading-5 text-stone-500">{item.body}</p></div>; })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <ServiceOperationsPlanner />
          <WorshipServicePlanner />
        </div>
      </section>

      <section className="mt-12 border-y border-stone-200 bg-white/70 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-700">Continue the operating flow</p><p className="mt-2 text-sm leading-6 text-stone-600">Check tenant-scoped volunteer coverage before service, then move into the live-service second screen when the gathering begins.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/workers/manage" className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Volunteer coverage</Link><Link href="/live-service" className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Open live service</Link></div>
        </div>
      </section>
    </main>
  );
}
