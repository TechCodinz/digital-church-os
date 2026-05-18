import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';
import { getClientKey, rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit';

const EscalationSchema = z.object({
  reason: z.string().trim().min(6).max(500),
  module: z.string().trim().min(2).max(80).default('Care Team'),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRISIS']).default('MEDIUM'),
  notes: z.string().trim().max(1500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = rateLimit(`care-escalation:${session.user.id}:${getClientKey(req.headers)}`, { limit: 6, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) return NextResponse.json({ error: 'Too many care escalation requests. Please wait before trying again.' }, { status: 429, headers: rateLimitHeaders(limit) });

  try {
    const parsed = EscalationSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid escalation payload', details: parsed.error.flatten() }, { status: 400, headers: rateLimitHeaders(limit) });

    const escalation = await prisma.flagForReview.create({
      data: {
        userId: session.user.id,
        module: parsed.data.module,
        reason: `[${parsed.data.urgency}] ${parsed.data.reason}${parsed.data.notes ? ` — Notes: ${parsed.data.notes}` : ''}`,
      },
      select: { id: true, module: true, reason: true, resolved: true, timestamp: true },
    });

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'CARE_ESCALATION_CREATED',
      entityType: 'FlagForReview',
      entityId: escalation.id,
      metadata: { urgency: parsed.data.urgency, module: parsed.data.module },
      req,
    });

    return NextResponse.json({ escalation }, { status: 201, headers: rateLimitHeaders(limit) });
  } catch (error) {
    console.error('Care escalation failed:', error);
    return NextResponse.json({ error: 'Failed to create care escalation' }, { status: 500, headers: rateLimitHeaders(limit) });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isCareLeader = ['CHURCH_ADMIN', 'AID_REVIEWER', 'AI_DEPARTMENT'].includes(session.user.role);
  const select = {
    id: true,
    module: true,
    reason: true,
    resolved: true,
    timestamp: true,
    ...(isCareLeader
      ? {
          user: {
            select: { id: true, name: true, email: true },
          },
        }
      : {}),
  };

  const escalations = await prisma.flagForReview.findMany({
    where: isCareLeader ? {} : { userId: session.user.id },
    orderBy: { timestamp: 'desc' },
    take: 100,
    select,
  });

  return NextResponse.json({ escalations, scope: isCareLeader ? 'care-team' : 'member' });
}