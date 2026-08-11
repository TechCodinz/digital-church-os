import Link from 'next/link';
import { VolunteerRotaCommandCenter } from '@/components/ministry/VolunteerRotaCommandCenter';
import { UsersRound } from 'lucide-react';

export default function AdminWorkersPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div><div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700"><UsersRound className="mr-2 h-4 w-4" /> Leader workforce operations</div><h1 className="mt-3 text-3xl font-light text-stone-900">Volunteer rota & coverage</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Plan primaries, backups, call times, confirmations, check-ins, and critical coverage behind leader access.</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/workers" className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700">Worker portal</Link><Link href="/service-planner" className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white">Service planner</Link></div>
        </div>
        <VolunteerRotaCommandCenter />
      </div>
    </main>
  );
}
