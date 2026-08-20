import Link from 'next/link';
import { BookOpenText, Footprints } from 'lucide-react';
import { JourneyReferenceLibrary } from '@/components/journey/JourneyReferenceLibrary';

export default function JourneyLibraryPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-sage-200 bg-white px-4 py-2 text-sm font-medium text-sage-700 shadow-sm"><BookOpenText className="mr-2 h-4 w-4" /> Journey Reference Library</div>
            <h1 className="mt-5 text-4xl font-light leading-tight text-stone-900 md:text-6xl">Search the ministry moments you intentionally chose to keep.</h1>
            <p className="mt-4 text-base leading-7 text-stone-600 sm:text-lg">Revisit private reflections and next steps from Scripture, prayer, fasting, sermons, family worship, worship creation, Daily Guide, and service response.</p>
          </div>
          <Link href="/journey" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700"><Footprints className="mr-2 h-4 w-4 text-sage-700" /> Back to Journey</Link>
        </div>
        <JourneyReferenceLibrary />
      </div>
    </main>
  );
}
