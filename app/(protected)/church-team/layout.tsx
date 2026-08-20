import Link from 'next/link';
import { Church, Settings2, UsersRound } from 'lucide-react';

export default function ChurchTeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-x-0 top-16 z-30 px-4 sm:px-6 lg:px-8">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white/95 p-2 shadow-lg backdrop-blur">
          <Link href="/church-team/setup" className="inline-flex items-center rounded-xl px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"><Settings2 className="mr-2 h-4 w-4" /> Tenant setup</Link>
          <Link href="/church-team/manage" className="inline-flex items-center rounded-xl px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"><UsersRound className="mr-2 h-4 w-4" /> Team access</Link>
          <Link href="/church-network" className="inline-flex items-center rounded-xl px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"><Church className="mr-2 h-4 w-4" /> Church profiles</Link>
        </nav>
      </div>
      <div className="pt-20">{children}</div>
    </>
  );
}
