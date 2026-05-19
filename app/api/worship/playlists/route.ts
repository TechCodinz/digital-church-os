import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PlaylistSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1500).optional(),
  playlistType: z.enum(['PRAYER_ATMOSPHERE', 'PRAISE', 'WORSHIP', 'DEVOTION', 'CHILDREN', 'YOUTH', 'CONFERENCE']).default('PRAYER_ATMOSPHERE'),
  visibility: z.enum(['PRIVATE', 'CHURCH_ONLY', 'PUBLIC']).default('PRIVATE'),
  rewardSequenceEnabled: z.boolean().default(true),
  items: z.array(z.object({
    mediaItemId: z.string().trim().min(3),
    itemOrder: z.coerce.number().int().min(1).max(500),
    transitionNote: z.string().trim().max(500).optional(),
  })).max(100).optional().default([]),
});

const ItemSchema = z.object({
  playlistId: z.string().trim().min(3),
  mediaItemId: z.string().trim().min(3),
  itemOrder: z.coerce.number().int().min(1).max(500),
  transitionNote: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const action = body.action || 'create';

  try {
    if (action === 'add-item') {
      const parsed = ItemSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid playlist item payload', details: parsed.error.flatten() }, { status: 400 });
      const owned = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT id FROM worship_playlists WHERE id = ${parsed.data.playlistId} AND created_by = ${session.user.id} LIMIT 1`);
      if (!owned[0] && session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Playlist not found or access denied' }, { status: 404 });
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO worship_playlist_items (playlist_id, media_item_id, item_order, transition_note)
        VALUES (${parsed.data.playlistId}, ${parsed.data.mediaItemId}, ${parsed.data.itemOrder}, ${parsed.data.transitionNote || null})
        ON CONFLICT (playlist_id, item_order) DO UPDATE SET media_item_id = EXCLUDED.media_item_id, transition_note = EXCLUDED.transition_note
        RETURNING *
      `);
      return NextResponse.json({ item: rows[0] }, { status: 201 });
    }

    const parsed = PlaylistSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid playlist payload', details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO worship_playlists (created_by, title, description, playlist_type, visibility, reward_sequence_enabled)
      VALUES (${session.user.id}, ${d.title}, ${d.description || null}, ${d.playlistType}, ${d.visibility}, ${d.rewardSequenceEnabled})
      RETURNING *
    `);
    const playlist = rows[0];

    for (const item of d.items) {
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO worship_playlist_items (playlist_id, media_item_id, item_order, transition_note)
        VALUES (${playlist.id}, ${item.mediaItemId}, ${item.itemOrder}, ${item.transitionNote || null})
        ON CONFLICT (playlist_id, item_order) DO UPDATE SET media_item_id = EXCLUDED.media_item_id, transition_note = EXCLUDED.transition_note
      `);
    }

    return NextResponse.json({ playlist }, { status: 201 });
  } catch (error) {
    console.error('Worship playlist operation failed:', error);
    return NextResponse.json({ error: 'Failed to process worship playlist request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get('playlistId');
  const mine = searchParams.get('mine') === 'true';

  if (mine && !session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (playlistId) {
    const playlists = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT wp.*, u.name AS creator_name FROM worship_playlists wp LEFT JOIN "User" u ON u.id = wp.created_by WHERE wp.id = ${playlistId} LIMIT 1
    `);
    const items = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT wpi.*, wmi.title, wmi.artist, wmi.media_type, wmi.category, wmi.source_url, wmi.thumbnail_url, wmi.duration_seconds
      FROM worship_playlist_items wpi
      JOIN worship_media_items wmi ON wmi.id = wpi.media_item_id
      WHERE wpi.playlist_id = ${playlistId}
      ORDER BY wpi.item_order ASC
    `);
    return NextResponse.json({ playlist: playlists[0] || null, items });
  }

  const playlists = mine
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM worship_playlists WHERE created_by = ${session!.user.id} ORDER BY created_at DESC LIMIT 100`)
    : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT wp.*, u.name AS creator_name,
          (SELECT COUNT(*)::int FROM worship_playlist_items i WHERE i.playlist_id = wp.id) AS item_count
        FROM worship_playlists wp
        LEFT JOIN "User" u ON u.id = wp.created_by
        WHERE wp.visibility IN ('PUBLIC', 'CHURCH_ONLY')
        ORDER BY wp.created_at DESC LIMIT 100
      `);

  return NextResponse.json({ playlists });
}
