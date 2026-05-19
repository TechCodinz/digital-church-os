import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PoolSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(1500).optional(),
  poolType: z.enum(['GENERAL', 'CONFERENCE', 'WORKER_APPRECIATION', 'TRANSPORT', 'FOOD', 'DATA', 'LEARNING']).default('GENERAL'),
  amountTotal: z.coerce.number().min(0).max(10000000).default(0),
  currency: z.string().trim().toUpperCase().default('USD'),
  conferenceId: z.string().trim().optional(),
  liveServiceId: z.string().trim().optional(),
});

const AwardSchema = z.object({
  giftPoolId: z.string().trim().optional(),
  recipientId: z.string().trim().min(3),
  awardType: z.string().trim().min(2).max(80),
  amount: z.coerce.number().min(0).max(1000000).default(0),
  currency: z.string().trim().toUpperCase().default('USD'),
  reason: z.string().trim().min(3).max(1000),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const body = await req.json();
  const action = body.action || 'pool';

  if (action === 'award') {
    const parsed = AwardSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid gift award payload', details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO gift_awards (gift_pool_id, recipient_id, awarded_by, award_type, amount, currency, status, reason)
      VALUES (${d.giftPoolId || null}, ${d.recipientId}, ${session.user.id}, ${d.awardType}, ${d.amount}, ${d.currency}, 'APPROVED', ${d.reason})
      RETURNING *
    `);
    if (d.giftPoolId && d.amount > 0) {
      await prisma.$executeRaw(Prisma.sql`UPDATE gift_pools SET amount_available = GREATEST(0, amount_available - ${d.amount}) WHERE id = ${d.giftPoolId}`);
    }
    return NextResponse.json({ award: rows[0] }, { status: 201 });
  }

  const parsed = PoolSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid gift pool payload', details: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;
  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO gift_pools (title, description, pool_type, amount_total, amount_available, currency, sponsor_id, conference_id, live_service_id, active)
    VALUES (${d.title}, ${d.description || null}, ${d.poolType}, ${d.amountTotal}, ${d.amountTotal}, ${d.currency}, ${session.user.id}, ${d.conferenceId || null}, ${d.liveServiceId || null}, true)
    RETURNING *
  `);
  return NextResponse.json({ pool: rows[0] }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get('active') !== 'false';
  const pools = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT * FROM gift_pools WHERE (${activeOnly} = false OR active = true) ORDER BY created_at DESC LIMIT 100
  `);
  const session = await getServerSession(authOptions);
  const awards = session?.user?.role === 'CHURCH_ADMIN'
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT ga.*, u.name, u.email FROM gift_awards ga JOIN "User" u ON u.id = ga.recipient_id ORDER BY ga.created_at DESC LIMIT 100`)
    : session?.user?.id
      ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM gift_awards WHERE recipient_id = ${session.user.id} ORDER BY created_at DESC LIMIT 100`)
      : [];
  return NextResponse.json({ pools, awards });
}
