import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  ACTIVE_CHURCH_COOKIE,
  type ChurchWorkspaceAccess,
  type ChurchWorkspaceRole,
  resolveChurchWorkspaceAccess,
} from '@/lib/church-ops/access';

export async function getServerChurchWorkspace(): Promise<{
  sessionUserId: string | null;
  access: ChurchWorkspaceAccess | null;
  requiresSelection: boolean;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { sessionUserId: null, access: null, requiresSelection: false };

  const requestedChurchId = cookies().get(ACTIVE_CHURCH_COOKIE)?.value || null;
  const resolved = await resolveChurchWorkspaceAccess(session.user.id, requestedChurchId);
  return {
    sessionUserId: session.user.id,
    access: resolved.access,
    requiresSelection: resolved.requiresSelection,
  };
}

export async function requireChurchWorkspace(
  allowedRoles: ChurchWorkspaceRole[] = ['OWNER', 'ADMIN', 'PASTOR', 'STAFF']
): Promise<ChurchWorkspaceAccess> {
  const resolved = await getServerChurchWorkspace();

  if (!resolved.sessionUserId) redirect('/auth/signin');
  if (!resolved.access) {
    if (resolved.requiresSelection) redirect('/command-center?selectChurch=1');
    redirect('/church-network?setup=leader');
  }
  if (!allowedRoles.includes(resolved.access.role)) redirect('/dashboard?churchAccess=insufficient');

  return resolved.access;
}
