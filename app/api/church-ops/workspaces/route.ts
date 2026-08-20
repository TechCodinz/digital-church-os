import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listChurchWorkspaces } from '@/lib/church-ops/access';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const workspaces = await listChurchWorkspaces(session.user.id);
    return NextResponse.json({
      workspaces,
      count: workspaces.length,
      requiresSelection: workspaces.length > 1,
      needsChurchProfile: workspaces.length === 0,
    });
  } catch (error: any) {
    console.error('Church workspace discovery failed:', error?.message || error);
    return NextResponse.json(
      {
        error: 'Church workspace persistence is not ready.',
        migrationRequired: true,
      },
      { status: 503 }
    );
  }
}
