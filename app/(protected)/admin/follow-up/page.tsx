import Link from 'next/link';
import { DiscipleshipFollowUpBoard } from '@/components/ministry/DiscipleshipFollowUpBoard';
import { HeartHandshake, ShieldCheck, UsersRound } from 'lucide-react';

export default function AdminFollowUpPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-20 pt-24">
      <section className="px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-medium text-sage-700 shadow-sm"><UsersRound className="mr-2 h-4 w-4" /> Leader follow-up & discipleship</div>
              <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-900 md:text-6xl">Help spiritual responses become respectful human follow-up, discipleship, belonging, and care.</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg">This leader surface tracks operational next steps without turning people into scores. Consent, human ownership, due dates, and care handoffs stay visible while confidential pastoral details remain in dedicated care systems.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><ShieldCheck className="h-5 w-5 text-sage-600" /><p className="mt-3 font-semibold text-stone-900">Consent aware</p><p className="mt-1 text-xs leading-5 text-stone-500">Follow-up can be paused when consent is absent or withdrawn.</p></div>
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><HeartHandshake className="h-5 w-5 text-rose-600" /><p className="mt-3 font-semibold text-stone-900">Care separated</p><p className="mt-1 text-xs leading-5 text-stone-500">Sensitive counseling or crisis details never belong in the general follow-up board.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <DiscipleshipFollowUpBoard />
        </div>
      </section>

      <section className="mt-12 border-y border-stone-200 bg-white/70 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-700">Connected response flow</p><p className="mt-2 text-sm leading-6 text-stone-600">Members choose their next step in the response experience; leaders use this board to own appropriate follow-through.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/service-response" className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Service response</Link><Link href="/care" className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white">Pastoral care</Link></div>
        </div>
      </section>
    </main>
  );
}
