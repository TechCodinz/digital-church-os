import Link from 'next/link';
import { ArrowRight, CheckCircle2, Compass, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';

type WorkspaceItem = {
  title: string;
  description: string;
};

type WorkspaceAction = {
  label: string;
  href: string;
  description: string;
};

type AdvancedMinistryWorkspaceProps = {
  eyebrow: string;
  title: string;
  description: string;
  emoji: string;
  focus: WorkspaceItem[];
  intelligence: WorkspaceItem[];
  safeguards: string[];
  actions: WorkspaceAction[];
  privacyNote?: string;
};

export function AdvancedMinistryWorkspace({
  eyebrow,
  title,
  description,
  emoji,
  focus,
  intelligence,
  safeguards,
  actions,
  privacyNote = 'Sensitive notes and decisions should remain permission-aware, human-reviewable, and private by default.',
}: AdvancedMinistryWorkspaceProps) {
  return (
    <main className="min-h-screen bg-cream-50 pb-28 pt-20 sm:pt-24 lg:pb-16">
      <section className="relative overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(120,155,100,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(210,180,140,0.22),_transparent_36%)]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-sage-200 bg-white/85 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" /> {eyebrow}
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-900 md:text-6xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">{description}</p>
            <div className="mt-7 flex flex-wrap gap-2 text-xs font-medium text-stone-600">
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white/80 px-3 py-1.5"><Compass className="mr-1.5 h-3.5 w-3.5 text-sage-600" /> Guided workflow</span>
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white/80 px-3 py-1.5"><LockKeyhole className="mr-1.5 h-3.5 w-3.5 text-sage-600" /> Privacy aware</span>
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white/80 px-3 py-1.5"><ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-sage-600" /> Human accountable</span>
            </div>
          </div>

          <div className="sanctuary-card overflow-hidden p-0 shadow-2xl">
            <div className="border-b border-cream-200 bg-gradient-to-br from-white to-sage-50/80 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sage-600">Ministry intelligence</p>
                  <h2 className="mt-2 text-2xl font-medium text-stone-900">A guided command surface</h2>
                </div>
                <div className="rounded-3xl border border-sage-100 bg-white p-4 text-4xl shadow-sm" aria-hidden="true">{emoji}</div>
              </div>
            </div>
            <div className="grid gap-3 p-5 sm:p-6">
              {intelligence.map((item, index) => (
                <article key={item.title} className="rounded-2xl border border-cream-200 bg-white/85 p-4">
                  <div className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-100 text-xs font-bold text-sage-700">{index + 1}</span>
                    <div>
                      <h3 className="font-semibold text-stone-900">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-cream-200 bg-white/65 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Workspace capabilities</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-light text-stone-900 sm:text-4xl">Built for real ministry action, not a static information page.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {focus.map((item) => (
              <article key={item.title} className="sanctuary-card p-6">
                <CheckCircle2 className="h-6 w-6 text-sage-600" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold text-stone-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Connected next actions</p>
              <h2 className="mt-2 text-3xl font-light text-stone-900">Carry context into the rest of Church OS.</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {actions.map((action) => (
                  <Link key={`${action.href}-${action.label}`} href={action.href} className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sage-300 hover:shadow-md">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold text-stone-900">{action.label}</h3>
                      <ArrowRight className="h-4 w-4 text-sage-600 transition group-hover:translate-x-1" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <aside className="rounded-[2rem] bg-stone-900 p-7 text-white shadow-xl sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-200">Trust posture</p>
              <p className="mt-4 text-lg leading-8 text-stone-100">{privacyNote}</p>
              <div className="mt-6 space-y-3">
                {safeguards.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-6 text-stone-100">{item}</div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {actions[0] && (
        <div className="fixed inset-x-0 bottom-[5.1rem] z-30 px-3 sm:hidden">
          <Link href={actions[0].href} className="mx-auto flex min-h-12 max-w-md items-center justify-center rounded-2xl bg-sage-600 px-5 text-sm font-semibold text-white shadow-2xl">
            {actions[0].label} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      )}
    </main>
  );
}
