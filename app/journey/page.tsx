import { JourneyContinuityPanel } from '@/components/journey/JourneyContinuityPanel';
import { SpiritualJourneyPanel } from '@/components/journey/SpiritualJourneyPanel';
import { Footprints } from 'lucide-react';

export default function JourneyPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-sm font-medium text-sage-700 shadow-sm">
              <Footprints className="mr-2 h-4 w-4" /> Spiritual Journey OS
            </div>
            <h1 className="text-4xl font-light leading-tight text-stone-800 md:text-6xl">Carry Scripture, prayer, worship, sermons, family formation, and daily obedience through one private journey.</h1>
            <p className="mt-6 text-lg leading-8 text-stone-600">Your Journey connects the ministry moments you intentionally save across Digital Church OS. It helps you remember and respond without turning activity into a spiritual score or exposing sensitive care, financial, or child data.</p>
          </div>
          <div className="space-y-8">
            <JourneyContinuityPanel />
            <SpiritualJourneyPanel />
          </div>
        </div>
      </section>
    </div>
  );
}
