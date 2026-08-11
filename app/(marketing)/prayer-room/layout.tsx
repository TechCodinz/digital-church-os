import type { ReactNode } from 'react';
import { PrayerIntelligenceWorkspace } from '@/components/prayers/PrayerIntelligenceWorkspace';

export default function PrayerRoomLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <PrayerIntelligenceWorkspace />
    </>
  );
}
