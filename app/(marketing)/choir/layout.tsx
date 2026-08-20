import type { ReactNode } from 'react';
import { WorshipCreationCommandDeck } from '@/components/worship/WorshipCreationCommandDeck';

export default function ChoirLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="bg-cream-50 px-4 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <WorshipCreationCommandDeck />
        </div>
      </div>
      {children}
    </>
  );
}
