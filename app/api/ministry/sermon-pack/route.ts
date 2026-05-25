import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSermonContentPack } from '@/lib/ministry-os/sermonToEverything';
import { getClientKey, rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit';
import { AuditLogger } from '@/lib/audit/logger';

const SermonPackSchema = z.object({
  theme: z.string().trim().min(3).max(180),
  scriptureRefs: z.array(z.string().trim().min(2).max(80)).max(12).optional(),
  audience: z.enum(['general', 'children', 'youth', 'leaders']).optional().default('general'),
  save: z.boolean().optional().default(true),
  sermonId: z.string().trim().optional(),
});

function buildSlides(pack: ReturnType<typeof generateSermonContentPack>) {
  return [
    { type: 'title', title: pack.theme, subtitle: pack.scriptureRefs.join(', ') },
    ...pack.sermonOutline.slice(0, 5).map((point, index) => ({ type: 'point', title: `Point ${index + 1}`, body: point })),
    { type: 'children', title: "Children's Lesson", bullets: pack.childrenLesson },
    { type: 'youth', title: 'Youth Discussion', bullets: pack.youthDiscussion },
    { type: 'prayer', title: 'Prayer Points', bullets: pack.prayerPoints },
    { type: 'next-steps', title: 'Follow-up Devotional Plan', bullets: pack.devotionalPlan.map((d) => `${d.day}: ${d.focus} — ${d.action}`) },
  ];
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = rateLimit(`sermon-pack:${session.user.id}:${getClientKey(req.headers)}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many sermon pack generations. Please wait before trying again.' }, { status: 429, headers: rateLimitHeaders(limit) });
  }

  try {
    const parsed = SermonPackSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid sermon pack payload', details: parsed.error.flatten() }, { status: 400, headers: rateLimitHeaders(limit) });
    }

    const pack = generateSermonContentPack(parsed.data);
    const slides = buildSlides(pack);
    let savedPack: Record<string, any> | null = null;
    let bibleStudyGuide: Record<string, any> | null = null;
    let slideDeck: Record<string, any> | null = null;

    if (parsed.data.save) {
      const savedRows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO sermon_content_packs (created_by, sermon_id, theme, scripture_refs, pack, status)
        VALUES (${session.user.id}, ${parsed.data.sermonId || null}, ${pack.theme}, ${pack.scriptureRefs}, ${JSON.stringify(pack)}::jsonb, 'DRAFT')
        RETURNING id, theme, scripture_refs, status, created_at
      `);
      savedPack = savedRows[0];

      const guideRows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO bible_study_guides (sermon_id, created_by, title, theme, scripture_refs, discussion_questions, leader_notes, participant_notes)
        VALUES (${parsed.data.sermonId || null}, ${session.user.id}, ${`${pack.theme} Bible Study Guide`}, ${pack.theme}, ${pack.scriptureRefs}, ${pack.youthDiscussion}, ${'Use this guide for midweek groups, youth, or leader-led discussion.'}, ${'Read the scriptures, answer honestly, and write one practical step.'})
        RETURNING id, title, theme, scripture_refs, created_at
      `);
      bibleStudyGuide = guideRows[0];

      const slideRows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO sermon_slide_decks (sermon_id, created_by, title, slides)
        VALUES (${parsed.data.sermonId || null}, ${session.user.id}, ${`${pack.theme} Slide Deck`}, ${JSON.stringify(slides)}::jsonb)
        RETURNING id, title, slides, created_at
      `);
      slideDeck = slideRows[0];
    }

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'SERMON_CONTENT_PACK_GENERATED',
      entityType: 'sermon_content_packs',
      entityId: savedPack?.id,
      metadata: { theme: pack.theme, scriptureRefs: pack.scriptureRefs, audience: parsed.data.audience, saved: parsed.data.save },
      req,
    });

    return NextResponse.json({ pack, slides, savedPack, bibleStudyGuide, slideDeck, generatedAt: new Date().toISOString() }, { headers: rateLimitHeaders(limit) });
  } catch (error) {
    console.error('Sermon pack generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate sermon content pack' }, { status: 500, headers: rateLimitHeaders(limit) });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const packs = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, theme, scripture_refs, status, created_at, updated_at
    FROM sermon_content_packs
    WHERE created_by = ${session.user.id}
    ORDER BY created_at DESC
    LIMIT 50
  `);

  return NextResponse.json({ packs });
}
