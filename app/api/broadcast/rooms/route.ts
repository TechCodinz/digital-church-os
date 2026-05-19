import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const RoomSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().max(2000).optional(),
  gatheringType: z.enum(['DEVOTION', 'PRAYER', 'BIBLE_STUDY', 'WORSHIP', 'CONFERENCE', 'SMALL_GROUP', 'PRIVATE_EVENT', 'PUBLIC_EVENT']).default('DEVOTION'),
  visibility: z.enum(['PRIVATE', 'INVITE_ONLY', 'PUBLIC', 'CHURCH_ONLY']).default('PRIVATE'),
  startsAt: z.string().datetime().optional(),
  streamProvider: z.string().trim().max(80).default('internal'),
  streamUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  allowComments: z.boolean().default(true),
  allowReactions: z.boolean().default(true),
  allowGuestJoin: z.boolean().default(false),
  followUpEnabled: z.boolean().default(true),
  rewardEnabled: z.boolean().default(true),
  metadata: z.record(z.any()).optional().default({}),
});

const StatusSchema = z.object({
  roomId: z.string().trim().min(3),
  status: z.enum(['SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED']),
  playbackUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const action = body.action || 'create';

  try {
    if (action === 'status') {
      const parsed = StatusSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid broadcast status payload', details: parsed.error.flatten() }, { status: 400 });
      const d = parsed.data;
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        UPDATE live_broadcast_rooms
        SET status = ${d.status}, playback_url = COALESCE(${d.playbackUrl || null}, playback_url), ended_at = CASE WHEN ${d.status} = 'ENDED' THEN now() ELSE ended_at END, updated_at = now()
        WHERE id = ${d.roomId} AND (host_id = ${session.user.id} OR ${session.user.role === 'CHURCH_ADMIN'} = true)
        RETURNING *
      `);
      if (!rows[0]) return NextResponse.json({ error: 'Broadcast room not found or access denied' }, { status: 404 });
      await AuditLogger.log({ actorId: session.user.id, action: `BROADCAST_${d.status}`, entityType: 'live_broadcast_rooms', entityId: d.roomId, req });
      return NextResponse.json({ room: rows[0] });
    }

    const parsed = RoomSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid broadcast room payload', details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO live_broadcast_rooms (
        host_id, title, description, gathering_type, visibility, status, starts_at, stream_provider, stream_url, thumbnail_url,
        allow_comments, allow_reactions, allow_guest_join, follow_up_enabled, reward_enabled, metadata
      ) VALUES (
        ${session.user.id}, ${d.title}, ${d.description || null}, ${d.gatheringType}, ${d.visibility}, 'SCHEDULED', ${d.startsAt ? new Date(d.startsAt) : null}, ${d.streamProvider}, ${d.streamUrl || null}, ${d.thumbnailUrl || null},
        ${d.allowComments}, ${d.allowReactions}, ${d.allowGuestJoin}, ${d.followUpEnabled}, ${d.rewardEnabled}, ${JSON.stringify(d.metadata)}::jsonb
      ) RETURNING *
    `);
    await AuditLogger.log({ actorId: session.user.id, action: 'BROADCAST_ROOM_CREATED', entityType: 'live_broadcast_rooms', entityId: rows[0].id, metadata: { visibility: d.visibility, gatheringType: d.gatheringType }, req });
    return NextResponse.json({ room: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Broadcast room operation failed:', error);
    return NextResponse.json({ error: 'Failed to process broadcast room request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get('mine') === 'true';
  const status = searchParams.get('status');
  const visibility = searchParams.get('visibility');

  if (mine && !session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rooms = mine
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT r.*,
          (SELECT COUNT(*)::int FROM live_broadcast_participants p WHERE p.room_id = r.id) AS participant_count,
          (SELECT COUNT(*)::int FROM live_broadcast_comments c WHERE c.room_id = r.id AND c.status = 'VISIBLE') AS comment_count,
          (SELECT COUNT(*)::int FROM live_broadcast_reactions x WHERE x.room_id = r.id) AS reaction_count
        FROM live_broadcast_rooms r
        WHERE r.host_id = ${session!.user.id}
        ORDER BY r.created_at DESC LIMIT 100
      `)
    : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT r.*, u.name AS host_name,
          (SELECT COUNT(*)::int FROM live_broadcast_participants p WHERE p.room_id = r.id) AS participant_count,
          (SELECT COUNT(*)::int FROM live_broadcast_comments c WHERE c.room_id = r.id AND c.status = 'VISIBLE') AS comment_count,
          (SELECT COUNT(*)::int FROM live_broadcast_reactions x WHERE x.room_id = r.id) AS reaction_count
        FROM live_broadcast_rooms r
        JOIN "User" u ON u.id = r.host_id
        WHERE r.visibility = 'PUBLIC'
          AND (${status || null}::text IS NULL OR r.status = ${status || null})
          AND (${visibility || null}::text IS NULL OR r.visibility = ${visibility || null})
        ORDER BY CASE WHEN r.status = 'LIVE' THEN 0 ELSE 1 END, r.starts_at DESC NULLS LAST, r.created_at DESC
        LIMIT 150
      `);

  return NextResponse.json({ rooms });
}
