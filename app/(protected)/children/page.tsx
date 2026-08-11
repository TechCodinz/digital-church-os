'use client';

import { motion } from 'framer-motion';
import { Heart, Sparkles, Music, Star, BookOpen, Shield, ChevronRight, UsersRound } from 'lucide-react';
import Link from 'next/link';

const modules = [
  {
    title: 'Guided Prayer',
    description: 'A gentle, age-aware space that helps children learn how to pray with simple scripture-grounded prompts.',
    icon: Heart,
    color: 'bg-rose-500',
    lightColor: 'bg-rose-50 border-rose-100',
    textColor: 'text-rose-600',
    action: '/children/prayer',
  },
  {
    title: 'Bible Story Adventures',
    description: 'Interactive Bible stories adapted to a child’s age, reading level, and family-selected learning settings.',
    icon: BookOpen,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50 border-blue-100',
    textColor: 'text-blue-600',
    action: '/children/stories',
  },
  {
    title: 'Memory Verse Games',
    description: 'Playful scripture-memory activities with encouraging badges and progress that parents can review.',
    icon: Star,
    color: 'bg-amber-400',
    lightColor: 'bg-amber-50 border-amber-100',
    textColor: 'text-amber-600',
    action: '/children/memory',
  },
  {
    title: 'Joyful Worship',
    description: 'Age-appropriate worship activities, songs, movement, and family-friendly praise experiences.',
    icon: Music,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50 border-purple-100',
    textColor: 'text-purple-600',
    action: '/children/worship',
  },
  {
    title: 'Crafts & Creativity',
    description: 'Bible-centered creative activities and craft ideas families can complete together at home or church.',
    icon: Sparkles,
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50 border-emerald-100',
    textColor: 'text-emerald-600',
    action: '/children/crafts',
  },
  {
    title: 'Parent & Guardian Center',
    description: 'Manage child profiles, consent, safeguards, milestones, devotional plans, and family learning settings.',
    icon: Shield,
    color: 'bg-slate-700',
    lightColor: 'bg-slate-50 border-slate-200',
    textColor: 'text-slate-700',
    action: '/children/parents',
  },
];

const safeguards = [
  'Parent or guardian remains in control of child profiles and learning settings.',
  'AI content is supportive and educational; sensitive concerns should be handled by trusted adults and ministry leaders.',
  'Children’s progress is designed for encouragement, not public comparison or spiritual ranking.',
];

export default function ChildrenDepartmentPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-12 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
              <Sparkles className="mr-2 h-4 w-4" /> Children’s Sanctuary
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="max-w-3xl text-4xl font-light leading-tight text-stone-800 md:text-5xl">
              Safe, joyful discipleship for children and the families guiding them.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
              “Let the little children come to me...” <span className="font-medium text-stone-500">— Matthew 19:14</span>
            </motion.p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/children/parents" className="inline-flex items-center rounded-full bg-sage-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sage-700">
                Open Parent & Guardian Center <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/children/stories" className="inline-flex items-center rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-sage-300 hover:text-sage-700">
                Start a Bible Story
              </Link>
            </div>
          </div>

          <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-[2rem] border border-sage-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-sage-100 p-3 text-sage-700"><Shield className="h-6 w-6" /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-700">Family-first safeguards</p>
                <h2 className="mt-1 text-2xl font-light text-stone-900">Designed around trusted adult oversight.</h2>
              </div>
            </div>
            <div className="space-y-3">
              {safeguards.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-600">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod, index) => (
            <motion.article key={mod.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 + 0.15 }} className={`rounded-3xl border p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${mod.lightColor}`}>
              <div className={`${mod.color} mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm`}>
                <mod.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-stone-800">{mod.title}</h3>
              <p className="mt-3 min-h-[88px] leading-7 text-stone-600">{mod.description}</p>
              <Link href={mod.action} className={`mt-5 inline-flex items-center text-sm font-semibold ${mod.textColor}`}>
                Open experience <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-14 flex flex-col gap-6 rounded-3xl border border-sage-200 bg-sage-50 p-7 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="flex gap-4">
            <div className="hidden rounded-2xl bg-white p-3 text-sage-700 shadow-sm sm:block"><UsersRound className="h-6 w-6" /></div>
            <div>
              <h2 className="text-2xl font-light text-stone-800">Age-aware spiritual formation</h2>
              <p className="mt-2 max-w-3xl leading-7 text-stone-600">Learning experiences can adapt vocabulary and depth for toddlers, preschoolers, and elementary-age children while keeping parent/guardian controls visible and central.</p>
            </div>
          </div>
          <Link href="/children/parents" className="shrink-0 rounded-full bg-stone-900 px-7 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-stone-800">
            Configure family settings
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
