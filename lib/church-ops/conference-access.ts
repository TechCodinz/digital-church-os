import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  canAdminChurchWorkspace,
  canWriteChurchOps,
  resolveChurchWorkspaceAccess,
  type ChurchWorkspaceRole,
} from '@/lib/church-ops/access';

export type ConferenceTenantScope = {
  id: string;
  churchProfileId: string | null;
  churchVisibility: string | null;
  status: string;
  startDate: Date;
  endDate: Date;
  maxAttendees: number | null;
};

export type ChurchProfileScope = {
  id: string;
  visibility: string;
};

export async function getConferenceTenantScope(conferenceId: string): Promise<ConferenceTenantScope | null> {
  const rows = await prisma.$queryRaw<Array<ConferenceTenantScope>>(Prisma.sql`
    SELECT
      c.id,
      c.church_profile_id AS "churchProfileId",
      cp.visibility AS "churchVisibility",
      c.status,
      c."startDate" AS "startDate",
      c."endDate" AS "endDate",
      c."maxAttendees" AS "maxAttendees"
    FROM "Conference" c
    LEFT JOIN church_profiles cp ON cp.id = c.church_profile_id
    WHERE c.id = ${conferenceId}
    LIMIT 1
  `);
  return rows[0] || null;
}

export async function getChurchProfileScope(churchId: string): Promise<ChurchProfileScope | null> {
  const rows = await prisma.$queryRaw<Array<ChurchProfileScope>>(Prisma.sql`
    SELECT id, visibility
    FROM church_profiles
    WHERE id = ${churchId}
    LIMIT 1
  `);
  return rows[0] || null;
}

export async function getConferenceChurchRole(
  userId: string,
  churchId: string,
): Promise<ChurchWorkspaceRole | null> {
  const resolved = await resolveChurchWorkspaceAccess(userId, churchId);
  return resolved.access?.role || null;
}

export async function canViewChurchConferences(userId: string | null | undefined, churchId: string) {
  const church = await getChurchProfileScope(churchId);
  if (!church) return { exists: false, allowed: false, visibility: null as string | null, role: null as ChurchWorkspaceRole | null };

  if (church.visibility === 'PUBLIC') {
    if (!userId) return { exists: true, allowed: true, visibility: church.visibility, role: null as ChurchWorkspaceRole | null };
    const role = await getConferenceChurchRole(userId, churchId);
    return { exists: true, allowed: true, visibility: church.visibility, role };
  }

  if (!userId) return { exists: true, allowed: false, visibility: church.visibility, role: null as ChurchWorkspaceRole | null };
  const role = await getConferenceChurchRole(userId, churchId);
  return { exists: true, allowed: Boolean(role), visibility: church.visibility, role };
}

export async function canManageConference(
  userId: string,
  scope: ConferenceTenantScope,
  destructive = false,
) {
  if (!scope.churchProfileId) {
    return { allowed: false, legacy: true, role: null as ChurchWorkspaceRole | null };
  }

  const role = await getConferenceChurchRole(userId, scope.churchProfileId);
  const allowed = role
    ? destructive
      ? canAdminChurchWorkspace(role)
      : canWriteChurchOps(role)
    : false;

  return { allowed, legacy: false, role };
}

export function conferenceTenantMigrationRequired(error: unknown) {
  const message = String((error as any)?.message || error || '');
  return message.includes('church_profile_id') || message.includes('Conference_church_profile_id_fkey');
}
