'use client';

import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Heart, Music, Shield, Sparkles, Star, UsersRound } from 'lucide-react';
import Link from 'next/link';

const modules = [
  { title: 'Guided Prayer', description: 'Simple Scripture-grounded prayer learning that stays inside parent and guardian oversight.', icon: Heart, lightColor: 'bg-rose-50 border-rose-100', textColor: 'text-rose-600', action: '/children/prayer' },
  { title: 'Bible Story Adventures', description: 'Interactive Bible stories adapted to age and family-selected learning settings.', icon: BookOpen, lightColor: 'bg-blue-50 border-blue-100', textColor: 'text-blue-600', action: '/children/stories' },
  { title: 'Memory Verse Games', description: 'Playful Scripture-memory activities with progress adults can review without spiritual ranking.', icon: Star, lightColor: 'bg-amber-50 border-amber-100', textColor: 'text-amber-600', action: '/children/memory' },
  { title: 'Joyful Worship', description: 'Age-appropriate worship, movement, music, and family-friendly praise experiences.', icon: Music, lightColor: 'bg-purple-50 border-purple-100', textColor: 'text-purple-600', action: '/children/worship' },
  { title: 'Crafts & Creativity', description: 'Bible-centered creative activities designed for families or trusted adults to do together.', icon: Sparkles, lightColor: 'bg-emerald-50 border-emerald-100', textColor: 'text-emerald-600', action: '/children/crafts' },
  { title: 'Parent & Guardian Center', description: 'Manage profiles, consent, safeguards, milestones, devotional plans, and learning settings.', icon: Shield, lightColor: 'bg-slate-50 border-slate-200', textColor: 'text-slate-700', action: '/children/parents' },
];

const safeguards = [
  'Parent or guardian remains in control of child profiles and learning settings.',
  'AI content is educational support—not a trusted adult, counselor, pastor, or private confidant for a child.',
  'Children’s progress is for encouragement and review, never public comparison, holiness scoring, or spiritual ranking.',
  'Sensitive concerns should move to trusted adults and appropriate church safeguarding workflows.',
];

export default function ChildrenDepartmentPage() {
  return (
    <main className="sanctuary-page-shell min-h-screen bg-[#06110f] pb-20 pt-20 text-white sm:pt-24">
      <section className="sanctuary-cinematic-hero relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="sanctuary-light-column" />
        <div className="sanctuary-nave" />
        <div className="sanctuary-vignette" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-sm font-medium text-amber-100 backdrop-blur-xl"><Sparkles className="mr-2 h-4 w-4" /> Children’s Sanctuary</div>
            <h1 className="mt-6 text-4xl font-light leading-[1.04] text-white md:text-7xl">Wonder, Scripture, music, creativity—and trusted adults always close by.</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">A joyful learning environment for children, designed around family control and church safeguarding rather than unsupervised AI companionship.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/children/parents" className="sacred-primary-button"><Shield className="h-4 w-4" /> Parent & Guardian Center</Link><Link href="/children/stories" className="sacred-secondary-button"><BookOpen className="h-4 w-4" /> Start a Bible story</Link></div>
          </motion.div>

          <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="sacred-panel-dark relative z-10 p-6">
            <p className="sanctuary-section-label text-emerald-200/60">Family-first safeguards</p>
            <h2 className="mt-2 text-2xl font-light text-white">Designed around trusted adult oversight.</h2>
            <div className="mt-5 space-y-3">{safeguards.map((item) => <div key={item} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-xs leading-6 text-white/48"><Shield className="mt-1 h-4 w-4 shrink-0 text-emerald-200" /><span>{item}</span></div>)}</div>
          </motion.aside>
        </div>
      </section>

      <section className="bg-[#f7f5ef] px-4 py-14 text-stone-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl"><p className="sanctuary-section-label text-emerald-700">Choose an experience</p><h2 className="mt-2 text-4xl font-light leading-tight text-stone-800">Learning that invites curiosity without replacing relationship</h2><p className="mt-3 text-sm leading-7 text-stone-600">Each experience should be opened inside the family or ministry context that makes sense for the child.</p></div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod, index) => (
              <motion.article key={mod.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.05, 0.25) }} className={`rounded-[2rem] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${mod.lightColor}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm"><mod.icon className={`h-6 w-6 ${mod.textColor}`} /></div>
                <h3 className="mt-5 text-2xl font-semibold text-stone-800">{mod.title}</h3>
                <p className="mt-3 min-h-[72px] text-sm leading-7 text-stone-600">{mod.description}</p>
                <Link href={mod.action} className={`mt-5 inline-flex items-center text-sm font-semibold ${mod.textColor}`}>Open experience <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </motion.article>
            ))}
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Link href="/family-altar" className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"><UsersRound className="h-5 w-5 text-emerald-600" /><h3 className="mt-4 font-semibold text-stone-800">Family Altar</h3><p className="mt-2 text-xs leading-6 text-stone-500">Bring Scripture, prayer, gratitude, and a simple act of love into the household together.</p></Link>
            <Link href="/sunday-school" className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"><BookOpen className="h-5 w-5 text-amber-600" /><h3 className="mt-4 font-semibold text-stone-800">Teacher preparation</h3><p className="mt-2 text-xs leading-6 text-stone-500">Adult teachers prepare and review class material before it reaches children.</p></Link>
            <Link href="/care" className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"><Shield className="h-5 w-5 text-rose-500" /><h3 className="mt-4 font-semibold text-stone-800">Sensitive concern?</h3><p className="mt-2 text-xs leading-6 text-stone-500">Move safeguarding or pastoral concerns into accountable human care rather than a child-facing AI experience.</p></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
