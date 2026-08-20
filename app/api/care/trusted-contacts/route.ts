import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';
import { getClientKey, rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit';

const TrustedContactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  relationship: z.string().trim().max(80).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(40).optional(),
  country: z.string().trim().max(80).optional(),
  preferred: z.boolean().default(false),
  canNotifyInUrgentCare: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = rateLimit(`trusted-contact:${session.user.id}:${getClientKey(req.headers)}`, { limit: 12, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) return NextResponse.json({ error: 'Too many trusted contact updates. Please wait before trying again.' }, { status: 429, headers: rateLimitHeaders(limit) });

  try {
    const parsed = TrustedContactSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid trusted contact payload', details: parsed.error.flatten() }, { status: 400, headers: rateLimitHeaders(limit) });
    const data = parsed.data;

    if (data.preferred) {
      await prisma.$executeRaw(Prisma.sql`UPDATE trusted_contacts SET preferred = false WHERE user_id = ${session.user.id}`);
    }

    const rows = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
      INSERT INTO trusted_contacts (user_id, name, relationship, email, phone, country, preferred, can_notify_in_urgent_care)
      VALUES (${session.user.id}, ${data.name}, ${data.relationship || null}, ${data.email || null}, ${data.phone || null}, ${data.country || null}, ${data.preferred}, ${data.canNotifyInUrgentCare})
      RETURNING id, name, relationship, email, phone, country, preferred, can_notify_in_urgent_care, created_at, updated_at
    `);

    await AuditLogger.log({ actorId: session.user.id, action: 'TRUSTED_CONTACT_CREATED', entityType: 'trusted_contacts', entityId: rows[0].id, req });
    return NextResponse.json({ contact: rows[0] }, { status: 201, headers: rateLimitHeaders(limit) });
  } catch (error) {
    console.error('Trusted contact creation failed:', error);
    return NextResponse.json({ error: 'Failed to save trusted contact' }, { status: 500, headers: rateLimitHeaders(limit) });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contacts = await prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`
    SELECT id, name, relationship, email, phone, country, preferred, can_notify_in_urgent_care, created_at, updated_at
    FROM trusted_contacts
    WHERE user_id = ${session.user.id}
    ORDER BY preferred DESC, created_at DESC
  `);

  return NextResponse.json({ contacts });
}
