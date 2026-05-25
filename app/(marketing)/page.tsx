'use client';

import Link from 'next/link';
import { Calendar, DollarSign, Heart, MessageCircle, Music, Radio, Users } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Conferences',
    description: 'Join virtual conferences, RSVP, access replays, and receive follow-up support.',
    href: '/conferences',
    color: 'text-sage-600',
  },
  {
    icon: Heart,
    title: 'Prayer Room',
    description: 'Share prayer requests publicly or privately and receive guided intercession.',
    href: '/prayer-room',
    color: 'text-rose-500',
  },
  {
    icon: Radio,
    title: 'Live Broadcasts',
    description: 'Host or join devotion, worship, prayer, small-group, and public gathering rooms.',
    href: '/live-broadcast',
    color: 'text-blue-500',
  },
  {
    icon: Music,
    title: 'Worship Media',
    description: 'Build praise playlists, prayer atmospheres, and rewarded worship listening sequences.',
    href: '/worship-media',
    color: 'text-purple-500',
  },
  {
    icon: DollarSign,
    title: 'Transparent Giving',
    description: 'Give, track impact, receive receipts, and see how support helps people.',
    href: '/offering',
    color: 'text-emerald-500',
  },
  {
    icon: Users,
    title: 'Living Sanctuary OS',
    description: 'Care, rewards, workers, marketplace, family discipleship, and AI ministry operations.',
    href: '/dashboard',
    color: 'text-amber-500',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream-50">
      <section className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-cream-100 via-white to-cream-50" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-white/80 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
            <Heart className="mr-2 h-4 w-4" /> Scripture-grounded digital ministry platform
          </div>
          <h1 className="text-5xl font-light leading-tight text-stone-900 md:text-7xl">
            Digital Church OS
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-stone-600 md:text-2xl">
            A living sanctuary operating system for worship, care, giving, discipleship, family growth, live gatherings, and AI-supported ministry operations.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/conferences" className="rounded-full bg-sage-600 px-8 py-4 font-medium text-white shadow-sm transition hover:bg-sage-700">
              Join a Conference
            </Link>
            <Link href="/prayer-room" className="rounded-full border border-stone-200 bg-white px-8 py-4 font-medium text-stone-700 shadow-sm transition hover:bg-stone-50">
              Enter Prayer Room
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-light text-stone-900 md:text-5xl">A place for every soul and every ministry operation.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-stone-600">
              Serve members professionally across worship, prayer, care, giving, content, live gatherings, rewards, family discipleship, and church administration.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} href={feature.href} className="sanctuary-card group block h-full p-7 transition hover:-translate-y-1">
                  <Icon className={`mb-5 h-12 w-12 ${feature.color} transition group-hover:scale-110`} />
                  <h3 className="mb-3 text-xl font-medium text-stone-900">{feature.title}</h3>
                  <p className="leading-7 text-stone-600">{feature.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-stone-900 p-8 text-center text-white shadow-xl md:p-12">
          <MessageCircle className="mx-auto mb-5 h-10 w-10 text-sage-300" />
          <h2 className="text-3xl font-light md:text-4xl">Built for daily engagement, not only Sunday attendance.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-300">
            Members can pray, learn, serve, give, receive support, join broadcasts, earn meaningful rewards, and grow through a private spiritual journey.
          </p>
          <Link href="/dashboard" className="mt-8 inline-flex rounded-full bg-white px-8 py-4 font-medium text-stone-900 transition hover:bg-sage-100">
            Open the Sanctuary Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
