import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const AcceptSchema = z.object({
  token: z.string().trim().min(24).max(256),
});

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Sign in with the invited email address to accept this church workspace invitation.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = AcceptSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid invitation token.' }, { status: 400 });

  const tokenHash = hashToken(parsed.data.token);
  const sessionEmail = session.user.email.trim().toLowerCase();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const invitations = await tx.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT
          cpi.id,
          cpi.church_id,
          cpi.email,
          cpi.role,
          cpi.status,
          cpi.expires_at,
          cp.name AS church_name,
          cp.slug AS church_slug
        FROM church_profile_invitations cpi
        JOIN church_profiles cp ON cp.id = cpi.church_id
        WHERE cpi.token_hash = ${tokenHash}
        LIMIT 1
        FOR UPDATE OF cpi
      `);

      const invitation = invitations[0];
      if (!invitation) return { kind: 'NOT_FOUND' as const };
      if (invitation.status !== 'PENDING') return { kind: 'NOT_PENDING' as const, status: invitation.status };

      if (new Date(invitation.expires_at).getTime() <= Date.now()) {
        await tx.$executeRaw(Prisma.sql`
          UPDATE church_profile_invitations
          SET status = 'EXPIRED', updated_at = now()
          WHERE id = ${invitation.id}
        `);
        return { kind: 'EXPIRED' as const };
      }

      if (String(invitation.email).trim().toLowerCase() !== sessionEmail) {
        return { kind: 'EMAIL_MISMATCH' as const };
      }

      const members = await tx.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO church_profile_members (
          church_id, user_id, role, status, invited_by, created_at, updated_at
        )
        SELECT
          ${invitation.church_id},
          ${session.user.id},
          ${invitation.role},
          'ACTIVE',
          cpi.invited_by,
          now(),
          now()
        FROM church_profile_invitations cpi
        WHERE cpi.id = ${invitation.id}
        ON CONFLICT (church_id, user_id)
        DO UPDATE SET
          role = EXCLUDED.role,
          status = 'ACTIVE',
          invited_by = EXCLUDED.invited_by,
          updated_at = now()
        RETURNING id, church_id, user_id, role, status, created_at, updated_at
      `);

      await tx.$executeRaw(Prisma.sql`
        UPDATE church_profile_invitations
        SET
          status = 'ACCEPTED',
          accepted_by = ${session.user.id},
          accepted_at = now(),
          updated_at = now()
        WHERE id = ${invitation.id}
      `);

      return {
        kind: 'ACCEPTED' as const,
        invitationId: invitation.id,
        church: {
          id: invitation.church_id,
          name: invitation.church_name,
          slug: invitation.church_slug,
        },
        member: members[0],
      };
    });

    if (result.kind === 'NOT_FOUND') return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    if (result.kind === 'EXPIRED') return NextResponse.json({ error: 'This invitation has expired. Ask the church owner or admin for a new one.' }, { status: 410 });
    if (result.kind === 'EMAIL_MISMATCH') {
      return NextResponse.json({ error: 'This invitation belongs to a different email address. Sign in with the invited account.' }, { status: 403 });
    }
    if (result.kind === 'NOT_PENDING') {
      return NextResponse.json({ error: `This invitation is no longer pending (${result.status}).` }, { status: 409 });
    }

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'CHURCH_TEAM_INVITATION_ACCEPTED',
      entityType: 'church_profile_invitations',
      entityId: result.invitationId,
      metadata: {
        churchId: result.church.id,
        role: result.member?.role,
        emailStoredInAudit: false,
        tokenStoredInAudit: false,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      church: result.church,
      membership: result.member,
      message: `You now have ${result.member?.role || 'workspace'} access to ${result.church.name}.`,
    });
  } catch (error: any) {
    console.error('Church invitation acceptance failed:', error?.message || error);
    return NextResponse.json({ error: 'Church invitation acceptance is unavailable.', migrationRequired: true }, { status: 503 });
  }
}
