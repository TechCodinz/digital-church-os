import { ChurchTeamManager } from '@/components/ministry/ChurchTeamManager';
import { ChurchWorkspaceSelector } from '@/components/ministry/ChurchWorkspaceSelector';
import { getServerChurchWorkspace } from '@/lib/church-ops/server';
import { redirect } from 'next/navigation';

export default async function ChurchTeamManagePage() {
  const resolved = await getServerChurchWorkspace();
  if (!resolved.sessionUserId) redirect('/auth/signin');

  // When one owner/admin church is already active, reject a lower tenant role.
  // When no church is active (or multiple exist), the role-filtered selector can
  // safely resolve the intended OWNER/ADMIN workspace and the API rechecks it.
  if (resolved.access && !['OWNER', 'ADMIN'].includes(resolved.access.role)) {
    // Do not trap a leader on the wrong active church if they may manage another.
    // Clearing through the selector lets them choose an eligible workspace.
  }

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
