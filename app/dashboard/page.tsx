import Link from 'next/link';
import { BookOpenText, Brain, Building2, Footprints, Globe2, Heart, HeartHandshake, LayoutDashboard, MessageCircleHeart, MonitorSmartphone, ShieldCheck, ShoppingBag, Users, UsersRound, WalletCards } from 'lucide-react';

const actions = [
  { title: 'AI Pastor', description: 'Receive guarded spiritual encouragement and next steps.', href: '/spiritual', icon: MessageCircleHeart },
  { title: 'Scripture Intelligence', description: 'Search translations, save verse collections, and prepare scripture for sermons.', href: '/scripture', icon: BookOpenText },
  { title: 'Live Presentation', description: 'Create sermon slides, verse cards, lyrics, announcements, and screen mode decks.', href: '/presentation', icon: MonitorSmartphone },
  { title: 'Prayer Room', description: 'Submit prayer requests and continue intercession.', href: '/prayer-room', icon: Heart },
  { title: 'Sermon Studio', description: 'Prepare teaching, slides, Bible studies, and sermon-to-everything packs.', href: '/sermons', icon: BookOpenText },
  { title: 'Spiritual Journey', description: 'Track private growth, rewards, notes, milestones, giving, journaling, and family activity.', href: '/journey', icon: Footprints },
  { title: 'Human Care', description: 'Escalate sensitive needs to real care leaders with follow-up workflows.', href: '/care', icon: HeartHandshake },
  { title: 'Rewards Wallet', description: 'Earn points and receive gift support through meaningful activity and service.', href: '/rewards', icon: WalletCards },
  { title: 'Sanctuary Activities', description: 'Daily prayer, service, memory, outreach, and reflection challenges.', href: '/activities', icon: Heart },
  { title: 'Gift Pools', description: 'Conference, worker, transport, data, food, learning, and appreciation gifts.', href: '/gifts', icon: HeartHandshake },
  { title: 'Church Workers', description: 'Assign tasks, collect proof, award points, and track stipends.', href: '/workers', icon: Users },
  { title: 'Bible Games', description: 'Children and youth scripture quizzes with scores and rewards.', href: '/bible-games', icon: BookOpenText },
  { title: 'Raizion Intelligence', description: 'See priorities, signals, care focus, and next ministry actions.', href: '/intelligence', icon: Brain },
  { title: 'Command Center', description: 'Generate weekly operating reports with health score, risks, and opportunities.', href: '/command-center', icon: Brain },
  { title: 'AI Ministry Council', description: 'Coordinate AI Pastor, prayer, sermon, worship, care, admin, and transparency roles.', href: '/council', icon: UsersRound },
  { title: 'Sanctuary Host', description: 'Personal AI guide messages, reminders, action prompts, and next-step nudges.', href: '/sanctuary-host', icon: MessageCircleHeart },
  { title: 'Live Service', description: 'Join service flow, worship, chat, prayer, attendance, and follow-up.', href: '/live-service', icon: Users },
  { title: 'Give', description: 'Create purpose-based offering records.', href: '/offering', icon: WalletCards },
  { title: 'Request Support', description: 'Submit dignified community support needs.', href: '/aid-request', icon: ShieldCheck },
  { title: 'Impact & Testimonies', description: 'Submit testimonies and review community impact stories.', href: '/impact', icon: Heart },
  { title: 'Church Network', description: 'Create church profiles, connect churches, and share ministry resources.', href: '/church-network', icon: Globe2 },
  { title: 'Marketplace', description: 'Explore and sell creator templates, sermon packs, lessons, and worship resources.', href: '/marketplace', icon: ShoppingBag },
  { title: 'Website Builder', description: 'Prepare a public church website connected to your OS.', href: '/website-builder', icon: Building2 },
  { title: 'Multilingual', description: 'Prepare global translation, captions, and local care support.', href: '/multilingual', icon: Globe2 },
  { title: 'Mobile/Offline', description: 'Support low-data, offline, devotional, and notification-ready experiences.', href: '/mobile', icon: MonitorSmartphone },
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
            <h1 className="text-4xl font-light leading-tight text-stone-800 md:text-6xl">Your living sanctuary command center.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">Access scripture intelligence, presentations, care, rewards, workers, conferences, testimonies, church network, marketplace, AI operations, family discipleship, and global ministry tools from one organized route.</p>
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
