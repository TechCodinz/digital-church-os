import Link from 'next/link';
import { EventMinistryPlanner } from '@/components/ministry/EventMinistryPlanner';
import { CalendarDays, Check, ShieldCheck, UsersRound } from 'lucide-react';

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-20 pt-24">
      <section className="px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-fuchsia-200 bg-white px-4 py-2 text-sm font-medium text-fuchsia-700 shadow-sm"><CalendarDays className="mr-2 h-4 w-4" /> Events & ministry calendar</div>
              <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-900 md:text-6xl">Move church events from announcement to accountable execution and follow-up.</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg">Plan purpose, audience, ownership, capacity, registration posture, tasks, volunteer coverage, safeguarding, accessibility, media, communications, care, and contingency before inviting people.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { icon: Check, title: 'Readiness first', body: 'Operational checks are visible before promotion or registration begins.' },
                { icon: UsersRound, title: 'People owned', body: 'Every task can have a human owner and due date.' },
                { icon: ShieldCheck, title: 'Safeguarding aware', body: 'Children, accessibility, care, and contingency stay inside event planning.' },
              ].map((item) => { const Icon = item.icon; return <div key={item.title} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><Icon className="h-5 w-5 text-fuchsia-600" /><p className="mt-3 font-semibold text-stone-900">{item.title}</p><p className="mt-1 text-xs leading-5 text-stone-500">{item.body}</p></div>; })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <EventMinistryPlanner />
        </div>
      </section>

      <section className="mt-12 border-y border-stone-200 bg-white/70 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-700">Connected ministry flow</p><p className="mt-2 text-sm leading-6 text-stone-600">Staff the event through Workers, connect outreach through Activities, and use Service Planner when the event includes a worship gathering or broadcast.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/workers" className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Workers</Link><Link href="/activities" className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Activities</Link><Link href="/service-planner" className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Service planner</Link></div>
        </div>
      </section>
    </main>
  );
}
