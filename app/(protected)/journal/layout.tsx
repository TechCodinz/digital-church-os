import type { ReactNode } from 'react';
import { JournalAutoJotPanel } from '@/components/journal/JournalAutoJotPanel';

export default function JournalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="bg-cream-50 px-4 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <JournalAutoJotPanel />
        </div>
      </div>
      {children}
    </>
  );
}
