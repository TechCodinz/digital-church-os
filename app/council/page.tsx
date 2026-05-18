import Link from 'next/link';
import { getCouncilBriefing, ministryCouncilRoles } from '@/lib/ministry-os/ministryCouncil';
import { ArrowRight, ShieldCheck, UsersRound } from 'lucide-react';

export default function CouncilPage() {
  const briefing = getCouncilBriefing();

  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-4xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <UsersRound className="mr-2 h-4 w-4" /> AI Ministry Council
            </div>
            <h1 className="text-4xl font-light leading-tight text-stone-800 md:text-6xl">A coordinated AI ministry team with clear scope, limits, and human oversight.</h1>
            <p className="mt-6 text-lg leading-8 text-stone-600">{briefing.mission}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {ministryCouncilRoles.map((role) => {
              const Icon = role.icon;
              return (
                <Link key={role.id} href={role.route} className="sanctuary-card group block p-6 hover:-translate-y-1">
                  <div className="mb-5 inline-flex rounded-2xl bg-sage-100 p-3 text-sage-700 transition group-hover:bg-sage-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-medium text-stone-800">{role.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{role.scope}</p>
                  <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Limit: {role.limit}</p>
                  <span className="mt-5 inline-flex items-center text-sm font-semibold text-sage-700">Open role <ArrowRight className="ml-2 h-4 w-4" /></span>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 sanctuary-card p-8">
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-light text-stone-800"><ShieldCheck className="h-6 w-6 text-sage-600" /> Council Operating Rules</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {briefing.operatingRules.map((rule) => (
                <div key={rule} className="rounded-2xl border border-cream-200 bg-white/70 p-4 text-sm leading-6 text-stone-600">{rule}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
