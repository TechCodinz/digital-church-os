import type { ReactNode } from 'react';
import { PrayerIntelligenceWorkspace } from '@/components/prayers/PrayerIntelligenceWorkspace';
import { JourneyContinuityComposer } from '@/components/journey/JourneyContinuityComposer';

export default function PrayerRoomLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <PrayerIntelligenceWorkspace />
      <section className="bg-cream-50 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <JourneyContinuityComposer
            source="Prayer"
            title="Carry one prayer insight into your private Journey"
            prompt="After community prayer, private prayer, or AI-assisted prayer drafting, save only the theme, Scripture anchor, gratitude, lament, answered-prayer reflection, or next step you intentionally want to remember."
            nextHref="/daily-guide"
            nextLabel="Carry into Daily Guide"
            privacyNote="Prayer requests, AI inputs, community-wall details, and care records are not copied automatically. Only what you type into this continuity composer is saved to Journey."
          />
        </div>
      </section>
    </>
  );
}
