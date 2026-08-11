import type { ReactNode } from 'react';
import { FastingPrayerPlanner } from '@/components/prayers/FastingPrayerPlanner';

export default function FastingPrayerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <section className="bg-cream-50 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FastingPrayerPlanner />
        </div>
      </section>
    </>
  );
}
