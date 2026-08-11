import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to record an intercession.' }, { status: 401 });

  try {
    const prayer = await prisma.prayerRequest.findUnique({
      where: { id: params.id },
      select: { id: true, visibility: true, userId: true, isAnswered: true },
    });
    if (!prayer) return NextResponse.json({ error: 'Prayer request not found.' }, { status: 404 });
    if (prayer.visibility === 'PRIVATE' && prayer.userId !== session.user.id) {
      return NextResponse.json({ error: 'This prayer request is private.' }, { status: 403 });
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const existing = await prisma.intercession.findFirst({
      where: {
        userId: session.user.id,
        prayerRequestId: prayer.id,
        createdAt: { gte: start, lt: end },
      },
      select: { id: true, completedAt: true },
    });

    if (existing) {
      return NextResponse.json({
        intercessionId: existing.id,
        alreadyRecorded: true,
        answered: prayer.isAnswered,
        message: 'You already recorded prayer for this request today.',
      });
    }

    const now = new Date();
    const intercession = await prisma.intercession.create({
      data: {
        userId: session.user.id,
        prayerRequestId: prayer.id,
        scheduledFor: now,
        completedAt: now,
        notes: 'Prayer Wall intercession',
      },
      select: { id: true, completedAt: true },
    });

    return NextResponse.json({
      intercessionId: intercession.id,
      alreadyRecorded: false,
      answered: prayer.isAnswered,
      message: 'Intercession recorded privately for today.',
    }, { status: 201 });
  } catch (error) {
    console.error('Prayer intercession failed:', error);
    return NextResponse.json({ error: 'Unable to record intercession right now.' }, { status: 500 });
  }
}
