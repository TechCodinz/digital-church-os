import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { AuditLogger } from '@/lib/audit/logger';
import { getClientKey, rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit';

const PrayerSchema = z.object({
  title: z.string().trim().min(3).max(100),
  content: z.string().trim().min(10).max(1000),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'ANONYMOUS']).default('PRIVATE'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = rateLimit(`prayers:${session.user.id}:${getClientKey(req.headers)}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many prayer requests. Please wait before trying again.' }, { status: 429, headers: rateLimitHeaders(limit) });
  }

  try {
    const body = await req.json();
    const validation = PrayerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid prayer payload', details: validation.error.flatten() }, { status: 400, headers: rateLimitHeaders(limit) });
    }

    const prayer = await prisma.prayerRequest.create({
      data: {
        ...validation.data,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        visibility: true,
        isAnswered: true,
        createdAt: true,
      },
    });

    await AuditLogger.log({
      actorId: session.user.id,
      action: 'PRAYER_CREATED',
      entityType: 'PrayerRequest',
      entityId: prayer.id,
      metadata: { visibility: prayer.visibility },
      req,
    });

    return NextResponse.json(prayer, { status: 201, headers: rateLimitHeaders(limit) });
  } catch (error) {
    console.error('Error creating prayer:', error);
    return NextResponse.json({ error: 'Failed to create prayer' }, { status: 500, headers: rateLimitHeaders(limit) });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');
    const mine = searchParams.get('mine') === 'true';
    const isAdmin = session?.user?.role === 'CHURCH_ADMIN';

    if ((mine || requestedUserId) && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (requestedUserId && requestedUserId !== session?.user?.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const where = mine
      ? { userId: session!.user.id }
      : requestedUserId
        ? { userId: requestedUserId }
        : { visibility: 'PUBLIC' as const };

    const prayers = await prisma.prayerRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: { intercessions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const sanitized = prayers.map((prayer) => ({
      id: prayer.id,
      title: prayer.title,
      content: prayer.visibility === 'ANONYMOUS' && !mine && !isAdmin ? 'Anonymous prayer request' : prayer.content,
      visibility: prayer.visibility,
      isAnswered: prayer.isAnswered,
      answeredAt: prayer.answeredAt,
      createdAt: prayer.createdAt,
      viewerIsOwner: Boolean(session?.user?.id && prayer.userId === session.user.id),
      intercessionCount: prayer._count.intercessions,
      user: prayer.visibility === 'ANONYMOUS' && !mine && !isAdmin ? { name: 'Anonymous', avatar: null } : prayer.user,
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error('Error fetching prayers:', error);
    return NextResponse.json({ error: 'Failed to fetch prayers' }, { status: 500 });
  }
}
