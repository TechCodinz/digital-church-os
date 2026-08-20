import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  canManageConference,
  canViewChurchConferences,
  conferenceTenantMigrationRequired,
  getConferenceTenantScope,
} from '@/lib/church-ops/conference-access';

const RegistrationSchema = z.object({
  conferenceId: z.string().trim().min(3),
  ticketId: z.string().trim().min(3).optional(),
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(40).optional(),
});

const SponsorshipSchema = z.object({
  conferenceId: z.string().trim().min(3),
  requestType: z.enum(['TICKET', 'TRANSPORT', 'FOOD', 'DATA', 'ACCOMMODATION', 'WORKER_ALLOWANCE', 'OTHER']),
  amountRequested: z.coerce.number().min(0).max(100000).default(0),
  currency: z.string().trim().toUpperCase().min(3).max(8).default('USD'),
  reason: z.string().trim().min(5).max(2000),
});

const ManagerActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('review-sponsorship'),
    conferenceId: z.string().trim().min(3),
    requestId: z.string().trim().min(3),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  }),
  z.object({
    action: z.literal('check-in-registration'),
    conferenceId: z.string().trim().min(3),
    registrationId: z.string().trim().min(3),
    checkedIn: z.boolean(),
  }),
]);

function migrationResponse() {
  return NextResponse.json(
    { error: 'Conference tenant storage is waiting for the database migration.', migrationRequired: true },
    { status: 503 },
  );
}

async function canUseConference(conferenceId: string, userId?: string | null) {
  const scope = await getConferenceTenantScope(conferenceId);
  if (!scope) return { scope: null, allowed: false, reason: 'Conference not found' };

  if (!scope.churchProfileId) {
    return {
      scope,
      allowed: false,
      reason: 'This historical conference is in legacy quarantine and no longer accepts registrations or sponsorship requests.',
    };
  }

  if (scope.status === 'COMPLETED' || scope.endDate.getTime() < Date.now()) {
    return { scope, allowed: false, reason: 'Registration and sponsorship requests are closed for this conference.' };
  }

  const visibility = await canViewChurchConferences(userId, scope.churchProfileId);
  return {
    scope,
    allowed: visibility.allowed,
    reason: visibility.allowed ? null : 'This church conference is not open to this account.',
  };
}

