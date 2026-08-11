import { ChurchTeamManager } from '@/components/ministry/ChurchTeamManager';
import { ChurchWorkspaceSelector } from '@/components/ministry/ChurchWorkspaceSelector';
import { requireChurchWorkspace } from '@/lib/church-ops/server';

export default async function ChurchTeamPage() {
  await requireChurchWorkspace(['OWNER', 'ADMIN']);

  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-8">
        <ChurchWorkspaceSelector />
        <ChurchTeamManager />
      </div>
    </main>
  );
}
