import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PlaybackSchema = z.object({
  mediaItemId: z.string().trim().optional(),
  playlistId: z.string().trim().optional(),
  roomId: z.string().trim().optional(),
  listenedSeconds: z.coerce.number().int().min(0).max(86400).default(0),
  watchedSeconds: z.coerce.number().int().min(0).max(86400).default(0),
  completionPercent: z.coerce.number().min(0).max(100).default(0),
  context: z.enum(['PERSONAL', 'BROADCAST', 'PRAYER_ROOM', 'SERVICE', 'CONFERENCE', 'FAMILY']).default('PERSONAL'),
  metadata: z.record(z.any()).optional().default({}),
});

function calculateReward(d: z.infer<typeof PlaybackSchema>) {
  const seconds = Math.max(d.listenedSeconds, d.watchedSeconds);
  const base = Math.min(40, Math.floor(seconds / 300) * 5);
  const completionBonus = d.completionPercent >= 90 ? 10 : d.completionPercent >= 60 ? 5 : 0;
  return Math.max(0, base + completionBonus);
}

async function ensureWallet(userId: string) {
  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO kingdom_wallets (user_id)
    VALUES (${userId})
    ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
    RETURNING id, user_id, currency
  `);
  return rows[0];
}

async function award(userId: string, points: number, sourceId: string | null, description: string) {
  if (points <= 0) return;
  const wallet = await ensureWallet(userId);
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO kingdom_wallet_ledger (wallet_id, user_id, entry_type, source_type, source_id, points_delta, currency, description)
    VALUES (${wallet.id}, ${userId}, 'WORSHIP_REWARD', 'worship_playback', ${sourceId}, ${points}, ${wallet.currency}, ${description})
  `);
  await prisma.$executeRaw(Prisma.sql`
    UPDATE kingdom_wallets SET points_balance = points_balance + ${points}, updated_at = now() WHERE id = ${wallet.id}
  `);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = PlaybackSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid playback payload', details: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;
  if (!d.mediaItemId && !d.playlistId) return NextResponse.json({ error: 'mediaItemId or playlistId is required' }, { status: 400 });

  try {
    const rewardPoints = calculateReward(d);
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO worship_playback_sessions (
        user_id, media_item_id, playlist_id, room_id, completed_at, listened_seconds, watched_seconds, completion_percent, reward_points_awarded, context, metadata
      ) VALUES (
        ${session.user.id}, ${d.mediaItemId || null}, ${d.playlistId || null}, ${d.roomId || null}, ${d.completionPercent >= 90 ? new Date() : null}, ${d.listenedSeconds}, ${d.watchedSeconds}, ${d.completionPercent}, ${rewardPoints}, ${d.context}, ${JSON.stringify(d.metadata)}::jsonb
      ) RETURNING *
    `);

    if (rewardPoints > 0) {
      await award(session.user.id, rewardPoints, rows[0].id, d.playlistId ? 'Worship playlist completion reward' : 'Worship media playback reward');
    }

    if (d.playlistId && d.completionPercent >= 90) {
      const existing = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT * FROM worship_sequence_rewards
        WHERE user_id = ${session.user.id} AND playlist_id = ${d.playlistId} AND status = 'IN_PROGRESS'
        ORDER BY created_at DESC LIMIT 1
      `);
      if (existing[0]) {
        const completedItems = Number(existing[0].completed_items || 0) + 1;
        const status = completedItems >= Number(existing[0].required_items || 3) ? 'COMPLETED' : 'IN_PROGRESS';
        const bonus = status === 'COMPLETED' ? 25 : 0;
        await prisma.$executeRaw(Prisma.sql`
          UPDATE worship_sequence_rewards
          SET completed_items = ${completedItems}, points_awarded = points_awarded + ${bonus}, status = ${status}, completed_at = CASE WHEN ${status} = 'COMPLETED' THEN now() ELSE completed_at END
          WHERE id = ${existing[0].id}
        `);
        if (bonus > 0) await award(session.user.id, bonus, existing[0].id, 'Completed worship listening sequence');
      } else {
        await prisma.$executeRaw(Prisma.sql`
          INSERT INTO worship_sequence_rewards (user_id, playlist_id, room_id, sequence_type, required_items, completed_items, points_awarded, status)
          VALUES (${session.user.id}, ${d.playlistId}, ${d.roomId || null}, 'LISTENING_SEQUENCE', 3, 1, 0, 'IN_PROGRESS')
        `);
      }
    }

    return NextResponse.json({ playback: rows[0], rewardPoints }, { status: 201 });
  } catch (error) {
    console.error('Worship playback failed:', error);
    return NextResponse.json({ error: 'Failed to save worship playback' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get('playlistId');

  const sessions = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT wps.*, wmi.title AS media_title, wp.title AS playlist_title
    FROM worship_playback_sessions wps
    LEFT JOIN worship_media_items wmi ON wmi.id = wps.media_item_id
    LEFT JOIN worship_playlists wp ON wp.id = wps.playlist_id
    WHERE wps.user_id = ${session.user.id} AND (${playlistId || null}::text IS NULL OR wps.playlist_id = ${playlistId || null})
    ORDER BY wps.started_at DESC LIMIT 100
  `);
  const sequences = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT * FROM worship_sequence_rewards WHERE user_id = ${session.user.id} ORDER BY created_at DESC LIMIT 50
  `);
  return NextResponse.json({ sessions, sequences });
}
