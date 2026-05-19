import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ImpactSummarySchema = z.object({
  period: z.string().trim().min(3).max(80),
  title: z.string().trim().min(3).max(180),
  summary: z.string().trim().min(10).max(5000),
  metrics: z.record(z.any()).optional().default({}),
  publish: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const parsed = ImpactSummarySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid impact summary payload', details: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO impact_summaries (period, title, summary, metrics, generated_by, published)
    VALUES (${d.period}, ${d.title}, ${d.summary}, ${JSON.stringify(d.metrics)}::jsonb, ${session.user.id}, ${d.publish})
    RETURNING *
  `);

  return NextResponse.json({ impactSummary: rows[0] }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'CHURCH_ADMIN';
  const { searchParams } = new URL(req.url);
  const includeDrafts = searchParams.get('drafts') === 'true' && isAdmin;

  const summaries = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT ims.*, u.name AS generated_by_name
    FROM impact_summaries ims
    LEFT JOIN "User" u ON u.id = ims.generated_by
    WHERE (${includeDrafts} = true OR ims.published = true)
    ORDER BY ims.created_at DESC
    LIMIT 100
  `);

  return NextResponse.json({ summaries, scope: includeDrafts ? 'admin' : 'public' });
}
