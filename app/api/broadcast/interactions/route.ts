import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const JoinSchema = z.object({
  roomId: z.string().trim().min(3),
  guestName: z.string().trim().max(120).optional(),
  guestEmail: z.string().trim().email().optional(),
  role: z.enum(['VIEWER', 'CO_HOST', 'PRAYER_LEADER', 'MODERATOR']).default('VIEWER'),
});

const CommentSchema = z.object({
  roomId: z.string().trim().min(3),
  content: z.string().trim().min(1).max(1000),
  parentId: z.string().trim().optional(),
  visibility: z.enum(['PUBLIC', 'HOST_ONLY']).default('PUBLIC'),
});

const ReactionSchema = z.object({
  roomId: z.string().trim().min(3),
  reactionType: z.enum(['LIKE', 'AMEN', 'PRAYING', 'LOVE', 'PRAISE']).default('LIKE'),
});

const FollowUpSchema = z.object({
  roomId: z.string().trim().min(3),
  guestEmail: z.string().trim().email().optional(),
  followUpType: z.enum(['PRAYER', 'CARE', 'SALVATION', 'QUESTION', 'JOIN_GROUP']).default('PRAYER'),
  message: z.string().trim().max(1500).optional(),
});

const WatchSchema = z.object({
  roomId: z.string().trim().min(3),
  watchSeconds: z.coerce.number().int().min(0).max(86400),
});

