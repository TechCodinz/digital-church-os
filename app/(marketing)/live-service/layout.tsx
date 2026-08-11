import type { ReactNode } from 'react';
import { LiveServiceResponseDock } from '@/components/live/LiveServiceResponseDock';
import { LiveSermonCompanion } from '@/components/live/LiveSermonCompanion';

export default function LiveServiceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pb-28 sm:pb-32">
      {children}
      <LiveSermonCompanion />
      <LiveServiceResponseDock />
    </div>
  );
}
