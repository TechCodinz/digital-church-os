import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CollectionSchema = z.object({
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(1000).optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).default('PRIVATE'),
});

const ItemSchema = z.object({
  collectionId: z.string().trim().min(3),
  scripturePassageId: z.string().trim().optional(),
  reference: z.string().trim().min(2).max(80),
  versionCode: z.string().trim().min(2).max(20).default('KJV'),
  note: z.string().trim().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const action = body.action || 'create-collection';

  if (action === 'add-item') {
    const parsed = ItemSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid verse item payload', details: parsed.error.flatten() }, { status: 400 });
    const owned = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT id FROM verse_collections WHERE id = ${parsed.data.collectionId} AND user_id = ${session.user.id} LIMIT 1
    `);
    if (!owned[0]) return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO verse_collection_items (collection_id, scripture_passage_id, reference, version_code, note)
      VALUES (${parsed.data.collectionId}, ${parsed.data.scripturePassageId || null}, ${parsed.data.reference}, ${parsed.data.versionCode}, ${parsed.data.note || null})
      RETURNING *
    `);
    return NextResponse.json({ item: rows[0] }, { status: 201 });
  }

  const parsed = CollectionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid collection payload', details: parsed.error.flatten() }, { status: 400 });
  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO verse_collections (user_id, title, description, visibility)
    VALUES (${session.user.id}, ${parsed.data.title}, ${parsed.data.description || null}, ${parsed.data.visibility})
    RETURNING *
  `);
  return NextResponse.json({ collection: rows[0] }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const collectionId = searchParams.get('collectionId');

  if (collectionId) {
    const collections = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT * FROM verse_collections WHERE id = ${collectionId} AND (user_id = ${session.user.id} OR visibility = 'PUBLIC') LIMIT 1
    `);
    if (!collections[0]) return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    const items = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT * FROM verse_collection_items WHERE collection_id = ${collectionId} ORDER BY created_at DESC
    `);
    return NextResponse.json({ collection: collections[0], items });
  }

  const collections = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT * FROM verse_collections WHERE user_id = ${session.user.id} OR visibility = 'PUBLIC' ORDER BY created_at DESC LIMIT 100
  `);
  return NextResponse.json({ collections });
}
