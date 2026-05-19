import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const StatementSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  currency: z.string().trim().toUpperCase().default('USD'),
  userId: z.string().trim().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = StatementSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid statement payload', details: parsed.error.flatten() }, { status: 400 });

  const targetUserId = parsed.data.userId || session.user.id;
  if (targetUserId !== session.user.id && session.user.role !== 'CHURCH_ADMIN') {
    return NextResponse.json({ error: 'Admin access required to generate another member statement' }, { status: 403 });
  }

  try {
    const start = new Date(`${parsed.data.year}-01-01T00:00:00.000Z`);
    const end = new Date(`${parsed.data.year + 1}-01-01T00:00:00.000Z`);
    const totals = await prisma.offering.aggregate({
      where: { userId: targetUserId, currency: parsed.data.currency, status: { in: ['SUCCEEDED', 'COMPLETED', 'PAID'] }, createdAt: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    const total = Number(totals._sum.amount || 0);

    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO giving_statements (user_id, year, total_amount, currency, status)
      VALUES (${targetUserId}, ${parsed.data.year}, ${total}, ${parsed.data.currency}, 'GENERATED')
      ON CONFLICT (user_id, year, currency)
      DO UPDATE SET total_amount = EXCLUDED.total_amount, status = 'GENERATED', generated_at = now()
      RETURNING id, user_id, year, total_amount, currency, pdf_url, status, generated_at
    `);

    await AuditLogger.log({ actorId: session.user.id, action: 'GIVING_STATEMENT_GENERATED', entityType: 'giving_statements', entityId: rows[0].id, metadata: { targetUserId, year: parsed.data.year, total }, req });
    return NextResponse.json({ statement: rows[0] });
  } catch (error) {
    console.error('Giving statement generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate giving statement' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || session.user.id;
  if (userId !== session.user.id && session.user.role !== 'CHURCH_ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const statements = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, user_id, year, total_amount, currency, pdf_url, status, generated_at
    FROM giving_statements
    WHERE user_id = ${userId}
    ORDER BY year DESC, generated_at DESC
  `);

  const receipts = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, offering_id, receipt_number, amount, currency, issued_at, pdf_url, emailed_at
    FROM giving_receipts
    WHERE user_id = ${userId}
    ORDER BY issued_at DESC
    LIMIT 100
  `);

  return NextResponse.json({ statements, receipts });
}
