import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';
import { getClientKey, rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit';

const AidRequestSchema = z.object({
  category: z.enum(['MEDICAL', 'HOUSING', 'FOOD', 'EDUCATION', 'UTILITIES', 'EMERGENCY', 'OTHER']),
  title: z.string().trim().min(4).max(120).optional(),
  description: z.string().trim().min(20).max(3000),
  amount: z.coerce.number().positive().max(100000).optional(),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).default('USD'),
  urgent: z.boolean().optional().default(false),
  proofUrls: z.array(z.string().url()).max(8).optional().default([]),
});

function normalizeTitle(input: z.infer<typeof AidRequestSchema>) {
  if (input.title) return input.title;
  return input.urgent ? `Urgent ${input.category.toLowerCase()} assistance` : `${input.category.toLowerCase()} assistance request`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const key = `aid:${session.user.id}:${getClientKey(req.headers)}`;
  const limit = rateLimit(key, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  try {
    const body = await req.json();
    const parsed = AidRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parsed.error.flatten() },
        { status: 400, headers: rateLimitHeaders(limit) }
      );
    }

    const data = parsed.data;
    const request = await prisma.aidRequest.create({
      data: {
        userId: session.user.id,
        category: data.urgent ? 'EMERGENCY' : data.category,
        title: normalizeTitle(data),
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        proofUrls: data.proofUrls,
        status: data.urgent ? 'UNDER_REVIEW' : 'PENDING',
        adminNotes: data.urgent ? 'Urgent flag submitted by member.' : undefined,
      },
      select: {
        id: true,
        title: true,
        category: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
      },
    });

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'AID_REQUEST_CREATED',
      entityType: 'AidRequest',
      entityId: request.id,
      metadata: { category: request.category, urgent: data.urgent, amount: request.amount, currency: request.currency },
      req,
    });

    return NextResponse.json({ request }, { status: 201, headers: rateLimitHeaders(limit) });
  } catch (error) {
    console.error('Request creation failed:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500, headers: rateLimitHeaders(limit) });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isReviewer = ['CHURCH_ADMIN', 'AID_REVIEWER'].includes(session.user.role);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;

  const statusFilter = status
    ? z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'DISBURSED']).safeParse(status)
    : undefined;

  if (status && !statusFilter?.success) {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
  }

  const requests = await prisma.aidRequest.findMany({
    where: {
      ...(isReviewer ? {} : { userId: session.user.id }),
      ...(statusFilter?.success ? { status: statusFilter.data } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      title: true,
      category: true,
      amount: true,
      currency: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ requests });
}
