import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const AwardSchema = z.object({
  userId: z.string().trim().optional(),
  pointsDelta: z.coerce.number().int().default(0),
  giftCreditDelta: z.coerce.number().default(0),
  sourceType: z.string().trim().min(2).max(80),
  sourceId: z.string().trim().optional(),
  description: z.string().trim().min(3).max(500),
});

async function ensureWallet(userId: string) {
  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO kingdom_wallets (user_id)
    VALUES (${userId})
    ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
    RETURNING id, user_id, points_balance, gift_credit_balance, currency, updated_at
  `);
  return rows[0];
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = AwardSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid reward payload', details: parsed.error.flatten() }, { status: 400 });

  const targetUserId = parsed.data.userId || session.user.id;
  if (targetUserId !== session.user.id && session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const wallet = await ensureWallet(targetUserId);
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO kingdom_wallet_ledger (wallet_id, user_id, entry_type, source_type, source_id, points_delta, gift_credit_delta, currency, description)
    VALUES (${wallet.id}, ${targetUserId}, 'AWARD', ${parsed.data.sourceType}, ${parsed.data.sourceId || null}, ${parsed.data.pointsDelta}, ${parsed.data.giftCreditDelta}, ${wallet.currency}, ${parsed.data.description})
  `);
  const updated = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    UPDATE kingdom_wallets
    SET points_balance = points_balance + ${parsed.data.pointsDelta}, gift_credit_balance = gift_credit_balance + ${parsed.data.giftCreditDelta}, updated_at = now()
    WHERE id = ${wallet.id}
    RETURNING id, user_id, points_balance, gift_credit_balance, currency, updated_at
  `);
  return NextResponse.json({ wallet: updated[0] });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || session.user.id;
  if (userId !== session.user.id && session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const wallet = await ensureWallet(userId);
  const ledger = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, entry_type, source_type, source_id, points_delta, gift_credit_delta, currency, description, created_at
    FROM kingdom_wallet_ledger WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 100
  `);
  return NextResponse.json({ wallet, ledger });
}
