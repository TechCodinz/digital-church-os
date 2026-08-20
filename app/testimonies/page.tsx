import { TestimonyReviewWorkflow } from '@/components/ministry/TestimonyReviewWorkflow';
import { ChurchWorkspaceSelector } from '@/components/ministry/ChurchWorkspaceSelector';
import { requireChurchWorkspace } from '@/lib/church-ops/server';

export default async function TestimoniesPage() {
  await requireChurchWorkspace(['OWNER', 'ADMIN', 'PASTOR', 'STAFF']);

  return (
    <main className="min-h-screen bg-cream-50 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-8">
        <ChurchWorkspaceSelector allowedRoles={['OWNER', 'ADMIN', 'PASTOR', 'STAFF']} emptyMessage="No church workspace with testimony-review access is attached to this account." />
        <TestimonyReviewWorkflow />
      </div>
    </main>
  );
}
