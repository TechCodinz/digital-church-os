import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to update your prayer request.' }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const answered = body?.answered === true;
    const gratitude = typeof body?.gratitude === 'string' ? body.gratitude.trim().slice(0, 2400) : '';

    const prayer = await prisma.prayerRequest.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, title: true, content: true, isAnswered: true },
    });
    if (!prayer) return NextResponse.json({ error: 'Prayer request not found.' }, { status: 404 });
    if (prayer.userId !== session.user.id) return NextResponse.json({ error: 'Only the prayer owner can update answered status.' }, { status: 403 });

    const updated = await prisma.prayerRequest.update({
      where: { id: prayer.id },
      data: { isAnswered: answered, answeredAt: answered ? new Date() : null },
      select: { id: true, title: true, isAnswered: true, answeredAt: true },
    });

    if (answered && gratitude) {
      const mood = `Continuity:Prayer:answered:${prayer.id}`;
      const data = {
        title: `Prayer · Answered prayer — ${prayer.title}`.slice(0, 180),
        content: `Gratitude reflection:\n${gratitude}`,
        mood,
      };
      const existing = await prisma.journalEntry.findFirst({
        where: { userId: session.user.id, mood },
        select: { id: true },
      });
      if (existing) {
        await prisma.journalEntry.update({ where: { id: existing.id }, data });
      } else {
        await prisma.journalEntry.create({ data: { userId: session.user.id, ...data } });
      }
    }

    return NextResponse.json({
      prayer: updated,
      gratitudeSavedToJourney: answered && Boolean(gratitude),
      privacy: 'Answered status belongs to the prayer request. Gratitude reflection is private to the owner Journey when provided.',
    });
  } catch (error) {
    console.error('Answered prayer update failed:', error);
    return NextResponse.json({ error: 'Unable to update answered prayer status right now.' }, { status: 500 });
  }
}
