import Link from 'next/link';
import { FormationPathwayPlanner } from '@/components/ministry/FormationPathwayPlanner';
import { BookOpenText, Church, ShieldCheck } from 'lucide-react';

export default function FormationPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-20 pt-24">
      <section className="px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-medium text-sage-700 shadow-sm"><BookOpenText className="mr-2 h-4 w-4" /> Foundations, baptism & membership</div>
              <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-900 md:text-6xl">Learn, ask, prepare, and connect with accountable church leadership before major faith milestones.</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg">Use the formation pathway to organize Scripture study and questions around Christian foundations, baptism preparation, and membership/belonging while allowing each local church to supply its own reviewed doctrine and process.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><Church className="h-5 w-5 text-sage-600" /><p className="mt-3 font-semibold text-stone-900">Church-led</p><p className="mt-1 text-xs leading-5 text-stone-500">The software organizes preparation; local accountable leaders own the final process.</p></div>
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><ShieldCheck className="h-5 w-5 text-sage-600" /><p className="mt-3 font-semibold text-stone-900">No pressure funnel</p><p className="mt-1 text-xs leading-5 text-stone-500">Progress and dates support coordination, not coercion or spiritual ranking.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FormationPathwayPlanner />
        </div>
      </section>

      <section className="mt-12 border-y border-stone-200 bg-white/70 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-700">Continue in community</p><p className="mt-2 text-sm leading-6 text-stone-600">Formation should connect to human follow-up, church belonging, and healthy community—not stop at course completion.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/groups" className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Small groups</Link><Link href="/next-steps" className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white">My next steps</Link></div>
        </div>
      </section>
    </main>
  );
}
