import { RaizionIntelligencePanel } from '@/components/intelligence/RaizionIntelligencePanel';
import { Brain } from 'lucide-react';

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <Brain className="mr-2 h-4 w-4" /> Raizion Ministry Intelligence
            </div>
            <h1 className="text-4xl font-light leading-tight text-stone-800 md:text-6xl">Know what the church should do next.</h1>
            <p className="mt-6 text-lg leading-8 text-stone-600">Raizion reads safe ministry activity signals and turns them into priorities, sermon suggestions, outreach ideas, care-team focus, and operational recommendations.</p>
          </div>
          <RaizionIntelligencePanel />
        </div>
      </section>
    </div>
  );
}
