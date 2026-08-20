import { MinistryCommandCenter } from '@/components/ministry/MinistryCommandCenter';

export default function MinistryCommandCenterPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-sage-600">Personal ministry command center</p>
          <h1 className="mt-3 text-4xl font-light leading-tight text-stone-800 md:text-6xl">
            Your spiritual life, participation, and next actions in one calm view.
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">
            Digital Church OS brings your current prayer rhythm, goals, giving activity, gatherings, and participation into a private operating view that helps you decide what to do next without turning faith into a competition.
          </p>
        </div>

        <MinistryCommandCenter />
      </div>
    </main>
  );
}
