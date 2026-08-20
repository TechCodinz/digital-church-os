import Link from 'next/link';
import { ChurchWorkspaceSelector } from '@/components/ministry/ChurchWorkspaceSelector';
import { PastoralCareAppointments } from '@/components/care/PastoralCareAppointments';
import { requireChurchWorkspace } from '@/lib/church-ops/server';
import { HeartHandshake, ShieldCheck } from 'lucide-react';

export default async function CareManagementPage() {
  await requireChurchWorkspace(['OWNER', 'ADMIN', 'PASTOR', 'STAFF']);

  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-8">
        <ChurchWorkspaceSelector
          allowedRoles={['OWNER', 'ADMIN', 'PASTOR', 'STAFF']}
          emptyMessage="No church workspace with pastoral coordination access is attached to this account."
        />
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-rose-700"><HeartHandshake className="mr-2 h-4 w-4" /> Tenant care operations</div>
            <h1 className="mt-3 text-3xl font-light text-stone-900">Pastoral appointment coordination</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Coordinate ownership, permission, contact mode, scheduling, and referral posture inside the active church workspace. Members still use the care pathway to request human support.</p>
          </div>
          <div className="flex flex-wrap gap-2"><Link href="/care" className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700">Member care pathway</Link><Link href="/follow-up/manage" className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white">Follow-up board</Link></div>
        </div>
        <PastoralCareAppointments />
        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-800"><ShieldCheck className="mr-2 inline h-4 w-4" /> Keep counseling notes, crisis details, medical information, abuse/safeguarding records, and other restricted case content in purpose-built protected systems rather than this scheduling board.</div>
      </div>
    </main>
  );
}
