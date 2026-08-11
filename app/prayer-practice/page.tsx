import Link from 'next/link';
import { PrayerPracticeCompanion } from '@/components/prayers/PrayerPracticeCompanion';
import { Heart, Sparkles } from 'lucide-react';

export default function PrayerPracticePage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-20 pt-24">
      <section className="px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-medium text-sage-700 shadow-sm"><Heart className="mr-2 h-4 w-4" /> Personal prayer practice</div>
            <h1 className="mt-5 text-4xl font-light leading-tight text-stone-900 md:text-6xl">A quieter prayer space for time, Scripture, reflection, remembrance, and one faithful next step.</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg">Use this when you want personal prayer without the community wall or AI generation. Your practice notes are kept locally on this device unless you deliberately move them elsewhere.</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/prayer-room" className="rounded-xl bg-stone-900 px-4 py-2.5 text-white">Open Prayer Room</Link>
              <Link href="/fasting-prayer" className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-700">Fasting & prayer</Link>
              <Link href="/daily-guide" className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-700"><Sparkles className="mr-1.5 inline h-4 w-4" /> Daily guide</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <PrayerPracticeCompanion />
        </div>
      </section>
    </main>
  );
}
