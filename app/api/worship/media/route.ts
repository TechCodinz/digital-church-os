import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const MediaSchema = z.object({
  title: z.string().trim().min(2).max(180),
  artist: z.string().trim().max(140).optional(),
  mediaType: z.enum(['AUDIO', 'VIDEO', 'LYRIC_VIDEO', 'INSTRUMENTAL', 'AMBIENCE']).default('AUDIO'),
  category: z.enum(['WORSHIP', 'PRAISE', 'PRAYER_ATMOSPHERE', 'MEDITATION', 'CHOIR', 'SERMON_CLIP', 'CHILDREN', 'YOUTH']).default('WORSHIP'),
  sourceUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  durationSeconds: z.coerce.number().int().min(0).max(86400).optional(),
  language: z.string().trim().max(80).default('English'),
  scriptureRefs: z.array(z.string().trim().max(80)).max(20).optional().default([]),
  moodTags: z.array(z.string().trim().max(60)).max(20).optional().default([]),
  licenseType: z.enum(['USER_UPLOADED', 'OWNED', 'LICENSED', 'PUBLIC_DOMAIN', 'CC', 'EXTERNAL_LINK']).default('USER_UPLOADED'),
  visibility: z.enum(['PRIVATE', 'CHURCH_ONLY', 'PUBLIC']).default('PRIVATE'),
  rewardEnabled: z.boolean().default(true),
});

const ReviewSchema = z.object({
  mediaItemId: z.string().trim().min(3),
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING_REVIEW']),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const action = body.action || 'create';

  try {
    if (action === 'review') {
      if (session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      const parsed = ReviewSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid media review payload', details: parsed.error.flatten() }, { status: 400 });
      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        UPDATE worship_media_items SET status = ${parsed.data.status}, updated_at = now()
        WHERE id = ${parsed.data.mediaItemId}
        RETURNING *
      `);
      return NextResponse.json({ media: rows[0] || null });
    }

    const parsed = MediaSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid worship media payload', details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO worship_media_items (
        uploaded_by, title, artist, media_type, category, source_url, thumbnail_url, duration_seconds, language,
        scripture_refs, mood_tags, license_type, visibility, status, reward_enabled
      ) VALUES (
        ${session.user.id}, ${d.title}, ${d.artist || null}, ${d.mediaType}, ${d.category}, ${d.sourceUrl}, ${d.thumbnailUrl || null}, ${d.durationSeconds || null}, ${d.language},
        ${d.scriptureRefs}, ${d.moodTags}, ${d.licenseType}, ${d.visibility}, ${session.user.role === 'CHURCH_ADMIN' ? 'APPROVED' : 'PENDING_REVIEW'}, ${d.rewardEnabled}
      ) RETURNING *
    `);
    await AuditLogger.log({ actorId: session.user.id, action: 'WORSHIP_MEDIA_UPLOADED', entityType: 'worship_media_items', entityId: rows[0].id, metadata: { mediaType: d.mediaType, category: d.category }, req });
    return NextResponse.json({ media: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Worship media operation failed:', error);
    return NextResponse.json({ error: 'Failed to process worship media request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const mediaType = searchParams.get('mediaType');
  const mine = searchParams.get('mine') === 'true';

  if (mine && !session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const media = mine
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT * FROM worship_media_items WHERE uploaded_by = ${session!.user.id} ORDER BY created_at DESC LIMIT 100
      `)
    : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT wmi.*, u.name AS uploader_name
        FROM worship_media_items wmi
        LEFT JOIN "User" u ON u.id = wmi.uploaded_by
        WHERE wmi.status = 'APPROVED'
          AND wmi.visibility IN ('PUBLIC', 'CHURCH_ONLY')
          AND (${category || null}::text IS NULL OR wmi.category = ${category || null})
          AND (${mediaType || null}::text IS NULL OR wmi.media_type = ${mediaType || null})
        ORDER BY wmi.created_at DESC
        LIMIT 150
      `);

  return NextResponse.json({ media });
}
