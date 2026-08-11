import { EventMinistryPlanner } from '@/components/ministry/EventMinistryPlanner';

export default function AdminEventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <section className="bg-cream-50 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <EventMinistryPlanner />
        </div>
      </section>
    </>
  );
}
