import Link from 'next/link';
import { GroupMinistryPlanner } from '@/components/ministry/GroupMinistryPlanner';
import { Church, UsersRound } from 'lucide-react';

export default function AdminGroupsPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-8">
        <div className="mb-8 grid gap-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
          <div><div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700"><Church className="mr-2 h-4 w-4" /> Leader group operations</div><h1 className="mt-3 text-3xl font-light text-stone-900">Small-group capacity & leadership</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Plan group focus, leadership depth, capacity, rhythm, location, and next actions without exposing internal planning to ordinary member access.</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/groups" className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700"><UsersRound className="mr-2 inline h-4 w-4" /> Member groups</Link><Link href="/admin/follow-up" className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white">Follow-up queue</Link></div>
        </div>
        <GroupMinistryPlanner />
      </div>
    </main>
  );
}
