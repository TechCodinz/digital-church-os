import Link from 'next/link';
import { ShieldCheck, UsersRound } from 'lucide-react';

export default function LeaderOnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <section className="fixed inset-x-0 top-16 z-30 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-lg backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-blue-50 p-2 text-blue-700"><ShieldCheck className="h-4 w-4" /></span>
            <div>
              <p className="text-sm font-semibold text-stone-900">Tenant-safe church team access is now separate from global product administration.</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">Owners and tenant admins should invite pastors/staff/viewers from the church-scoped Team Manager rather than requesting global admin privileges.</p>
            </div>
          </div>
          <Link href="/church-team/manage" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white">
            <UsersRound className="mr-2 h-4 w-4" /> Manage church team
          </Link>
        </div>
      </section>
      <div className="pt-28">{children}</div>
    </>
  );
}
