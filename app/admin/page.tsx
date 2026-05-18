import Link from 'next/link';
import { BarChart3, HeartHandshake, Shield, Users, WalletCards } from 'lucide-react';

const cards = [
  { title: 'Members', description: 'Review user growth, roles, and care needs.', icon: Users },
  { title: 'Giving', description: 'Monitor offerings, purpose allocation, and payment status.', icon: WalletCards },
  { title: 'Support Requests', description: 'Review community support requests and decision trails.', icon: HeartHandshake },
  { title: 'AI Oversight', description: 'Audit AI interactions, risk flags, and module usage.', icon: BarChart3 },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="mb-6 inline-flex items-center rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-sm font-medium text-amber-700 shadow-sm">
              <Shield className="mr-2 h-4 w-4" /> Admin control center
            </div>
            <h1 className="text-4xl font-light text-stone-800 md:text-6xl">Operational oversight for a trusted digital sanctuary.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">Admin routes should centralize safety, ministry operations, payments, support requests, audit logs, and AI supervision.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="sanctuary-card p-6">
                  <Icon className="mb-4 h-7 w-7 text-amber-600" />
                  <h2 className="text-xl font-medium text-stone-800">{card.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{card.description}</p>
                </div>
              );
            })}
          </div>
          <Link href="/admin/settings" className="mt-8 inline-flex rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800">Open admin settings</Link>
        </div>
      </section>
    </div>
  );
}