async function ensureWallet(userId: string) {
  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO kingdom_wallets (user_id)
    VALUES (${userId})
    ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
    RETURNING id, user_id, currency
  `);
  return rows[0];
}

async function awardPoints(userId: string, points: number, sourceId: string, description: string) {
  if (points <= 0) return;
  const wallet = await ensureWallet(userId);
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO kingdom_wallet_ledger (wallet_id, user_id, entry_type, source_type, source_id, points_delta, currency, description)
    VALUES (${wallet.id}, ${userId}, 'BROADCAST_REWARD', 'live_broadcast', ${sourceId}, ${points}, ${wallet.currency}, ${description})
  `);
  await prisma.$executeRaw(Prisma.sql`
    UPDATE kingdom_wallets SET points_balance = points_balance + ${points}, updated_at = now() WHERE id = ${wallet.id}
  `);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = body.action || 'join';
  const session = await getServerSession(authOptions);

  try {
    if (action === 'join') {
      const parsed = JoinSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid join payload', details: parsed.error.flatten() }, { status: 400 });
      if (!session?.user?.id && !parsed.data.guestEmail) return NextResponse.json({ error: 'Sign in or provide guest email to join.' }, { status: 401 });
      const roomRows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM live_broadcast_rooms WHERE id = ${parsed.data.roomId} LIMIT 1`);
      const room = roomRows[0];
      if (!room) return NextResponse.json({ error: 'Broadcast room not found' }, { status: 404 });
      if (room.visibility === 'PRIVATE' && room.host_id !== session?.user?.id) return NextResponse.json({ error: 'This gathering is private.' }, { status: 403 });

      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO live_broadcast_participants (room_id, user_id, guest_name, guest_email, role)
        VALUES (${parsed.data.roomId}, ${session?.user?.id || null}, ${parsed.data.guestName || null}, ${parsed.data.guestEmail || null}, ${parsed.data.role})
        ON CONFLICT (room_id, user_id) DO UPDATE SET joined_at = now(), left_at = NULL, role = EXCLUDED.role
        RETURNING *
      `);
      if (session?.user?.id && room.reward_enabled) await awardPoints(session.user.id, 5, room.id, `Joined live gathering: ${room.title}`);
      return NextResponse.json({ participant: rows[0] }, { status: 201 });
    }

    if (action === 'watch') {
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const parsed = WatchSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid watch payload', details: parsed.error.flatten() }, { status: 400 });
      const points = Math.min(30, Math.floor(parsed.data.watchSeconds / 300) * 5);
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        UPDATE live_broadcast_participants
        SET watch_seconds = GREATEST(watch_seconds, ${parsed.data.watchSeconds}), reward_points_awarded = GREATEST(reward_points_awarded, ${points})
        WHERE room_id = ${parsed.data.roomId} AND user_id = ${session.user.id}
        RETURNING *
      `);
      if (rows[0] && points > Number(rows[0].reward_points_awarded || 0)) await awardPoints(session.user.id, points, parsed.data.roomId, 'Live gathering watch reward');
      return NextResponse.json({ participant: rows[0] || null, pointsCalculated: points });
    }

    if (action === 'comment') {
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const parsed = CommentSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid comment payload', details: parsed.error.flatten() }, { status: 400 });
      const roomRows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT allow_comments, reward_enabled FROM live_broadcast_rooms WHERE id = ${parsed.data.roomId} LIMIT 1`);
      if (!roomRows[0]?.allow_comments) return NextResponse.json({ error: 'Comments are disabled for this gathering.' }, { status: 403 });
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO live_broadcast_comments (room_id, user_id, parent_id, content, visibility, status)
        VALUES (${parsed.data.roomId}, ${session.user.id}, ${parsed.data.parentId || null}, ${parsed.data.content}, ${parsed.data.visibility}, 'VISIBLE')
        RETURNING *
      `);
      if (roomRows[0].reward_enabled) await awardPoints(session.user.id, 2, parsed.data.roomId, 'Meaningful broadcast interaction');
      return NextResponse.json({ comment: rows[0] }, { status: 201 });
    }

    if (action === 'reaction') {
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const parsed = ReactionSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid reaction payload', details: parsed.error.flatten() }, { status: 400 });
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO live_broadcast_reactions (room_id, user_id, reaction_type)
        VALUES (${parsed.data.roomId}, ${session.user.id}, ${parsed.data.reactionType})
        ON CONFLICT (room_id, user_id, reaction_type) DO UPDATE SET created_at = now()
        RETURNING *
      `);
      return NextResponse.json({ reaction: rows[0] }, { status: 201 });
    }

    if (action === 'follow-up') {
      const parsed = FollowUpSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid follow-up payload', details: parsed.error.flatten() }, { status: 400 });
      if (!session?.user?.id && !parsed.data.guestEmail) return NextResponse.json({ error: 'Sign in or provide guest email for follow-up.' }, { status: 401 });
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO live_broadcast_followups (room_id, user_id, guest_email, follow_up_type, message, status)
        VALUES (${parsed.data.roomId}, ${session?.user?.id || null}, ${parsed.data.guestEmail || null}, ${parsed.data.followUpType}, ${parsed.data.message || null}, 'PENDING')
        RETURNING *
      `);
      return NextResponse.json({ followUp: rows[0] }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unsupported broadcast interaction action' }, { status: 400 });
  } catch (error) {
    console.error('Broadcast interaction failed:', error);
    return NextResponse.json({ error: 'Failed to process broadcast interaction' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  if (!roomId) return NextResponse.json({ error: 'roomId is required' }, { status: 400 });

  const [participants, comments, reactions, followups] = await Promise.all([
    prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT p.*, u.name, u.email FROM live_broadcast_participants p LEFT JOIN "User" u ON u.id = p.user_id WHERE p.room_id = ${roomId} ORDER BY p.joined_at DESC LIMIT 150`),
    prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT c.*, u.name FROM live_broadcast_comments c LEFT JOIN "User" u ON u.id = c.user_id WHERE c.room_id = ${roomId} AND c.status = 'VISIBLE' ORDER BY c.created_at DESC LIMIT 150`),
    prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT reaction_type, COUNT(*)::int AS count FROM live_broadcast_reactions WHERE room_id = ${roomId} GROUP BY reaction_type`),
    session?.user?.role === 'CHURCH_ADMIN' ? prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM live_broadcast_followups WHERE room_id = ${roomId} ORDER BY created_at DESC LIMIT 100`) : Promise.resolve([]),
  ]);

  return NextResponse.json({ participants, comments, reactions, followups });
}
