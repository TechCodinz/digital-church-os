import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type ChurchWorkspaceRole = 'OWNER' | 'ADMIN' | 'PASTOR' | 'STAFF' | 'VIEWER';

export type ChurchWorkspaceAccess = {
  id: string;
  name: string;
  slug: string;
  denomination: string | null;
  country: string | null;
  city: string | null;
  role: ChurchWorkspaceRole;
};

export const CHURCH_OPS_WRITE_ROLES: ChurchWorkspaceRole[] = ['OWNER', 'ADMIN', 'PASTOR', 'STAFF'];
export const CHURCH_OPS_ADMIN_ROLES: ChurchWorkspaceRole[] = ['OWNER', 'ADMIN'];

export async function listChurchWorkspaces(userId: string): Promise<ChurchWorkspaceAccess[]> {
  return prisma.$queryRaw<Array<ChurchWorkspaceAccess>>(Prisma.sql`
    SELECT DISTINCT
      cp.id,
      cp.name,
      cp.slug,
      cp.denomination,
      cp.country,
      cp.city,
      CASE
        WHEN cp.owner_id = ${userId} THEN 'OWNER'
        ELSE COALESCE(cpm.role, 'VIEWER')
      END AS role
    FROM church_profiles cp
    LEFT JOIN church_profile_members cpm
      ON cpm.church_id = cp.id
      AND cpm.user_id = ${userId}
      AND cpm.status = 'ACTIVE'
    WHERE cp.owner_id = ${userId}
       OR cpm.user_id = ${userId}
    ORDER BY cp.name ASC
  `);
}

export async function resolveChurchWorkspaceAccess(
  userId: string,
  requestedChurchId?: string | null
): Promise<{ access: ChurchWorkspaceAccess | null; requiresSelection: boolean }> {
  const workspaces = await listChurchWorkspaces(userId);

  if (requestedChurchId) {
    return {
      access: workspaces.find((workspace) => workspace.id === requestedChurchId) || null,
      requiresSelection: false,
    };
  }

  if (workspaces.length === 1) {
    return { access: workspaces[0], requiresSelection: false };
  }

  return {
    access: null,
    requiresSelection: workspaces.length > 1,
  };
}

export function canWriteChurchOps(role: ChurchWorkspaceRole) {
  return CHURCH_OPS_WRITE_ROLES.includes(role);
}

export function canAdminChurchWorkspace(role: ChurchWorkspaceRole) {
  return CHURCH_OPS_ADMIN_ROLES.includes(role);
}
