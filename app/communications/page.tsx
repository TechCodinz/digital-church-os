import { ChurchCommunicationsPlanner } from '@/components/ministry/ChurchCommunicationsPlanner';

export default function CommunicationsPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-8">
        <ChurchCommunicationsPlanner />
      </div>
    </main>
  );
}
