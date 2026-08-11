'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { DailyAlignmentIntelligence } from '@/components/ministry/DailyAlignmentIntelligence';
import {
  BookOpenText,
  Check,
  Heart,
  NotebookPen,
  Radio,
  Sparkles,
  Sunrise,
  UsersRound,
} from 'lucide-react';

const rhythm = [
  { id: 'scripture', title: 'Receive the Word', description: 'Read one passage slowly, in context, before reaching for commentary or AI.', href: '/scripture', icon: BookOpenText },
  { id: 'pray', title: 'Pray honestly', description: 'Respond to God with gratitude, confession, intercession, and your real concerns.', href: '/prayer-room', icon: Heart },
  { id: 'worship', title: 'Make room for worship', description: 'Use silence, song, or a worship sequence that helps you pay attention to God.', href: '/worship-media', icon: Radio },
  { id: 'serve', title: 'Serve one person', description: 'Turn formation outward through encouragement, practical help, generosity, or ministry service.', href: '/activities', icon: UsersRound },
  { id: 'reflect', title: 'Jot what changed', description: 'Capture one insight, one question, and one next step to revisit later.', href: '/journey', icon: NotebookPen },
];

function key() {
  return `digital-church-daily-alignment:${new Date().toISOString().slice(0, 10)}`;
}

export default function DailyGuidePage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [morning, setMorning] = useState('');
  const [evening, setEvening] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key());
      if (!stored) return;
      const data = JSON.parse(stored);
      setCompleted(Array.isArray(data.completed) ? data.completed : []);
      setMorning(data.morning || '');
      setEvening(data.evening || '');
    } catch {
      // Private local rhythm is optional.
    }
  }, []);

  const progress = useMemo(() => Math.round((completed.length / rhythm.length) * 100), [completed.length]);
  const toggle = (id: string) => setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const save = () => {
    try {
      window.localStorage.setItem(key(), JSON.stringify({ completed, morning, evening }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch {
      setSaved(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-7 sm:p-9 lg:p-11">
              <div className="inline-flex items-center rounded-full bg-sage-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sage-700"><Sunrise className="mr-2 h-4 w-4" /> Daily spiritual alignment</div>
              <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight text-stone-900 md:text-5xl">A calm daily guide that keeps Scripture, prayer, worship, service, and reflection connected.</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">The goal is not a streak for its own sake. It is a repeatable rhythm that helps you remain attentive, remember what matters, and carry faith into relationships and service.</p>

              <div className="mt-8 space-y-3">
                {rhythm.map((item) => {
                  const Icon = item.icon;
                  const done = completed.includes(item.id);
                  return <article key={item.id} className={`grid gap-4 rounded-2xl border p-5 transition sm:grid-cols-[auto_1fr_auto] sm:items-center ${done ? 'border-sage-200 bg-sage-50' : 'border-stone-200 bg-stone-50'}`}><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${done ? 'bg-sage-600 text-white' : 'bg-white text-sage-700 shadow-sm'}`}>{done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}</span><div><h2 className="font-semibold text-stone-900">{item.title}</h2><p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p><Link href={item.href} className="mt-2 inline-flex text-xs font-semibold text-sage-700">Open experience →</Link></div><button type="button" onClick={() => toggle(item.id)} className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${done ? 'bg-white text-sage-700' : 'bg-stone-200 text-stone-600'}`}>{done ? 'Done' : 'Mark done'}</button></article>;
                })}
              </div>
            </div>

            <aside className="bg-stone-950 p-7 text-white sm:p-9 lg:p-11">
              <Sparkles className="h-8 w-8 text-sage-300" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-sage-300">Private daily pulse</p>
              <p className="mt-2 text-5xl font-light">{progress}%</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-sage-400" style={{ width: `${progress}%` }} /></div>
              <p className="mt-4 text-sm leading-6 text-stone-400">Progress stays on this device. It is not visible to other members and should never be used to rank spirituality.</p>

              <label className="mt-7 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Morning intention</span><textarea value={morning} onChange={(e) => setMorning(e.target.value)} className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-sage-400" placeholder="What needs your attention, prayer, or surrender today?" /></label>
              <label className="mt-5 block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-400">Evening examen</span><textarea value={evening} onChange={(e) => setEvening(e.target.value)} className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:ring-2 focus:ring-sage-400" placeholder="Where did you notice grace, resistance, need, or a next step?" /></label>
              <button type="button" onClick={save} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-sage-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sage-400">{saved ? <Check className="mr-2 h-4 w-4" /> : <NotebookPen className="mr-2 h-4 w-4" />}{saved ? 'Saved privately' : 'Save today’s reflection'}</button>
              <Link href="/fasting-prayer" className="mt-4 inline-flex w-full justify-center text-sm font-semibold text-amber-300">Open fasting & prayer journey →</Link>
            </aside>
          </div>
        </section>

        <DailyAlignmentIntelligence />
      </div>
    </main>
  );
}
