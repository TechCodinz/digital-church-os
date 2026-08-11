import type { ReactNode } from 'react';
import { PrayerIntelligenceWorkspace } from '@/components/prayers/PrayerIntelligenceWorkspace';
import { JourneyCarryForward } from '@/components/journey/JourneyCarryForward';

export default function PrayerRoomLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <PrayerIntelligenceWorkspace />
      <JourneyCarryForward
        source="Prayer"
        title="Carry one prayer insight into your private Journey."
        description="After community prayer, private prayer, or AI-assisted prayer drafting, save only the part you intentionally want to remember. The Prayer Room itself remains separate from your private formation history."
        placeholder="What prayer theme, Scripture anchor, gratitude, lament, or answered-prayer reflection do you want to remember?"
        nextStepPlaceholder="Pray again, study a passage, reconcile, ask for care, or follow through on one action…"
      />
    </>
  );
}
