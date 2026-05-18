import { KeyRound, ServerCog, ShieldCheck, Workflow } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <div className="mb-6 inline-flex items-center rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-sm font-medium text-amber-700 shadow-sm">
              <ServerCog className="mr-2 h-4 w-4" /> Admin settings
            </div>
            <h1 className="text-4xl font-light text-stone-800 md:text-6xl">Configure the sanctuary for safe scale.</h1>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { title: 'Secrets and providers', description: 'NEXTAUTH_SECRET, DATABASE_URL, Stripe, Resend, OpenAI, Pinecone, and Pexels are configured in hosting env.', icon: KeyRound },
              { title: 'Access control', description: 'Admin, reviewer, member, and AI department roles should be assigned intentionally.', icon: ShieldCheck },
              { title: 'Workflow rules', description: 'Set policies for support reviews, post approvals, crisis handoffs, and audit retention.', icon: Workflow },
              { title: 'Operational health', description: 'Monitor build verification, database connectivity, AI cost, and payment errors.', icon: ServerCog },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="sanctuary-card p-6">
                  <Icon className="mb-4 h-7 w-7 text-amber-600" />
                  <h2 className="text-xl font-medium text-stone-800">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
