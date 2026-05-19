import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SlideSchema = z.object({
  slideType: z.string().trim().default('text'),
  title: z.string().trim().optional(),
  body: z.string().trim().optional(),
  scriptureRef: z.string().trim().optional(),
  translationCode: z.string().trim().optional(),
  mediaUrl: z.string().url().optional(),
  style: z.record(z.any()).optional().default({}),
});

const DeckSchema = z.object({
  title: z.string().trim().min(3).max(180),
  theme: z.string().trim().max(180).optional(),
  sermonPackId: z.string().trim().optional(),
  liveServiceId: z.string().trim().optional(),
  aspectRatio: z.string().trim().default('16:9'),
  slides: z.array(SlideSchema).min(1).max(120),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = DeckSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid presentation payload', details: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const decks = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO sermon_presentation_decks (sermon_pack_id, live_service_id, created_by, title, theme, status, aspect_ratio)
    VALUES (${data.sermonPackId || null}, ${data.liveServiceId || null}, ${session.user.id}, ${data.title}, ${data.theme || null}, 'DRAFT', ${data.aspectRatio})
    RETURNING id, title, theme, status, aspect_ratio, created_at, updated_at
  `);
  const deck = decks[0];

  for (let i = 0; i < data.slides.length; i++) {
    const s = data.slides[i];
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO presentation_slides (deck_id, slide_order, slide_type, title, body, scripture_ref, translation_code, media_url, style)
      VALUES (${deck.id}, ${i + 1}, ${s.slideType}, ${s.title || null}, ${s.body || null}, ${s.scriptureRef || null}, ${s.translationCode || null}, ${s.mediaUrl || null}, ${JSON.stringify(s.style)}::jsonb)
    `);
  }

  const slides = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, slide_order, slide_type, title, body, scripture_ref, translation_code, media_url, style
    FROM presentation_slides WHERE deck_id = ${deck.id} ORDER BY slide_order ASC
  `);

  return NextResponse.json({ deck, slides }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const deckId = searchParams.get('deckId');

  if (deckId) {
    const deckRows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT id, title, theme, status, aspect_ratio, created_at, updated_at FROM sermon_presentation_decks WHERE id = ${deckId} LIMIT 1
    `);
    const slides = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT id, slide_order, slide_type, title, body, scripture_ref, translation_code, media_url, style FROM presentation_slides WHERE deck_id = ${deckId} ORDER BY slide_order ASC
    `);
    return NextResponse.json({ deck: deckRows[0] || null, slides });
  }

  const decks = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, title, theme, status, aspect_ratio, created_at, updated_at
    FROM sermon_presentation_decks WHERE created_by = ${session.user.id} ORDER BY created_at DESC LIMIT 80
  `);
  return NextResponse.json({ decks });
}
