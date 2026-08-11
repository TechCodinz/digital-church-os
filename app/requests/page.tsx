import { ChurchRequestsDesk } from '@/components/ministry/ChurchRequestsDesk';
import { ChurchWorkspaceSelector } from '@/components/ministry/ChurchWorkspaceSelector';
import { requireChurchWorkspace } from '@/lib/church-ops/server';

export default async function RequestsPage() {
  await requireChurchWorkspace(['OWNER', 'ADMIN', 'PASTOR', 'STAFF']);

  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-8">
        <ChurchWorkspaceSelector allowedRoles={['OWNER', 'ADMIN', 'PASTOR', 'STAFF']} emptyMessage="No church workspace with request-desk access is attached to this account." />
        <ChurchRequestsDesk />
      </div>
    </main>
  );
}
