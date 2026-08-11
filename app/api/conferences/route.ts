import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma, checkDbConnection } from '@/lib/prisma';
import {
  canViewChurchConferences,
  conferenceTenantMigrationRequired,
  getConferenceChurchRole,
  getConferenceTenantScope,
  getChurchProfileScope,
  canManageConference,
} from '@/lib/church-ops/conference-access';
import { canWriteChurchOps } from '@/lib/church-ops/access';

const UrlField = z.union([z.string().url(), z.literal('')]).optional();

const ConferenceCreateSchema = z.object({
  churchId: z.string().trim().min(3),
  title: z.string().trim().min(3).max(180),
  theme: z.string().trim().min(3).max(500),
  scriptureRefs: z.array(z.string().trim().min(2).max(120)).max(30).default([]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().trim().max(300).optional(),
  virtualRoomLink: UrlField,
  replayUrl: UrlField,
  maxAttendees: z.coerce.number().int().positive().max(1000000).optional(),
});

const ConferenceUpdateSchema = ConferenceCreateSchema.omit({ churchId: true }).partial().extend({
  status: z.enum(['UPCOMING', 'LIVE', 'COMPLETED']).optional(),
});

function normalizeUrl(value?: string) {
  return value?.trim() ? value.trim() : null;
}

function migrationResponse() {
  return NextResponse.json(
    {
      error: 'Conference tenant storage is waiting for the database migration.',
      migrationRequired: true,
    },
    { status: 503 },
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = ConferenceCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid conference payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const d = parsed.data;
    const church = await getChurchProfileScope(d.churchId);
    if (!church) return NextResponse.json({ error: 'Church workspace not found' }, { status: 404 });

    const role = await getConferenceChurchRole(session.user.id, d.churchId);
    if (!role || !canWriteChurchOps(role)) {
      return NextResponse.json({ error: 'You do not have event-management access for this church.' }, { status: 403 });
    }

    const startDate = new Date(d.startDate);
    const endDate = new Date(d.endDate);
    if (endDate <= startDate) {
      return NextResponse.json({ error: 'Conference end time must be after its start time.' }, { status: 400 });
    }

    const conference = await prisma.$transaction(async (tx) => {
      const created = await tx.conference.create({
        data: {
          churchProfileId: d.churchId,
          title: d.title,
          theme: d.theme,
          scriptureRefs: d.scriptureRefs,
          startDate,
          endDate,
          location: d.location?.trim() || null,
          virtualRoomLink: normalizeUrl(d.virtualRoomLink),
          replayUrl: normalizeUrl(d.replayUrl),
          maxAttendees: d.maxAttendees,
          status: 'UPCOMING',
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'CREATE',
          entityType: 'Conference',
          entityId: created.id,
          metadata: { churchId: d.churchId, tenantRole: role },
        },
      });

      return created;
    });

    return NextResponse.json(conference, { status: 201 });
  } catch (error) {
    if (conferenceTenantMigrationRequired(error)) return migrationResponse();
    console.error('Error creating conference:', error);
    return NextResponse.json({ error: 'Failed to create conference' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get('churchId');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';

    if (status && !['UPCOMING', 'LIVE', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid conference status' }, { status: 400 });
    }

    if (!(await checkDbConnection())) {
      return NextResponse.json(
        { error: 'Conference service is temporarily unavailable.', demoData: false },
        { status: 503 },
      );
    }

    let ids: string[] = [];
    let scope: 'church' | 'legacy' = 'legacy';

    if (churchId) {
      const access = await canViewChurchConferences(session?.user?.id, churchId);
      if (!access.exists) return NextResponse.json({ error: 'Church workspace not found' }, { status: 404 });
      if (!access.allowed) return NextResponse.json({ error: 'This church event calendar is not public.' }, { status: 403 });

      const rows = await prisma.conference.findMany({
        where: { churchProfileId: churchId },
        select: { id: true },
      });
      ids = rows.map((row) => row.id);
      scope = 'church';
    } else {
      // Unscoped historical records are a product-admin quarantine only. New
      // member/public callers must choose a church explicitly; null tenancy is
      // never treated as a shadow global conference calendar.
      if (session?.user?.role !== 'CHURCH_ADMIN') {
        return NextResponse.json({ error: 'Choose a church conference calendar.' }, { status: 400 });
      }
      const rows = await prisma.conference.findMany({
        where: { churchProfileId: null },
        select: { id: true },
      });
      ids = rows.map((row) => row.id);
    }

    const where: any = { id: { in: ids } };
    if (status) where.status = status;
    if (upcoming) {
      where.startDate = { gte: new Date() };
      where.status = 'UPCOMING';
    }

    const conferences = await prisma.conference.findMany({
      where,
      include: {
        attendees: {
          select: { attended: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    const conferenceIds = conferences.map((conference) => conference.id);
    const rawRegistrationCounts = new Map<string, number>();
    let registeredIds = new Set<string>();

    if (conferenceIds.length) {
      const counts = await prisma.$queryRaw<Array<{ conferenceId: string; count: number }>>(Prisma.sql`
        SELECT conference_id AS "conferenceId", COUNT(*)::int AS count
        FROM conference_registrations
        WHERE conference_id IN (${Prisma.join(conferenceIds)})
          AND status <> 'CANCELLED'
        GROUP BY conference_id
      `);
      counts.forEach((row) => rawRegistrationCounts.set(row.conferenceId, Number(row.count || 0)));
    }

    if (session?.user?.id && conferenceIds.length) {
      const [attendance, registrations] = await Promise.all([
        prisma.conferenceAttendance.findMany({
          where: { userId: session.user.id, conferenceId: { in: conferenceIds } },
          select: { conferenceId: true },
        }),
        prisma.$queryRaw<Array<{ conferenceId: string }>>(Prisma.sql`
          SELECT conference_id AS "conferenceId"
          FROM conference_registrations
          WHERE user_id = ${session.user.id}
            AND conference_id IN (${Prisma.join(conferenceIds)})
            AND status <> 'CANCELLED'
        `),
      ]);
      registeredIds = new Set([
        ...attendance.map((row) => row.conferenceId),
        ...registrations.map((row) => row.conferenceId),
      ]);
    }

    return NextResponse.json(
      conferences.map((conference) => ({
        ...conference,
        attendeeCount: Math.max(conference.attendees.length, rawRegistrationCounts.get(conference.id) || 0),
        isRegistered: registeredIds.has(conference.id),
      })),
      { headers: { 'X-Conference-Scope': scope } },
    );
  } catch (error) {
    if (conferenceTenantMigrationRequired(error)) return migrationResponse();
    console.error('Error fetching conferences:', error);
    return NextResponse.json({ error: 'Failed to fetch conferences' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const churchId = searchParams.get('churchId');
    if (!id) return NextResponse.json({ error: 'Conference ID required' }, { status: 400 });

    const tenantScope = await getConferenceTenantScope(id);
    if (!tenantScope) return NextResponse.json({ error: 'Conference not found' }, { status: 404 });

    if (tenantScope.churchProfileId) {
      if (!churchId || churchId !== tenantScope.churchProfileId) {
        return NextResponse.json({ error: 'Explicit matching churchId is required.' }, { status: 400 });
      }
      const management = await canManageConference(session.user.id, tenantScope, false);
      if (!management.allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    } else if (session.user.role !== 'CHURCH_ADMIN') {
      return NextResponse.json({ error: 'Legacy unscoped conferences require product-admin access.' }, { status: 403 });
    }

    const parsed = ConferenceUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid conference update', details: parsed.error.flatten() }, { status: 400 });
    }

    const current = await prisma.conference.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: 'Conference not found' }, { status: 404 });

    const d = parsed.data;
    const nextStart = d.startDate ? new Date(d.startDate) : current.startDate;
    const nextEnd = d.endDate ? new Date(d.endDate) : current.endDate;
    if (nextEnd <= nextStart) {
      return NextResponse.json({ error: 'Conference end time must be after its start time.' }, { status: 400 });
    }

    const data: any = {};
    if (d.title !== undefined) data.title = d.title;
    if (d.theme !== undefined) data.theme = d.theme;
    if (d.scriptureRefs !== undefined) data.scriptureRefs = d.scriptureRefs;
    if (d.startDate !== undefined) data.startDate = nextStart;
    if (d.endDate !== undefined) data.endDate = nextEnd;
    if (d.location !== undefined) data.location = d.location?.trim() || null;
    if (d.virtualRoomLink !== undefined) data.virtualRoomLink = normalizeUrl(d.virtualRoomLink);
    if (d.replayUrl !== undefined) data.replayUrl = normalizeUrl(d.replayUrl);
    if (d.maxAttendees !== undefined) data.maxAttendees = d.maxAttendees;
    if (d.status !== undefined) data.status = d.status;

    const updated = await prisma.$transaction(async (tx) => {
      const conference = await tx.conference.update({ where: { id }, data });
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'UPDATE',
          entityType: 'Conference',
          entityId: id,
          metadata: { churchId: tenantScope.churchProfileId, legacyUnscoped: !tenantScope.churchProfileId },
        },
      });
      return conference;
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (conferenceTenantMigrationRequired(error)) return migrationResponse();
    console.error('Error updating conference:', error);
    return NextResponse.json({ error: 'Failed to update conference' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const churchId = searchParams.get('churchId');
    if (!id) return NextResponse.json({ error: 'Conference ID required' }, { status: 400 });

    const tenantScope = await getConferenceTenantScope(id);
    if (!tenantScope) return NextResponse.json({ error: 'Conference not found' }, { status: 404 });

    if (tenantScope.churchProfileId) {
      if (!churchId || churchId !== tenantScope.churchProfileId) {
        return NextResponse.json({ error: 'Explicit matching churchId is required.' }, { status: 400 });
      }
      const management = await canManageConference(session.user.id, tenantScope, true);
      if (!management.allowed) {
        return NextResponse.json({ error: 'Only church owners/admins can delete a tenant conference.' }, { status: 403 });
      }
    } else if (session.user.role !== 'CHURCH_ADMIN') {
      return NextResponse.json({ error: 'Legacy unscoped conferences require product-admin access.' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.conference.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'DELETE',
          entityType: 'Conference',
          entityId: id,
          metadata: { churchId: tenantScope.churchProfileId, legacyUnscoped: !tenantScope.churchProfileId },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (conferenceTenantMigrationRequired(error)) return migrationResponse();
    console.error('Error deleting conference:', error);
    return NextResponse.json({ error: 'Failed to delete conference' }, { status: 500 });
  }
}