async function requireConferenceManager(userId: string, conferenceId: string) {
  const scope = await getConferenceTenantScope(conferenceId);
  if (!scope) return { scope: null, role: null, allowed: false, status: 404, error: 'Conference not found' };
  if (!scope.churchProfileId) {
    return { scope, role: null, allowed: false, status: 403, error: 'Legacy quarantined conferences cannot use tenant management actions.' };
  }
  const management = await canManageConference(userId, scope, false);
  return {
    scope,
    role: management.role,
    allowed: management.allowed,
    status: management.allowed ? 200 : 403,
    error: management.allowed ? null : 'You do not have management access for this conference.',
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const action = body.action || 'sponsorship-request';

    if (action === 'register') {
      const parsed = RegistrationSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid registration payload', details: parsed.error.flatten() }, { status: 400 });
      }
      if (!session?.user?.id && !parsed.data.email) {
        return NextResponse.json({ error: 'Sign in or provide an email address to register.' }, { status: 401 });
      }

      const d = parsed.data;
      const access = await canUseConference(d.conferenceId, session?.user?.id);
      if (!access.scope) return NextResponse.json({ error: access.reason }, { status: 404 });
      if (!access.allowed) return NextResponse.json({ error: access.reason }, { status: 403 });

      const registration = await prisma.$transaction(async (tx) => {
        const conferenceRows = await tx.$queryRaw<Array<{ maxAttendees: number | null }>>(Prisma.sql`
          SELECT "maxAttendees" AS "maxAttendees"
          FROM "Conference"
          WHERE id = ${d.conferenceId}
          FOR UPDATE
        `);
        if (!conferenceRows[0]) throw new Error('CONFERENCE_NOT_FOUND');

        const totalRows = await tx.$queryRaw<Array<{ count: number }>>(Prisma.sql`
          SELECT COUNT(*)::int AS count
          FROM conference_registrations
          WHERE conference_id = ${d.conferenceId}
            AND status <> 'CANCELLED'
        `);
        const totalRegistered = Number(totalRows[0]?.count || 0);
        const maxAttendees = conferenceRows[0].maxAttendees;
        if (maxAttendees && totalRegistered >= maxAttendees) throw new Error('CONFERENCE_FULL');

        const email = d.email || session?.user?.email || null;
        if (session?.user?.id) {
          const duplicate = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
            SELECT id FROM conference_registrations
            WHERE conference_id = ${d.conferenceId}
              AND user_id = ${session.user.id}
              AND status <> 'CANCELLED'
            LIMIT 1
          `);
          if (duplicate[0]) throw new Error('ALREADY_REGISTERED');
        } else if (email) {
          const duplicate = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
            SELECT id FROM conference_registrations
            WHERE conference_id = ${d.conferenceId}
              AND LOWER(email) = LOWER(${email})
              AND status <> 'CANCELLED'
            LIMIT 1
          `);
          if (duplicate[0]) throw new Error('ALREADY_REGISTERED');
        }

        if (d.ticketId) {
          const ticketRows = await tx.$queryRaw<Array<{ id: string; capacity: number | null; active: boolean }>>(Prisma.sql`
            SELECT id, capacity, active
            FROM conference_tickets
            WHERE id = ${d.ticketId}
              AND conference_id = ${d.conferenceId}
            FOR UPDATE
          `);
          const ticket = ticketRows[0];
          if (!ticket || !ticket.active) throw new Error('TICKET_UNAVAILABLE');

          if (ticket.capacity) {
            const ticketCountRows = await tx.$queryRaw<Array<{ count: number }>>(Prisma.sql`
              SELECT COUNT(*)::int AS count
              FROM conference_registrations
              WHERE conference_id = ${d.conferenceId}
                AND ticket_id = ${d.ticketId}
                AND status <> 'CANCELLED'
            `);
            if (Number(ticketCountRows[0]?.count || 0) >= ticket.capacity) throw new Error('TICKET_FULL');
          }
        }

        const rows = await tx.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
          INSERT INTO conference_registrations (conference_id, ticket_id, user_id, name, email, phone, status)
          VALUES (
            ${d.conferenceId},
            ${d.ticketId || null},
            ${session?.user?.id || null},
            ${d.name || session?.user?.name || null},
            ${email},
            ${d.phone || null},
            'REGISTERED'
          )
          RETURNING *
        `);

        if (d.ticketId) {
          await tx.$executeRaw(Prisma.sql`
            UPDATE conference_tickets
            SET sold_count = sold_count + 1
            WHERE id = ${d.ticketId}
          `);
        }

        return rows[0];
      });

      return NextResponse.json({ registration }, { status: 201 });
    }

    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = SponsorshipSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid sponsorship payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const d = parsed.data;
    const access = await canUseConference(d.conferenceId, session.user.id);
    if (!access.scope) return NextResponse.json({ error: access.reason }, { status: 404 });
    if (!access.allowed) return NextResponse.json({ error: access.reason }, { status: 403 });

    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO conference_sponsorship_requests
        (conference_id, user_id, request_type, amount_requested, currency, reason, status)
      VALUES
        (${d.conferenceId}, ${session.user.id}, ${d.requestType}, ${d.amountRequested}, ${d.currency}, ${d.reason}, 'PENDING')
      RETURNING *
    `);

    return NextResponse.json({ request: rows[0] }, { status: 201 });
  } catch (error) {
    if (conferenceTenantMigrationRequired(error)) return migrationResponse();
    const message = String((error as any)?.message || error || '');
    if (message.includes('ALREADY_REGISTERED')) return NextResponse.json({ error: 'Already registered for this conference.' }, { status: 409 });
    if (message.includes('CONFERENCE_FULL')) return NextResponse.json({ error: 'Conference capacity has been reached.' }, { status: 409 });
    if (message.includes('TICKET_FULL')) return NextResponse.json({ error: 'That ticket allocation is full.' }, { status: 409 });
    if (message.includes('TICKET_UNAVAILABLE')) return NextResponse.json({ error: 'That ticket is not available for this conference.' }, { status: 400 });
    if (message.includes('CONFERENCE_NOT_FOUND')) return NextResponse.json({ error: 'Conference not found.' }, { status: 404 });
    console.error('Conference registration/sponsorship error:', error);
    return NextResponse.json({ error: 'Conference request failed.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const conferenceId = searchParams.get('conferenceId');
    let manager = false;
    let legacyManager = false;
    let tenantRole: string | null = null;

    if (conferenceId) {
      const scope = await getConferenceTenantScope(conferenceId);
      if (!scope) return NextResponse.json({ error: 'Conference not found' }, { status: 404 });

      if (scope.churchProfileId) {
        const management = await canManageConference(session.user.id, scope, false);
        manager = management.allowed;
        tenantRole = management.role;
      } else {
        legacyManager = session.user.role === 'CHURCH_ADMIN';
      }
    }

    if (conferenceId && (manager || legacyManager)) {
      const sponsorshipAccess = legacyManager || ['OWNER', 'ADMIN', 'PASTOR'].includes(tenantRole || '');
      const sponsorshipReviewAccess = legacyManager || ['OWNER', 'ADMIN'].includes(tenantRole || '');
      const sponsorships = sponsorshipAccess
        ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
            SELECT csr.*, u.name, u.email
            FROM conference_sponsorship_requests csr
            JOIN "User" u ON u.id = csr.user_id
            WHERE csr.conference_id = ${conferenceId}
            ORDER BY csr.created_at DESC
            LIMIT 150
          `)
        : [];
      const registrations = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT *
        FROM conference_registrations
        WHERE conference_id = ${conferenceId}
        ORDER BY created_at DESC
        LIMIT 150
      `);
      return NextResponse.json({
        sponsorships,
        registrations,
        scope: manager ? 'tenant-manager' : 'legacy-admin',
        tenantRole,
        sponsorshipAccess,
        sponsorshipReviewAccess,
      });
    }

    const sponsorships = conferenceId
      ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
          SELECT * FROM conference_sponsorship_requests
          WHERE user_id = ${session.user.id} AND conference_id = ${conferenceId}
          ORDER BY created_at DESC LIMIT 100
        `)
      : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
          SELECT * FROM conference_sponsorship_requests
          WHERE user_id = ${session.user.id}
          ORDER BY created_at DESC LIMIT 100
        `);

    const registrations = conferenceId
      ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
          SELECT * FROM conference_registrations
          WHERE user_id = ${session.user.id} AND conference_id = ${conferenceId}
          ORDER BY created_at DESC LIMIT 100
        `)
      : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
          SELECT * FROM conference_registrations
          WHERE user_id = ${session.user.id}
          ORDER BY created_at DESC LIMIT 100
        `);

    return NextResponse.json({ sponsorships, registrations, scope: 'member' });
  } catch (error) {
    if (conferenceTenantMigrationRequired(error)) return migrationResponse();
    console.error('Conference sponsorship lookup error:', error);
    return NextResponse.json({ error: 'Failed to load conference requests.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = ManagerActionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid conference management action', details: parsed.error.flatten() }, { status: 400 });
    }

    const d = parsed.data;
    const management = await requireConferenceManager(session.user.id, d.conferenceId);
    if (!management.allowed) {
      return NextResponse.json({ error: management.error }, { status: management.status });
    }

    if (d.action === 'review-sponsorship') {
      if (!['OWNER', 'ADMIN'].includes(management.role || '')) {
        return NextResponse.json({ error: 'Only church owners/admins can approve or reject conference support requests.' }, { status: 403 });
      }

      const request = await prisma.$transaction(async (tx) => {
        const rows = d.status === 'PENDING'
          ? await tx.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
              UPDATE conference_sponsorship_requests
              SET status = 'PENDING', reviewed_by = NULL, reviewed_at = NULL
              WHERE id = ${d.requestId}
                AND conference_id = ${d.conferenceId}
              RETURNING *
            `)
          : await tx.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
              UPDATE conference_sponsorship_requests
              SET status = ${d.status}, reviewed_by = ${session.user.id}, reviewed_at = now()
              WHERE id = ${d.requestId}
                AND conference_id = ${d.conferenceId}
              RETURNING *
            `);

        if (!rows[0]) return null;
        await tx.auditLog.create({
          data: {
            actorId: session.user.id,
            action: 'UPDATE',
            entityType: 'ConferenceSponsorshipRequest',
            entityId: d.requestId,
            metadata: {
              conferenceId: d.conferenceId,
              reviewStatus: d.status,
              tenantRole: management.role,
            },
          },
        });
        return rows[0];
      });

      if (!request) return NextResponse.json({ error: 'Sponsorship request not found for this conference.' }, { status: 404 });
      return NextResponse.json({ request });
    }

    const registration = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        UPDATE conference_registrations
        SET checked_in_at = ${d.checkedIn ? new Date() : null}
        WHERE id = ${d.registrationId}
          AND conference_id = ${d.conferenceId}
          AND status <> 'CANCELLED'
        RETURNING *
      `);
      if (!rows[0]) return null;

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'UPDATE',
          entityType: 'ConferenceRegistration',
          entityId: d.registrationId,
          metadata: {
            conferenceId: d.conferenceId,
            checkedIn: d.checkedIn,
            tenantRole: management.role,
          },
        },
      });
      return rows[0];
    });

    if (!registration) return NextResponse.json({ error: 'Active registration not found for this conference.' }, { status: 404 });
    return NextResponse.json({ registration });
  } catch (error) {
    if (conferenceTenantMigrationRequired(error)) return migrationResponse();
    console.error('Conference management action failed:', error);
    return NextResponse.json({ error: 'Conference management action failed.' }, { status: 500 });
  }
}
