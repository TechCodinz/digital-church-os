import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  HandHeart,
  HeartHandshake,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

const responsePaths = [
  {
    title: 'I chose to follow Christ',
    description: 'Start a clear new-believer pathway for prayer, Scripture, baptism preparation, church belonging, and human follow-up.',
    href: '/next-steps',
    icon: Sparkles,
    tone: 'border-sage-100 bg-sage-50 text-sage-700',
  },
  {
    title: 'I need prayer',
    description: 'Share a prayer request and choose whether it stays private, goes to a prayer team, or needs pastoral follow-up.',
    href: '/prayer-room',
    icon: MessageCircleHeart,
    tone: 'border-rose-100 bg-rose-50 text-rose-700',
  },
  {
    title: 'I want pastoral care',
    description: 'Ask for human care, counseling follow-up, or sensitive ministry support. AI remains advisory; people lead the care.',
    href: '/care',
    icon: HeartHandshake,
    tone: 'border-amber-100 bg-amber-50 text-amber-700',
  },
  {
    title: 'I want to grow from this message',
    description: 'Continue into Scripture, save a journal reflection, and build a private next-step discipleship rhythm.',
    href: '/journey',
    icon: BookOpen,
    tone: 'border-violet-100 bg-violet-50 text-violet-700',
  },
  {
    title: 'I want to serve',
    description: 'Discover ministry activities and practical ways to serve people, events, outreach, and church teams.',
    href: '/activities',
    icon: HandHeart,
    tone: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  },
  {
    title: 'I want church connection',
    description: 'Find community, leaders, ministries, and trusted church connections that can continue walking with you.',
    href: '/church-network',
    icon: UsersRound,
    tone: 'border-blue-100 bg-blue-50 text-blue-700',
  },
  {
    title: 'I want to support the mission',
    description: 'Give intentionally and follow transparent impact instead of treating generosity like an isolated transaction.',
    href: '/impact',
    icon: Sparkles,
    tone: 'border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700',
  },
];

export default function ServiceResponsePage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-900 p-7 text-white shadow-xl md:p-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sage-200">
              <ShieldCheck size={14} /> Human-led spiritual response
            </div>
            <h1 className="text-4xl font-light leading-tight md:text-5xl">Respond to what God is stirring in you.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
              A live service should not end at the video player. Choose a next step for salvation and discipleship, prayer, care, Scripture, service, church connection, or transparent support. Sensitive decisions remain human-led and private by default.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/live-service" className="rounded-2xl bg-sage-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-600">
                Return to live service
              </Link>
              <Link href="/dashboard" className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Open my sanctuary
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {responsePaths.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className={`group rounded-3xl border p-6 transition hover:-translate-y-0.5 hover:shadow-sm ${item.tone}`}>
                <div className="mb-5 inline-flex rounded-2xl bg-white/80 p-3 shadow-sm">
                  <Icon size={22} />
                </div>
                <h2 className="text-lg font-semibold text-stone-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                  Continue <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </section>

        <section className="mt-8 rounded-3xl border border-sage-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-sage-50 p-3 text-sage-700">
              <HeartHandshake size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-900">Need a person, not another screen?</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
                Use the care pathway to request human follow-up. Digital Church OS can organize and prioritize care, but it should never replace pastoral presence, trusted community, or appropriate emergency support.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
