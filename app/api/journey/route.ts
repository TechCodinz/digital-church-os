import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
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

    const [sermonNotes, milestones, careEscalations, walletRows, quizAttempts, activityCompletions] = await Promise.all([
      prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT id, title, scripture_refs, action_steps, created_at FROM sermon_notes WHERE user_id = ${session.user.id} ORDER BY created_at DESC LIMIT 10`),
      prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT id, type, title, description, achieved_at, visibility, created_at FROM discipleship_milestones WHERE user_id = ${session.user.id} ORDER BY created_at DESC LIMIT 10`),
      prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT id, title, urgency, status, created_at FROM care_escalations WHERE user_id = ${session.user.id} ORDER BY created_at DESC LIMIT 10`),
      prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT id, points_balance, gift_credit_balance, currency FROM kingdom_wallets WHERE user_id = ${session.user.id} LIMIT 1`),
      prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT id, score, max_score, points_awarded, completed_at FROM bible_quiz_attempts WHERE user_id = ${session.user.id} ORDER BY completed_at DESC LIMIT 10`),
      prisma.$queryRaw<Array<Record<string, any>>>(Prisma.sql`SELECT id, status, points_awarded, created_at FROM sanctuary_activity_completions WHERE user_id = ${session.user.id} ORDER BY created_at DESC LIMIT 10`),
    ]);

    const wallet = walletRows[0] || { points_balance: 0, gift_credit_balance: 0, currency: 'USD' };
    const spiritualScore = Math.min(
      100,
      20 + prayers.length * 4 + journalEntries.length * 3 + offerings.length * 2 + aiInteractions + activities.length + badges * 5 + children * 3 + sermonNotes.length * 4 + milestones.length * 5 + quizAttempts.length * 2 + activityCompletions.length * 2
    );

    const timeline = [
      ...prayers.map((p) => ({ type: 'Prayer', title: p.title, date: p.createdAt, meta: p.visibility })),
      ...journalEntries.map((j) => ({ type: 'Journal', title: j.title, date: j.createdAt, meta: j.mood || 'Reflection' })),
      ...offerings.map((o) => ({ type: 'Offering', title: `${o.purpose} ${o.amount} ${o.currency}`, date: o.createdAt, meta: o.status })),
      ...sermonNotes.map((s) => ({ type: 'Sermon Note', title: s.title, date: s.created_at, meta: (s.scripture_refs || []).join(', ') })),
      ...milestones.map((m) => ({ type: 'Milestone', title: m.title, date: m.achieved_at || m.created_at, meta: m.type })),
      ...careEscalations.map((c) => ({ type: 'Care', title: c.title, date: c.created_at, meta: `${c.urgency} · ${c.status}` })),
      ...quizAttempts.map((q) => ({ type: 'Bible Quiz', title: `Quiz score ${q.score}/${q.max_score}`, date: q.completed_at, meta: `${q.points_awarded} pts` })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 30);

    return NextResponse.json({
      spiritualScore,
      wallet,
      timeline,
      prayers,
      journalEntries,
      offerings,
      activities,
      goals,
      sermonNotes,
      milestones,
      careEscalations,
      quizAttempts,
      activityCompletions,
      metrics: {
        prayers: prayers.length,
        journalEntries: journalEntries.length,
        offerings: offerings.length,
        aiInteractions,
        badges,
        children,
        goals: goals.length,
        sermonNotes: sermonNotes.length,
        milestones: milestones.length,
        careEscalations: careEscalations.length,
        quizAttempts: quizAttempts.length,
        activityCompletions: activityCompletions.length,
        walletPoints: Number(wallet.points_balance || 0),
      },
    });
  } catch (error) {
    console.error('Journey fetch failed:', error);
    return NextResponse.json({ error: 'Failed to load journey' }, { status: 500 });
  }
}
