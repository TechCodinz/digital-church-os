import Link from 'next/link';
import { BookOpenText, Heart, LayoutDashboard, MessageCircleHeart, ShieldCheck, Users, WalletCards } from 'lucide-react';

const actions = [
  { title: 'AI Pastor', description: 'Receive guarded spiritual encouragement and next steps.', href: '/spiritual', icon: MessageCircleHeart },
  { title: 'Prayer Room', description: 'Submit prayer requests and continue intercession.', href: '/prayer-room', icon: Heart },
  { title: 'Sermon Studio', description: 'Prepare structured teaching with scripture guardrails.', href: '/sermons', icon: BookOpenText },
  { title: 'Live Service', description: 'Join service flow, worship, chat, and follow-up.', href: '/live-service', icon: Users },
  { title: 'Give', description: 'Create purpose-based offering records.', href: '/offering', icon: WalletCards },
  { title: 'Request Support', description: 'Submit dignified community support needs.', href: '/aid-request', icon: ShieldCheck },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Member dashboard
            </div>
            <h1 className="text-4xl font-light leading-tight text-stone-800 md:text-6xl">Your sanctuary command center.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">Access spiritual care, prayer, teaching, giving, community, children, and service workflows from one organized route.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {actions.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="sanctuary-card group block p-6 hover:-translate-y-1">
                  <div className="mb-5 inline-flex rounded-2xl bg-sage-100 p-3 text-sage-700 transition group-hover:bg-sage-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-medium text-stone-800">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
