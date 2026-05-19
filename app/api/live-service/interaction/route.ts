import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const InteractionSchema = z.object({
  liveServiceId: z.string().trim().min(3),
  type: z.enum(['SERMON_NOTE', 'PRAYER_REQUEST', 'RAISE_HAND', 'SALVATION_RESPONSE']),
  content: z.string().trim().min(2).max(3000),
  visibility: z.enum(['PRIVATE', 'PUBLIC', 'ANONYMOUS']).optional().default('PRIVATE'),
  followUpRequested: z.boolean().optional().default(false),
  contact: z.object({ name: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional() }).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = InteractionSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid live-service interaction payload', details: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;

  try {
    let record: Record<string, any> | undefined;

    if (data.type === 'SERMON_NOTE') {
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO live_sermon_notes (live_service_id, user_id, notes)
        VALUES (${data.liveServiceId}, ${session.user.id}, ${data.content})
        RETURNING id, live_service_id, user_id, notes, created_at
      `);
      record = rows[0];
    }

    if (data.type === 'PRAYER_REQUEST') {
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO live_service_prayer_requests (live_service_id, user_id, content, visibility, follow_up_requested)
        VALUES (${data.liveServiceId}, ${session.user.id}, ${data.content}, ${data.visibility}, ${data.followUpRequested})
        RETURNING id, live_service_id, user_id, content, visibility, follow_up_requested, created_at
      `);
      record = rows[0];
    }

    if (data.type === 'RAISE_HAND') {
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO raise_hand_requests (live_service_id, user_id, type, message, status)
        VALUES (${data.liveServiceId}, ${session.user.id}, 'PRAYER', ${data.content}, 'WAITING')
        RETURNING id, live_service_id, user_id, type, message, status, created_at
      `);
      record = rows[0];
    }

    if (data.type === 'SALVATION_RESPONSE') {
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO salvation_responses (live_service_id, user_id, name, email, phone, decision_type, follow_up_status)
        VALUES (${data.liveServiceId}, ${session.user.id}, ${data.contact?.name || null}, ${data.contact?.email || session.user.email || null}, ${data.contact?.phone || null}, 'SALVATION', 'PENDING')
        RETURNING id, live_service_id, user_id, name, email, phone, decision_type, follow_up_status, created_at
      `);
      record = rows[0];
    }

    await AuditLogger.log({ actorId: session.user.id, action: `LIVE_SERVICE_${data.type}`, entityType: 'live_service_interaction', entityId: record?.id, metadata: { liveServiceId: data.liveServiceId, type: data.type }, req });

    return NextResponse.json({ interaction: record }, { status: 201 });
  } catch (error) {
    console.error('Live service interaction failed:', error);
    return NextResponse.json({ error: 'Failed to save live-service interaction' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isLeader = ['CHURCH_ADMIN', 'AID_REVIEWER', 'AI_DEPARTMENT'].includes(session.user.role);
  const { searchParams } = new URL(req.url);
  const liveServiceId = searchParams.get('liveServiceId');
  if (!liveServiceId) return NextResponse.json({ error: 'liveServiceId is required' }, { status: 400 });

  const notes = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT * FROM live_sermon_notes WHERE live_service_id = ${liveServiceId} AND (${isLeader} OR user_id = ${session.user.id}) ORDER BY created_at DESC LIMIT 100
  `);
  const prayers = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT * FROM live_service_prayer_requests WHERE live_service_id = ${liveServiceId} AND (${isLeader} OR user_id = ${session.user.id} OR visibility = 'PUBLIC') ORDER BY created_at DESC LIMIT 100
  `);
  const raisedHands = isLeader ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT r.*, u.name, u.email FROM raise_hand_requests r JOIN "User" u ON u.id = r.user_id WHERE r.live_service_id = ${liveServiceId} ORDER BY r.created_at DESC LIMIT 100
  `) : [];
  const salvationResponses = isLeader ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT * FROM salvation_responses WHERE live_service_id = ${liveServiceId} ORDER BY created_at DESC LIMIT 100
  `) : [];

  return NextResponse.json({ notes, prayers, raisedHands, salvationResponses, scope: isLeader ? 'leader' : 'member' });
}
