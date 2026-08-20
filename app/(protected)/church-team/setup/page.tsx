import Link from 'next/link';
import { ArrowRight, Church, HeartHandshake, Radio, ShieldCheck, UsersRound } from 'lucide-react';
import { ChurchWorkspaceSelector } from '@/components/ministry/ChurchWorkspaceSelector';

const steps = [
  {
    title: '1. Church workspace',
    description: 'Create or confirm the church profile that owns shared operations. Existing church_profiles remain the tenant source of truth.',
    href: '/church-network',
    label: 'Open church network',
    icon: Church,
  },
  {
    title: '2. Team access',
    description: 'Owners and tenant admins invite pastors, staff, admins, or viewers with expiring email-bound links. Invitations do not grant access until accepted.',
    href: '/church-team/manage',
    label: 'Manage church team',
    icon: UsersRound,
  },
  {
    title: '3. Weekly operations',
    description: 'Use the command center after an eligible church workspace is selected. Shared weekly records are tenant-scoped and versioned.',
    href: '/command-center',
    label: 'Open command center',
    icon: Radio,
  },
  {
    title: '4. Human care',
    description: 'Keep member care intake separate from leader scheduling and never place restricted counseling, crisis, medical, or safeguarding case content in generic operations.',
    href: '/care',
    label: 'Review member care path',
    icon: HeartHandshake,
  },
  {
    title: '5. Release readiness',
    description: 'Do not treat tenant setup as production readiness. Database migration, auth secrets, provider configuration, permissions, and staging verification remain separate gates.',
    href: '/release-readiness',
    label: 'Review release readiness',
    icon: ShieldCheck,
  },
];

export default function ChurchTeamSetupPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-8">
        <ChurchWorkspaceSelector
          allowedRoles={['OWNER', 'ADMIN', 'PASTOR', 'STAFF']}
          emptyMessage="No church workspace with operational access is attached to this account yet. Start by creating or joining a church profile."
        />

        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <div className="grid xl:grid-cols-[0.86fr_1.14fr]">
            <div className="bg-stone-950 p-7 text-white sm:p-10">
              <ShieldCheck className="h-9 w-9 text-blue-300" />
              <h1 className="mt-6 text-4xl font-light leading-tight">Tenant-safe church setup.</h1>
              <p className="mt-4 text-sm leading-7 text-stone-300">This pathway is intentionally separate from global product administration. A role inside one church must never become authority over every church using Digital Church OS.</p>
              <div className="mt-7 rounded-2xl border border-blue-300/20 bg-blue-300/10 p-5 text-xs leading-6 text-blue-100">
                Tenant roles: OWNER, ADMIN, PASTOR, STAFF, VIEWER. Legacy modules remain globally gated until their storage and APIs are migrated to tenant scope one at a time.
              </div>
            </div>

            <div className="p-7 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Leader setup sequence</p>
              <h2 className="mt-3 text-3xl font-light text-stone-900">Establish authority before automation.</h2>
              <div className="mt-7 space-y-4">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <article key={step.title} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                      <div className="flex items-start gap-4">
                        <span className="rounded-2xl bg-white p-3 text-blue-700 shadow-sm"><Icon className="h-5 w-5" /></span>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-stone-900">{step.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-stone-600">{step.description}</p>
                          <Link href={step.href} className="mt-4 inline-flex items-center text-sm font-semibold text-blue-700">{step.label}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
