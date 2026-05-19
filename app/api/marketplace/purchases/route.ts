import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const PurchaseSchema = z.object({
  productId: z.string().trim().min(3),
  provider: z.enum(['stripe', 'flutterwave', 'paystack', 'crypto', 'manual']).default('manual'),
  transactionId: z.string().trim().max(180).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = PurchaseSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid purchase payload', details: parsed.error.flatten() }, { status: 400 });

  const products = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, title, price, currency, status FROM marketplace_products WHERE id = ${parsed.data.productId} AND status = 'PUBLISHED' LIMIT 1
  `);
  const product = products[0];
  if (!product) return NextResponse.json({ error: 'Product not found or not published' }, { status: 404 });

  const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    INSERT INTO marketplace_purchases (product_id, buyer_id, amount, currency, provider, transaction_id, status)
    VALUES (${product.id}, ${session.user.id}, ${product.price}, ${product.currency}, ${parsed.data.provider}, ${parsed.data.transactionId || null}, ${parsed.data.provider === 'manual' ? 'PENDING' : 'PAID'})
    RETURNING id, product_id, buyer_id, amount, currency, provider, transaction_id, status, created_at
  `);

  await AuditLogger.log({ actorId: session.user.id, action: 'MARKETPLACE_PRODUCT_PURCHASED', entityType: 'marketplace_purchases', entityId: rows[0].id, metadata: { productId: product.id, provider: parsed.data.provider }, req });

  return NextResponse.json({ purchase: rows[0], product }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get('mine') !== 'false';

  if (mine) {
    const purchases = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      SELECT p.*, mp.title, mp.category, mp.description
      FROM marketplace_purchases p
      JOIN marketplace_products mp ON mp.id = p.product_id
      WHERE p.buyer_id = ${session.user.id}
      ORDER BY p.created_at DESC
      LIMIT 100
    `);
    return NextResponse.json({ purchases });
  }

  if (session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const purchases = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT p.*, mp.title, mp.category, u.name AS buyer_name, u.email AS buyer_email
    FROM marketplace_purchases p
    JOIN marketplace_products mp ON mp.id = p.product_id
    JOIN "User" u ON u.id = p.buyer_id
    ORDER BY p.created_at DESC
    LIMIT 150
  `);
  return NextResponse.json({ purchases });
}
