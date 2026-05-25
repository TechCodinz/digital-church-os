import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const LiveServiceSchema = z.object({
  title: z.string().trim().min(3).max(180),
  theme: z.string().trim().max(180).optional(),
  conferenceId: z.string().trim().optional(),
  sermonId: z.string().trim().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  streamUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'CHURCH_ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const parsed = LiveServiceSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid live service payload', details: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;

    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO live_services (title, theme, conference_id, sermon_id, status, starts_at, ends_at, stream_url, created_by)
      VALUES (${data.title}, ${data.theme || null}, ${data.conferenceId || null}, ${data.sermonId || null}, 'SCHEDULED', ${new Date(data.startsAt)}, ${data.endsAt ? new Date(data.endsAt) : null}, ${data.streamUrl || null}, ${session.user.id})
      RETURNING id, title, theme, status, starts_at, ends_at, stream_url, replay_url, created_at
    `);

    await AuditLogger.log({ actorId: session.user.id, action: 'LIVE_SERVICE_CREATED', entityType: 'live_services', entityId: rows[0].id, metadata: { title: data.title }, req });

    return NextResponse.json({ service: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Live service creation failed:', error);
    return NextResponse.json({ error: 'Failed to create live service' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || null;

  const services = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT ls.*,
      (SELECT COUNT(*)::int FROM live_service_attendance a WHERE a.live_service_id = ls.id) AS attendance_count,
      (SELECT COUNT(*)::int FROM live_service_prayer_requests p WHERE p.live_service_id = ls.id) AS prayer_count,
      (SELECT COUNT(*)::int FROM raise_hand_requests r WHERE r.live_service_id = ls.id AND r.status = 'WAITING') AS waiting_prayer_count
    FROM live_services ls
    WHERE (${status}::text IS NULL OR ls.status = ${status})
    ORDER BY ls.starts_at DESC
    LIMIT 100
  `);

  return NextResponse.json({ services });
}
