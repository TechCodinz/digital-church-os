import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

const ChurchProfileSchema = z.object({
  name: z.string().trim().min(3).max(160),
  slug: z.string().trim().min(3).max(90).regex(/^[a-z0-9-]+$/),
  denomination: z.string().trim().max(120).optional(),
  country: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  description: z.string().trim().max(2000).optional(),
  visibility: z.enum(['PUBLIC', 'NETWORK', 'PRIVATE']).default('PUBLIC'),
  metadata: z.record(z.any()).optional().default({}),
});

const ConnectionSchema = z.object({
  requesterChurchId: z.string().trim().min(3),
  receiverChurchId: z.string().trim().min(3),
  connectionType: z.enum(['PARTNER', 'GUEST_SPEAKER', 'OUTREACH', 'CONFERENCE', 'RESOURCE_SHARING']).default('PARTNER'),
  message: z.string().trim().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const action = body.action || 'create-profile';

  try {
    if (action === 'connect') {
      const parsed = ConnectionSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid connection payload', details: parsed.error.flatten() }, { status: 400 });
      const d = parsed.data;
      const ownerCheck = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT id FROM church_profiles WHERE id = ${d.requesterChurchId} AND owner_id = ${session.user.id} LIMIT 1`);
      if (!ownerCheck[0] && session.user.role !== 'CHURCH_ADMIN') return NextResponse.json({ error: 'You can only connect churches you manage.' }, { status: 403 });

      const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        INSERT INTO church_connections (requester_church_id, receiver_church_id, status, connection_type, message)
        VALUES (${d.requesterChurchId}, ${d.receiverChurchId}, 'PENDING', ${d.connectionType}, ${d.message || null})
        ON CONFLICT (requester_church_id, receiver_church_id) DO UPDATE SET message = EXCLUDED.message, connection_type = EXCLUDED.connection_type, updated_at = now()
        RETURNING *
      `);
      return NextResponse.json({ connection: rows[0] }, { status: 201 });
    }

    const parsed = ChurchProfileSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid church profile payload', details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO church_profiles (owner_id, name, slug, denomination, country, city, description, visibility, metadata)
      VALUES (${session.user.id}, ${d.name}, ${d.slug}, ${d.denomination || null}, ${d.country || null}, ${d.city || null}, ${d.description || null}, ${d.visibility}, ${JSON.stringify(d.metadata)}::jsonb)
      RETURNING *
    `);
    await AuditLogger.log({ actorId: session.user.id, action: 'CHURCH_PROFILE_CREATED', entityType: 'church_profiles', entityId: rows[0].id, metadata: { slug: d.slug }, req });
    return NextResponse.json({ church: rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Church network operation failed:', error);
    return NextResponse.json({ error: 'Failed to process church network request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get('mine') === 'true';
  const country = searchParams.get('country');
  const session = await getServerSession(authOptions);

  if (mine && !session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const churches = mine
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT * FROM church_profiles WHERE owner_id = ${session!.user.id} ORDER BY created_at DESC LIMIT 100`)
    : await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT id, name, slug, denomination, country, city, description, verified, visibility, created_at
        FROM church_profiles
        WHERE visibility = 'PUBLIC' AND (${country || null}::text IS NULL OR country = ${country || null})
        ORDER BY verified DESC, created_at DESC
        LIMIT 150
      `);

  const connections = session?.user?.id
    ? await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
        SELECT cc.* FROM church_connections cc
        JOIN church_profiles cp ON cp.id = cc.requester_church_id OR cp.id = cc.receiver_church_id
        WHERE cp.owner_id = ${session.user.id}
        ORDER BY cc.created_at DESC
        LIMIT 100
      `)
    : [];

  return NextResponse.json({ churches, connections });
}
