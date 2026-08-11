import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  ACTIVE_CHURCH_COOKIE,
  type ChurchWorkspaceAccess,
  type ChurchWorkspaceRole,
  listChurchWorkspaces,
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

export async function requireAnyChurchWorkspace(
  allowedRoles: ChurchWorkspaceRole[] = ['OWNER', 'ADMIN', 'PASTOR', 'STAFF']
): Promise<ChurchWorkspaceAccess[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/signin');

  const workspaces = await listChurchWorkspaces(session.user.id);
  const allowed = workspaces.filter((workspace) => allowedRoles.includes(workspace.role));
  if (!allowed.length) redirect('/church-network?setup=leader');
  return allowed;
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
  if (!allowedRoles.includes(resolved.access.role)) redirect('/command-center?selectChurch=1&reason=role');

  return resolved.access;
}
