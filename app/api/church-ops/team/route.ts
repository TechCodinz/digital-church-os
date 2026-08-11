import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';
import { canAdminChurchWorkspace, resolveChurchWorkspaceAccess } from '@/lib/church-ops/access';

const InviteSchema = z.object({
  churchId: z.string().trim().min(3).optional(),
  email: z.string().trim().email().max(320),
  role: z.enum(['ADMIN', 'PASTOR', 'STAFF', 'VIEWER']).default('VIEWER'),
});

const RevokeSchema = z.object({
  churchId: z.string().trim().min(3).optional(),
  invitationId: z.string().trim().min(3),
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function workspaceError(requiresSelection: boolean) {
  return NextResponse.json(
    requiresSelection
      ? { error: 'Select a church workspace first.', code: 'CHURCH_SELECTION_REQUIRED' }
      : { error: 'No accessible church workspace was found.', code: 'NO_CHURCH_WORKSPACE' },
    { status: requiresSelection ? 409 : 404 }
  );
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const churchId = new URL(req.url).searchParams.get('churchId');

  try {
    const resolved = await resolveChurchWorkspaceAccess(session.user.id, churchId);
    if (!resolved.access) return workspaceError(resolved.requiresSelection);
    if (!canAdminChurchWorkspace(resolved.access.role)) {
      return NextResponse.json({ error: 'Only a church owner or admin can manage church workspace access.' }, { status: 403 });
    }

    await prisma.$executeRaw(Prisma.sql`
      UPDATE church_profile_invitations
      SET status = 'EXPIRED', updated_at = now()
      WHERE church_id = ${resolved.access.id}
        AND status = 'PENDING'
        AND expires_at <= now()
    `);

    const members = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT
        cpm.id,
        cpm.user_id,
        cpm.role,
        cpm.status,
        cpm.created_at,
        cpm.updated_at,
        u.name,
        u.email
      FROM church_profile_members cpm
      JOIN "User" u ON u.id = cpm.user_id
      WHERE cpm.church_id = ${resolved.access.id}
        AND cpm.status <> 'REMOVED'
      ORDER BY
        CASE cpm.role WHEN 'OWNER' THEN 0 WHEN 'ADMIN' THEN 1 WHEN 'PASTOR' THEN 2 WHEN 'STAFF' THEN 3 ELSE 4 END,
        COALESCE(u.name, u.email) ASC
      LIMIT 200
    `);

    const invitations = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT id, email, role, status, expires_at, created_at, updated_at
      FROM church_profile_invitations
      WHERE church_id = ${resolved.access.id}
        AND status IN ('PENDING', 'EXPIRED')
      ORDER BY created_at DESC
      LIMIT 100
    `);

    return NextResponse.json({ church: resolved.access, members, invitations });
  } catch (error: any) {
    console.error('Church team read failed:', error?.message || error);
    return NextResponse.json({ error: 'Church team management is unavailable.', migrationRequired: true }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid invitation payload.', details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const resolved = await resolveChurchWorkspaceAccess(session.user.id, parsed.data.churchId);
    if (!resolved.access) return workspaceError(resolved.requiresSelection);
    if (!canAdminChurchWorkspace(resolved.access.role)) {
      return NextResponse.json({ error: 'Only a church owner or admin can invite workspace members.' }, { status: 403 });
    }
    if (parsed.data.role === 'ADMIN' && resolved.access.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only the church owner can grant the ADMIN workspace role.' }, { status: 403 });
    }

    const email = normalizeEmail(parsed.data.email);
    const existingMember = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT cpm.id, cpm.role, cpm.status
      FROM church_profile_members cpm
      JOIN "User" u ON u.id = cpm.user_id
      WHERE cpm.church_id = ${resolved.access.id}
        AND lower(u.email) = ${email}
        AND cpm.status = 'ACTIVE'
      LIMIT 1
    `);
    if (existingMember[0]) {
      return NextResponse.json({ error: 'That account already has active access to this church workspace.' }, { status: 409 });
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw(Prisma.sql`
        UPDATE church_profile_invitations
        SET status = 'REVOKED', revoked_at = now(), updated_at = now()
        WHERE church_id = ${resolved.access!.id}
          AND lower(email) = ${email}
          AND status = 'PENDING'
      `);

      const rows = await tx.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO church_profile_invitations (
          church_id, email, role, token_hash, status, invited_by, expires_at
        ) VALUES (
          ${resolved.access!.id},
          ${email},
          ${parsed.data.role},
          ${tokenHash},
          'PENDING',
          ${session.user.id},
          ${expiresAt},
        )
        RETURNING id, email, role, status, expires_at, created_at
      `);
      return rows[0];
    });

    const origin = process.env.NEXTAUTH_URL || req.nextUrl.origin;
    const invitationUrl = `${origin.replace(/\/$/, '')}/church-team/accept?token=${encodeURIComponent(token)}`;

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'CHURCH_TEAM_INVITATION_CREATED',
      entityType: 'church_profile_invitations',
      entityId: invitation.id,
      metadata: {
        churchId: resolved.access.id,
        role: parsed.data.role,
        emailStoredInAudit: false,
        tokenStoredInAudit: false,
        expiresAt: invitation.expires_at,
      },
      req,
    });

    return NextResponse.json({
      church: resolved.access,
      invitation,
      invitationUrl,
      delivery: 'copy-link',
      note: 'The invitation grants no access until the matching signed-in email accepts it.',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Church team invitation failed:', error?.message || error);
    return NextResponse.json({ error: 'Church team invitation is unavailable.', migrationRequired: true }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const parsed = RevokeSchema.safeParse({
    churchId: searchParams.get('churchId') || undefined,
    invitationId: searchParams.get('invitationId'),
  });
  if (!parsed.success) return NextResponse.json({ error: 'Invalid invitation revoke request.' }, { status: 400 });

  try {
    const resolved = await resolveChurchWorkspaceAccess(session.user.id, parsed.data.churchId);
    if (!resolved.access) return workspaceError(resolved.requiresSelection);
    if (!canAdminChurchWorkspace(resolved.access.role)) {
      return NextResponse.json({ error: 'Only a church owner or admin can revoke invitations.' }, { status: 403 });
    }

    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      UPDATE church_profile_invitations
      SET status = 'REVOKED', revoked_at = now(), updated_at = now()
      WHERE id = ${parsed.data.invitationId}
        AND church_id = ${resolved.access.id}
        AND status = 'PENDING'
      RETURNING id
    `);
    if (!rows[0]) return NextResponse.json({ error: 'Pending invitation not found.' }, { status: 404 });

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'CHURCH_TEAM_INVITATION_REVOKED',
      entityType: 'church_profile_invitations',
      entityId: rows[0].id,
      metadata: { churchId: resolved.access.id },
      req,
    });

    return NextResponse.json({ success: true, revoked: true });
  } catch (error: any) {
    console.error('Church invitation revoke failed:', error?.message || error);
    return NextResponse.json({ error: 'Church team invitation is unavailable.', migrationRequired: true }, { status: 503 });
  }
}
