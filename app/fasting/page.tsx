import { FastingPrayerPlanner } from '@/components/prayers/FastingPrayerPlanner';
import { BookOpenText, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function FastingPage() {
  return (
    <main className="min-h-screen bg-cream-50 pb-16 pt-24">
      <section className="px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 shadow-sm">
                <HeartHandshake className="mr-2 h-4 w-4" /> Fasting, prayer & consecration
              </div>
              <h1 className="max-w-4xl text-4xl font-light leading-tight tracking-tight text-stone-900 md:text-6xl">
                Build a prayer-centered fasting journey with Scripture, reflection, accountability, and safe adaptations.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg">
                Plan the spiritual purpose, daily Scripture, prayer focus, reflection, and service rhythm. Digital Church OS does not turn fasting into a public score or prescribe unsafe food restriction.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-stone-200 bg-white p-4"><BookOpenText className="h-5 w-5 text-violet-600" /><p className="mt-3 font-semibold text-stone-900">Scripture-led</p><p className="mt-1 text-xs leading-5 text-stone-500">Each day connects prayer to biblical reflection rather than restriction alone.</p></div>
              <div className="rounded-2xl border border-stone-200 bg-white p-4"><HeartHandshake className="h-5 w-5 text-rose-600" /><p className="mt-3 font-semibold text-stone-900">Prayer-centered</p><p className="mt-1 text-xs leading-5 text-stone-500">Move between private prayer, intercession, trusted community, and pastoral care.</p></div>
              <div className="rounded-2xl border border-stone-200 bg-white p-4"><ShieldCheck className="h-5 w-5 text-sage-600" /><p className="mt-3 font-semibold text-stone-900">Health-aware</p><p className="mt-1 text-xs leading-5 text-stone-500">Supports safer spiritual alternatives when food or fluid restriction may be inappropriate.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl"><FastingPrayerPlanner /></div>
      </section>
    </main>
  );
}
