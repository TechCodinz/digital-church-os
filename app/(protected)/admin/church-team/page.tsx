import { ChurchTeamManager } from '@/components/ministry/ChurchTeamManager';
import { ChurchWorkspaceSelector } from '@/components/ministry/ChurchWorkspaceSelector';

export default function ChurchTeamPage() {
  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-8">
        <ChurchWorkspaceSelector
          allowedRoles={['OWNER', 'ADMIN']}
          emptyMessage="No church workspace where you are an owner or tenant admin is attached to this account."
        />
        <ChurchTeamManager />
      </div>
    </main>
  );
}
