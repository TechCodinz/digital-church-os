import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TestimonySchema = z.object({
  title: z.string().trim().min(3).max(160),
  content: z.string().trim().min(10).max(5000),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(['audio', 'video', 'image']).optional(),
  anonymous: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = TestimonySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid testimony payload', details: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;
  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO testimonies (user_id, title, content, media_url, media_type, anonymous, status)
    VALUES (${session.user.id}, ${d.title}, ${d.content}, ${d.mediaUrl || null}, ${d.mediaType || null}, ${d.anonymous}, 'PENDING_REVIEW')
    RETURNING id, title, content, media_url, media_type, anonymous, status, created_at
  `);
  return NextResponse.json({ testimony: rows[0] }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const isReviewer = ['CHURCH_ADMIN', 'AI_DEPARTMENT'].includes(session?.user?.role || '');
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get('mine') === 'true';

  if (mine && !session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const testimonies = mine
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM testimonies WHERE user_id = ${session!.user.id} ORDER BY created_at DESC LIMIT 100`)
    : isReviewer
      ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT t.*, u.name, u.email FROM testimonies t LEFT JOIN "User" u ON u.id = t.user_id ORDER BY t.created_at DESC LIMIT 150`)
      : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT id, title, content, media_url, media_type, anonymous, approved_at, created_at FROM testimonies WHERE status = 'APPROVED' ORDER BY approved_at DESC NULLS LAST, created_at DESC LIMIT 100`);

  return NextResponse.json({ testimonies, scope: mine ? 'mine' : isReviewer ? 'reviewer' : 'public' });
}
