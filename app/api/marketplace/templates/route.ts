import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const ProductSchema = z.object({
  title: z.string().trim().min(3).max(160),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(1500),
  price: z.coerce.number().min(0).max(10000).default(0),
  currency: z.string().trim().toUpperCase().default('USD'),
  content: z.record(z.any()).optional().default({}),
  publish: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = ProductSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid marketplace product payload', details: parsed.error.flatten() }, { status: 400 });

  try {
    const data = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO marketplace_products (creator_id, title, category, description, price, currency, status, content, published_at)
      VALUES (${session.user.id}, ${data.title}, ${data.category}, ${data.description}, ${data.price}, ${data.currency}, ${data.publish ? 'PUBLISHED' : 'DRAFT'}, ${JSON.stringify(data.content)}::jsonb, ${data.publish ? new Date() : null})
      RETURNING id, creator_id, title, category, description, price, currency, status, commission_rate, published_at, created_at
    `);

    await AuditLogger.log({ actorId: session.user.id, action: 'MARKETPLACE_PRODUCT_CREATED', entityType: 'marketplace_products', entityId: rows[0].id, metadata: { category: data.category, price: data.price }, req });
    return NextResponse.json({ product: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Marketplace product creation failed:', error);
    return NextResponse.json({ error: 'Failed to create marketplace product' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get('mine') === 'true';
  const category = searchParams.get('category');

  if (mine && !session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const products = mine
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT id, title, category, description, price, currency, status, commission_rate, published_at, created_at
        FROM marketplace_products
        WHERE creator_id = ${session!.user.id}
        ORDER BY created_at DESC
        LIMIT 100
      `)
    : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT mp.id, mp.title, mp.category, mp.description, mp.price, mp.currency, mp.status, mp.commission_rate, mp.published_at, mp.created_at, u.name AS creator_name
        FROM marketplace_products mp
        LEFT JOIN "User" u ON u.id = mp.creator_id
        WHERE mp.status = 'PUBLISHED' AND (${category || null}::text IS NULL OR mp.category = ${category || null})
        ORDER BY mp.published_at DESC NULLS LAST, mp.created_at DESC
        LIMIT 100
      `);

  return NextResponse.json({ products, model: 'creator-marketplace-production-foundation' });
}
