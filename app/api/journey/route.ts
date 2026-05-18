import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [prayers, journalEntries, offerings, aiInteractions, activities, badges, children, goals] = await Promise.all([
      prisma.prayerRequest.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, title: true, visibility: true, isAnswered: true, createdAt: true } }),
      prisma.journalEntry.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, title: true, mood: true, createdAt: true } }),
      prisma.offering.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, amount: true, currency: true, purpose: true, status: true, createdAt: true } }),
      prisma.aIInteraction.count({ where: { userId: session.user.id } }),
      prisma.userActivity.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 15, select: { id: true, type: true, content: true, points: true, createdAt: true } }),
      prisma.userBadge.count({ where: { userId: session.user.id } }),
      prisma.childProfile.count({ where: { parentId: session.user.id } }),
      prisma.goal.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, title: true, isAchieved: true, targetDate: true, createdAt: true } }),
    ]);

    const spiritualScore = Math.min(100, 20 + prayers.length * 4 + journalEntries.length * 3 + offerings.length * 2 + aiInteractions + activities.length + badges * 5 + children * 3);

    return NextResponse.json({
      spiritualScore,
      timeline: [...prayers.map((p) => ({ type: 'Prayer', title: p.title, date: p.createdAt, meta: p.visibility })), ...journalEntries.map((j) => ({ type: 'Journal', title: j.title, date: j.createdAt, meta: j.mood || 'Reflection' })), ...offerings.map((o) => ({ type: 'Offering', title: `${o.purpose} ${o.amount} ${o.currency}`, date: o.createdAt, meta: o.status }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20),
      prayers,
      journalEntries,
      offerings,
      activities,
      goals,
      metrics: { prayers: prayers.length, journalEntries: journalEntries.length, offerings: offerings.length, aiInteractions, badges, children, goals: goals.length },
    });
  } catch (error) {
    console.error('Journey fetch failed:', error);
    return NextResponse.json({ error: 'Failed to load journey' }, { status: 500 });
  }
}
