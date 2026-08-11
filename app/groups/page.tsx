import Link from 'next/link';
import { GroupMinistryPlanner } from '@/components/ministry/GroupMinistryPlanner';
import { Church, ShieldCheck, UsersRound } from 'lucide-react';

export default function GroupsPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-20 pt-24">
      <section className="px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm"><Church className="mr-2 h-4 w-4" /> Small groups & community</div>
              <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-900 md:text-6xl">Build relational ministry capacity beyond the Sunday gathering.</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg">Plan healthy groups with clear focus, primary and backup leaders, meeting rhythms, locations, capacity, and next actions so new believers, members, families, and people seeking community have appropriate places to connect.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><UsersRound className="h-5 w-5 text-indigo-600" /><p className="mt-3 font-semibold text-stone-900">Leadership depth</p><p className="mt-1 text-xs leading-5 text-stone-500">Primary and backup leaders are visible before groups become dependent on one person.</p></div>
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><ShieldCheck className="h-5 w-5 text-indigo-600" /><p className="mt-3 font-semibold text-stone-900">Healthy capacity</p><p className="mt-1 text-xs leading-5 text-stone-500">Capacity is used for planning and care, never as a spiritual ranking.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <GroupMinistryPlanner />
        </div>
      </section>

      <section className="mt-12 border-y border-stone-200 bg-white/70 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-700">Community continuity</p><p className="mt-2 text-sm leading-6 text-stone-600">Connect new-believer follow-up to groups, then use events and activities to keep community and service opportunities visible.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/admin/follow-up" className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Follow-up</Link><Link href="/events" className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Events</Link></div>
        </div>
      </section>
    </main>
  );
}
